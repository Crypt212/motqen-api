/**
 * @fileoverview OTP Cache Repository - Handle OTP caching operations using Redis
 * @module repositories/cache/OTPCache
 */


/** @typedef {import('redis').RedisClientType} RedisClient */

/**
 * OTP Method type
 * @typedef {'SMS' | 'WHATSAPP'} OTPMethod
 */

/**
 * OTP Cache - Handles OTP caching operations using Redis
 * @class
 */
export default class OtpCache {
  /** @type {RedisClient} */
  #client;

  /**
   * Key generators for OTP cache
   * @type {Object}
   * @property {function(string, OTPMethod): string} otp - Generate OTP key
   */
  #keys;

  /**
   * Creates an instance of OtpCache
   * @param {RedisClient} [redisClient=redisClient] - Redis client instance
   */
  constructor(redisClient) {
    this.#client = redisClient;
    this.#keys = {
      /** @param {string} phone - Phone number
       * @param {OTPMethod} method - OTP method
       * @returns {string}
       */
      otp: (phone, method) => `otp:${phone}:${method}`,
    };
  }

  /**
   * Set OTP in cache with TTL
   * @async
   * @param {string} phone - Phone number
   * @param {OTPMethod} method - OTP method (SMS or WHATSAPP)
   * @param {string} hashedOtp - Hashed OTP value
   * @param {number} ttlSeconds - Time to live in seconds
   * @returns {Promise<string | {}>} Redis SET response
   */
  async setOtp(phone, method, hashedOtp, ttlSeconds) {
    const key = this.#keys.otp(phone, method);
    return await this.#client.set(key, hashedOtp, { EX: ttlSeconds });
  }

  /**
   * Get OTP from cache
   * @async
   * @param {string} phone - Phone number
   * @param {OTPMethod} method - OTP method (SMS or WHATSAPP)
   * @returns {Promise<string|{}>} Cached OTP value or null
   */
  async getOtp(phone, method) {
    const key = this.#keys.otp(phone, method);
    const value = await this.#client.get(key);
    return value;
  }

  /**
   * Check if OTP exists in cache
   * @async
   * @param {string} phone - Phone number
   * @param {OTPMethod} method - OTP method (SMS or WHATSAPP)
   * @returns {Promise<boolean>} True if OTP exists
   */
  async otpExists(phone, method) {
    const exists = await this.#client.exists(this.#keys.otp(phone, method));
    return exists === 1;
  }

  /**
   * Delete OTP from cache
   * @async
   * @param {string} phone - Phone number
   * @param {OTPMethod} method - OTP method (SMS or WHATSAPP)
   * @returns {Promise<number>} Number of keys deleted
   */
  async deleteOtp(phone, method) {
    return await this.#client.del(this.#keys.otp(phone, method));
  }
}
