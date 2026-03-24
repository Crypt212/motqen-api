/**
 * @fileoverview OTP Cache Repository - Handle OTP caching operations using Redis
 * @module repositories/cache/OTPCache
 */

import { RedisClientType } from "../../libs/redis.js";
import IOtpCache from "../interfaces/otpCache.js";
import { Method } from "../../domain/otp.entity.js";

/**
 * OTP Cache - Handles OTP caching operations using Redis
 * @class
 */
export default class OtpCache implements IOtpCache {
  /**
   * Key generators for OTP cache
   */
  private keys: { otp: ((phone: string, method: Method) => string) };

  /**
   * Creates an instance of OtpCache
   */
  constructor(private client: RedisClientType) {
    this.keys = {
      otp: (phone, method) => `otp:${phone}:${method}`,
    };
  }

  /**
   * Set OTP in cache with TTL
   */
  async setOtp(phone: string, method: Method, hashedOtp: string, ttlSeconds: number): Promise<string | {}> {
    const key = this.keys.otp(phone, method);
    return await this.client.set(key, hashedOtp, { EX: ttlSeconds });
  }

  /**
   * Get OTP from cache
   */
  async getOtp(phone: string, method: Method): Promise<string | {}> {
    const key = this.keys.otp(phone, method);
    const value = await this.client.get(key);
    return value;
  }

  /**
   * Check if OTP exists in cache
   */
  async otpExists(phone: string, method: Method): Promise<boolean> {
    const exists = await this.client.exists(this.keys.otp(phone, method));
    return exists === 1;
  }

  /**
   * Delete OTP from cache
   */
  async deleteOtp(phone: string, method: Method): Promise<number> {
    return Number(await this.client.del(this.keys.otp(phone, method)));
  }
}
