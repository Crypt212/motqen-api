/**
 * @fileoverview Rate Limit Service - Handle rate limiting for API endpoints
 * @module services/RateLimitService
 */

// RateLimitService.js

import AppError from "../errors/AppError.js";
import Service from "./Service.js";
import environment from "../configs/environment.js";

const MAX_VERIFY_ATTEMPTS = 5;

/**
 * RateLimit Service - Manages rate limiting for OTP and API requests
 * @class
 * @extends Service
 */
export default class RateLimitService extends Service {
  #repository;

  constructor(rateLimitRepository) {
    super();
    this.#repository = rateLimitRepository;
  }

  /** Window and max for general API rate limit (from config or defaults) */
  #apiWindowSeconds() {
    const { windowMs, max } = environment.api.rateLimit ?? {};
    return { windowSeconds: (windowMs ?? 15 * 60 * 1000) / 1000, max: max ?? 100 };
  }

  /**
   * Check if OTP send request is allowed for the given phone and device
   * @async
   * @method checkSendOtp
   * @param {string} phone - User's phone number
   * @param {string} deviceId - Device identifier
   * @returns {Promise<void>}
   * @throws {AppError} If rate limit is exceeded
   */
  async checkSendOtp(phone, deviceId) {
    const [phoneRecord, deviceRecord] = await Promise.all([
      this.#repository.getSendRecord(phone),
      this.#repository.getDeviceRecord(deviceId),
    ]);

    for (const record of [phoneRecord, deviceRecord]) {
      if (record.blockedUntil) {
        const elapsed     = (Date.now() - record.lastAttempt) / 1000;
        const retryAfter  = Math.ceil(record.blockedUntil - elapsed);
        if (retryAfter > 0) {
          throw new AppError("Too many requests", 429, { retryAfter });
        }
      }
    }
  }


  /**
   * Increment the send OTP attempt count
   * @async
   * @method incrementSend
   * @param {string} phone - User's phone number
   * @param {string} deviceId - Device identifier
   * @returns {Promise<void>}
   */
  async incrementSend(phone, deviceId) {
    return this.#repository.incrementSend(phone, deviceId);
  }


  /**
   * Check if OTP verification attempt is allowed
   * @async
   * @method checkVerify
   * @param {string} phone - User's phone number
   * @returns {Promise<void>}
   * @throws {AppError} If too many verification attempts
   */
  async checkVerify(phone) {
    const record   = await this.#repository.getVerifyRecord(phone);
    const attempts = record.attempts ?? 0;

    if (attempts >= MAX_VERIFY_ATTEMPTS) {
      const elapsed    = (Date.now() - record.lastAttempt) / 1000;
      const retryAfter = 0;
      if (retryAfter > 0) {
        throw new AppError(`Too many verification attempts `, 429, { retryAfter:retryAfter / 60 });
      }
    }
  }


  /**
   * Increment the verification attempt count
   * @async
   * @method incrementVerify
   * @param {string} phone - User's phone number
   * @returns {Promise<{attempts: number, remaining: number, blocked: boolean}>} Current rate limit status
   */
  async incrementVerify(phone) {
    const record = await this.#repository.incrementVerify(phone);

    return {
      attempts:  record.attempts,
      remaining: Math.max(0, MAX_VERIFY_ATTEMPTS - record.attempts),
      blocked:   record.attempts >= MAX_VERIFY_ATTEMPTS,
    };
  }


  /**
   * Reset rate limits for a phone and device
   * @async
   * @method reset
   * @param {string} phone - User's phone number
   * @param {string} deviceId - Device identifier
   * @returns {Promise<void>}
   */
  async reset(phone, deviceId) {
    await this.#repository.reset(phone, deviceId);
  }

  /**
   * Check general API rate limit by key (e.g. IP). Throws 429 if over limit.
   * @param {string} key - Identifier (e.g. IP address)
   * @param {Object} [options] - Optional custom rate limit config
   * @param {number} [options.windowMs] - Window size in milliseconds (overrides config)
   * @param {number} [options.max] - Max requests per window (overrides config)
   */
  async checkApi(key, options) {
    const { windowSeconds, max } = options?.windowMs
      ? { windowSeconds: options.windowMs / 1000, max: options.max ?? 100 }
      : this.#apiWindowSeconds();
    const record = await this.#repository.getApiRecord(key);
    const now = Date.now();
    const windowStart = record.windowStart ?? 0;
    if (now - windowStart >= windowSeconds * 1000) return; // new window
    const attempts = record.attempts ?? 0;
    if (attempts >= max) {
      const retryAfter = Math.ceil(windowSeconds - (now - windowStart) / 1000);
      throw new AppError("Too many requests", 429, { retryAfter: Math.max(1, retryAfter) });
    }
  }

  /**
   * Increment general API usage for key. Call after checkApi when request is allowed.
   * @param {string} key - Identifier (e.g. IP address)
   * @param {Object} [options] - Optional custom rate limit config
   * @param {number} [options.windowMs] - Window size in milliseconds (overrides config)
   */
  async incrementApi(key, options) {
    const windowSeconds = options?.windowMs
      ? options.windowMs / 1000
      : this.#apiWindowSeconds().windowSeconds;
    return this.#repository.incrementApi(key, windowSeconds);
  }
}