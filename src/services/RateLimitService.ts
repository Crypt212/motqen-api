/**
 * @fileoverview Rate Limit Service - Handle rate limiting for API endpoints
 * @module services/RateLimitService
 */

import AppError from '../errors/AppError.js';
import Service from './Service.js';
import IRateLimitCache from '../cache/interfaces/RateLimitCache.js';
import { Method } from 'src/domain/otp.entity.js';
import { DeviceID } from 'src/types/asyncHandler.js';
import { OTPErrorDetails } from 'src/errors/appErrorDetails/OTPDetails.js';

const MAX_VERIFY_ATTEMPTS = 5;

/**
 * RateLimit Service - Manages rate limiting for OTP and API requests
 * @class
 * @extends Service
 */
export default class RateLimitService extends Service {
  private repository: IRateLimitCache;

  constructor(params: { rateLimitCache: IRateLimitCache }) {
    super();
    this.repository = params.rateLimitCache;
  }

  /**
   * Check if OTP send request is allowed for the given phone and device
   * @throws {AppError} If rate limit is exceeded
   */
  async checkSendOtp(phone: string, method: Method, deviceId: DeviceID): Promise<void> {
    const [phoneCooldown, deviceCooldown] = await Promise.all([
      this.repository.isSendOnCooldown(phone, method),
      this.repository.isDeviceOnCooldown(deviceId),
    ]);

    if (phoneCooldown || deviceCooldown) {
      const retryAfter = await this.repository.getSendCooldownTTL(phone, method, deviceId);
      throw new AppError(
        `Too many requests, retry after ${retryAfter} seconds`,
        429,
        new OTPErrorDetails({ type: 'TOO_MANY_VERIFICATION_REQUESTS', retryAfter })
      );
    }
  }

  /**
   * Increment the send OTP attempt count
   */
  async incrementSend(
    phone: string,
    method: Method,
    deviceId: DeviceID
  ): Promise<{ attempts: number; cooldown: number }> {
    return this.repository.incrementSend(phone, method, deviceId);
  }

  /**
   * Check if OTP verification attempt is allowed
   * @throws {AppError} If too many verification attempts
   */
  async checkVerify(phone: string, method: Method): Promise<void> {
    const attempts = await this.repository.getVerifyAttempts(phone, method);
    if (attempts >= MAX_VERIFY_ATTEMPTS) {
      throw new AppError(
        'Too many verification attempts, please request a new OTP',
        429,
        new OTPErrorDetails({ type: 'FAILED_ATTEMPT', remainingAttempts: 0, requestNewOtp: true })
      );
    }
  }

  /**
   * Increment the verification attempt count
   */
  async incrementVerify(
    phone: string,
    method: Method
  ): Promise<{ attempts: number; remaining: number; blocked: boolean }> {
    const record = await this.repository.incrementVerify(phone, method);

    return {
      attempts: record.attempts,
      remaining: Math.max(0, MAX_VERIFY_ATTEMPTS - record.attempts),
      blocked: record.attempts >= MAX_VERIFY_ATTEMPTS,
    };
  }

  /**
   * Reset rate limits for a phone and device
   */
  async reset(phone: string, method: Method, deviceId: DeviceID): Promise<void> {
    await this.repository.resetAfterSuccess(phone, method, deviceId);
  }
}
