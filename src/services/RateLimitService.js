/**
 * @fileoverview Rate Limit Service - Handle rate limiting for API endpoints
 * @module services/RateLimitService
 */

import * as pkg from '@prisma/client';
import AppError from '../errors/AppError.js';
import Service from './Service.js';
import RateLimitCache from '../repositories/cache/RateLimitCache.js';

const MAX_VERIFY_ATTEMPTS = 5;

/**
 * RateLimit Service - Manages rate limiting for OTP and API requests
 * @class
 * @extends Service
 */
export default class RateLimitService extends Service {
  #repository;

  /**
   * @param {Object} params
   * @param {RateLimitCache} params.rateLimitCache
   */
  constructor({ rateLimitCache }) {
    super();
    this.#repository = rateLimitCache;
  }

  /**
   * Check if OTP send request is allowed for the given phone and device
   * @async
   * @method checkSendOtp
   * @param {string} phone - User's phone number
   * @param {pkg.$Enums.Method} method - OTP delivery method
   * @param {string} deviceId - Device identifier
   * @returns {Promise<void>}
   * @throws {AppError} If rate limit is exceeded
   */
  async checkSendOtp(phone, method, deviceId) {
    const [phoneCooldown, deviceCooldown] = await Promise.all([
      this.#repository.isSendOnCooldown(phone, method),
      this.#repository.isDeviceOnCooldown(deviceId),
    ]);

    if (phoneCooldown || deviceCooldown) {
      const retryAfter = await this.#repository.getSendCooldownTTL(
        phone,
        method,
        deviceId
      );
      throw new AppError(
        `Too many requests, retry after ${retryAfter} seconds`,
        429,
        { retryAfter }
      );
    }
  }

  /**
   * Increment the send OTP attempt count
   * @async
   * @method incrementSend
   * @param {string} phone - User's phone number
   * @param {pkg.$Enums.Method} method - OTP delivery method
   * @param {string} deviceId - Device identifier
   * @returns {Promise<{attempts: number, cooldown: number}>}
   */
  async incrementSend(phone, method, deviceId) {
    return this.#repository.incrementSend(phone, method, deviceId);
  }

  /**
   * Check if OTP verification attempt is allowed
   * @async
   * @method checkVerify
   * @param {string} phone - User's phone number
   * @param {pkg.$Enums.Method} method - The method of OTP delivery
   * @returns {Promise<void>}
   * @throws {AppError} If too many verification attempts
   */
  async checkVerify(phone, method) {
    const attempts = await this.#repository.getVerifyAttempts(phone, method);
    if (attempts >= MAX_VERIFY_ATTEMPTS) {
      throw new AppError(
        'Too many verification attempts, please request a new OTP',
        429,
        { remainingAttempts: 0, requestNewOtp: true }
      );
    }
  }

  /**
   * Increment the verification attempt count
   * @async
   * @method incrementVerify
   * @param {string} phone - User's phone number
   * @param {pkg.$Enums.Method} method - The method of OTP delivery
   * @returns {Promise<{attempts: number, remaining: number, blocked: boolean}>} Current rate limit status
   */
  async incrementVerify(phone, method) {
    const record = await this.#repository.incrementVerify(phone, method);

    return {
      attempts: record.attempts,
      remaining: Math.max(0, MAX_VERIFY_ATTEMPTS - record.attempts),
      blocked: record.attempts >= MAX_VERIFY_ATTEMPTS,
    };
  }

  /**
   * Reset rate limits for a phone and device
   * @async
   * @method reset
   * @param {string} phone - User's phone number
   * @param {pkg.$Enums.Method} method - The method of OTP delivery
   * @param {string} deviceId - Device identifier
   * @returns {Promise<void>}
   */
  async reset(phone, method, deviceId) {
    await this.#repository.resetAfterSuccess(phone, method, deviceId);
  }
}
