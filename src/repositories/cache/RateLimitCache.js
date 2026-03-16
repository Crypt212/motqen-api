/**
 * @fileoverview Rate Limit Cache Repository - Handle rate limiting operations using Redis
 * @module repositories/cache/RateLimitCache
 */

import * as pkg from '@prisma/client';

/** @typedef {import('redis').RedisClientType} RedisClient */

/**
 * Result object for increment operations
 * @typedef {Object} IncrementResult
 * @property {number} attempts - Number of attempts
 * @property {number} cooldown - Cooldown time in seconds
 */

/**
 * Result object for device count operations
 * @typedef {Object} DeviceCountResult
 * @property {number} deviceCount - Number of accounts on device
 */

/**
 * Rate Limit Cache - Handles rate limiting and account tracking using Redis
 * @class
 */
export default class RateLimitCache {
  /** @type {RedisClient} */
  #client;

  /**
   * Key generators for rate limit cache
   * @type {Object}
   */
  #keys;

  /** @type {string} */
  #incrementSendScript;

  /** @type {string} */
  #incrementAccountsScript;

  /**
   * Creates an instance of RateLimitCache
   * @param {RedisClient} [redisClient=redisClient] - Redis client instance
   */
  constructor(redisClient) {
    this.#client = redisClient;

    this.#keys = {
      /** @param {string} phone - Phone number
       * @param {pkg.$Enums.Method} method - OTP method
       * @returns {string}
       */
      sendCount: (phone, method) => `rate:send:phone:${phone}:${method}:count`,
      /** @param {string} phone - Phone number
       * @param {pkg.$Enums.Method} method - OTP method
       * @returns {string}
       */
      sendCooldown: (phone, method) => `rate:send:phone:${phone}:${method}:cd`,
      /** @param {string} deviceId - Device identifier
       * @returns {string}
       */
      sendDeviceCount: (deviceId) => `rate:send:device:${deviceId}:count`,
      /** @param {string} deviceId - Device identifier
       * @returns {string}
       */
      sendDeviceCooldown: (deviceId) => `rate:send:device:${deviceId}:cd`,
      /** @param {string} phone - Phone number
       * @param {pkg.$Enums.Method} method - OTP method
       * @returns {string}
       */
      verify: (phone, method) => `rate:verify:phone:${phone}:${method}`,
      /** @param {string} phone - Phone number
       * @returns {string}
       */
      verified: (phone) => `verified:${phone}`,
      /** @param {string} fp - Device fingerprint
       * @returns {string}
       */
      accountsDevice: (fp) => `accounts:device:${fp}`,
    };

    // Atomic: INCR counter (24h fixed) + SET cooldown (escalating TTL)
    // KEYS[1] = counter key, KEYS[2] = cooldown key
    // ARGV[1] = cooldown map JSON
    this.#incrementSendScript = `
      local count = redis.call('INCR', KEYS[1])
      if count == 1 then
        redis.call('EXPIRE', KEYS[1], 86400)
      end
      local cooldowns = cjson.decode(ARGV[1])
      local cd = cooldowns[tostring(count)] or cooldowns['default']
      redis.call('SET', KEYS[2], '1', 'EX', tonumber(cd))
      return count
    `;

    // INCR + EXPIRE only on first increment
    this.#incrementAccountsScript = `
      local c = redis.call('INCR', KEYS[1])
      if c == 1 then redis.call('EXPIRE', KEYS[1], tonumber(ARGV[1])) end
      return c
    `;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Generate cooldown map JSON for escalating cooldowns
   * @returns {string} JSON string of cooldown mapping
   */
  #cooldownMap() {
    return JSON.stringify({
      '1': 30,
      '2': 30,
      '3': 60,
      '4': 300,
      '5': 900,
      '6': 3600,
      default: 86400,
    });
  }

  /**
   * Calculate cooldown based on attempt count
   * @param {number} attempts - Number of attempts
   * @returns {number} Cooldown time in seconds
   */
  #calcCooldown(attempts) {
    const map = { 1: 30, 2: 30, 3: 60, 4: 300, 5: 900, 6: 3600 };
    return map[attempts] ?? 86400;
  }

  /**
   * Delete a key from Redis
   * @async
   * @param {string} key - Redis key to delete
   * @returns {Promise<number>} Number of keys deleted
   */
  async #deleteKey(key) {
    return await this.#client.del(key);
  }

  // ─── Send ───────────────────────────────────────────────────────────────────

  /**
   * Check if send OTP is on cooldown for phone/method
   * @async
   * @param {string} phone - Phone number
   * @param {pkg.$Enums.Method} method - OTP method
   * @returns {Promise<boolean>} True if on cooldown
   */
  async isSendOnCooldown(phone, method) {
    const key = this.#keys.sendCooldown(phone, method);
    const found = await this.#client.exists(key);
    return found === 1;
  }

  /**
   * Check if send OTP is on cooldown for device
   * @async
   * @param {string} deviceId - Device identifier
   * @returns {Promise<boolean>} True if on cooldown
   */
  async isDeviceOnCooldown(deviceId) {
    return (await this.#client.exists(this.#keys.sendDeviceCooldown(deviceId))) === 1;
  }

  /**
   * Get the TTL of send cooldown for phone or device
   * @async
   * @param {string} phone - Phone number
   * @param {pkg.$Enums.Method} method - OTP method
   * @param {string} deviceId - Device identifier
   * @returns {Promise<number>} Maximum TTL in seconds
   */
  async getSendCooldownTTL(phone, method, deviceId) {
    const [phoneTTL, deviceTTL] = await Promise.all([
      this.#client.ttl(this.#keys.sendCooldown(phone, method)),
      this.#client.ttl(this.#keys.sendDeviceCooldown(deviceId)),
    ]);
    const ttl = Math.max(Number(phoneTTL), Number(deviceTTL));
    return ttl > 0 ? ttl : 0;
  }

  /**
   * Increment send attempt counter for phone/method and device
   * @async
   * @param {string} phone - Phone number
   * @param {pkg.$Enums.Method} method - OTP method
   * @param {string} deviceId - Device identifier
   * @returns {Promise<IncrementResult>} Attempts count and cooldown time
   */
  async incrementSend(phone, method, deviceId) {
    const [phoneCount] = await Promise.all([
      this.#client.eval(this.#incrementSendScript, {
        keys: [this.#keys.sendCount(phone, method), this.#keys.sendCooldown(phone, method)],
        arguments: [this.#cooldownMap()],
      }),
      this.#client.eval(this.#incrementSendScript, {
        keys: [this.#keys.sendDeviceCount(deviceId), this.#keys.sendDeviceCooldown(deviceId)],
        arguments: [this.#cooldownMap()],
      }),
    ]);
    const count = Number(phoneCount);
    return { attempts: count, cooldown: this.#calcCooldown(count) };
  }

  // ─── Verify ──────────────────────────────────────────────────────────────────

  /**
   * Get verification attempts for phone/method
   * @async
   * @param {string} phone - Phone number
   * @param {pkg.$Enums.Method} method - OTP method
   * @returns {Promise<number>} Number of verification attempts
   */
  async getVerifyAttempts(phone, method) {
    const val = await this.#client.get(this.#keys.verify(phone, method));
    return parseInt(val?.toString() ?? '0');
  }

  /**
   * Increment verification attempt counter
   * @async
   * @param {string} phone - Phone number
   * @param {pkg.$Enums.Method} method - OTP method
   * @returns {Promise<IncrementResult>} Attempts count and cooldown time
   */
  async incrementVerify(phone, method) {
    const count = await this.#client.incr(this.#keys.verify(phone, method));
    // TTL tied to OTP lifetime (15 min) — counter dies when OTP expires
    const ttl = Number(await this.#client.ttl(this.#keys.verify(phone, method)));
    if (ttl < 0) {
      await this.#client.expire(this.#keys.verify(phone, method), 900);
    }
    return { attempts: Number(count), cooldown: 0 };
  }

  /**
   * Reset verification attempts for phone/method
   * @async
   * @param {string} phone - Phone number
   * @param {pkg.$Enums.Method} method - OTP method
   * @returns {Promise<void>}
   */
  async resetVerifyAttempts(phone, method) {
    await this.#deleteKey(this.#keys.verify(phone, method));
  }

  // ─── Verified ────────────────────────────────────────────────────────────────

  /**
   * Set phone as verified with TTL
   * @async
   * @param {string} phone - Phone number
   * @param {number} [ttlSeconds=600] - Time to live in seconds (default 10 minutes)
   */
  async setVerified(phone, ttlSeconds = 600) {
    await this.#client.set(this.#keys.verified(phone), '1', { EX: ttlSeconds });
  }

  /**
   * Check if phone is verified
   * @async
   * @param {string} phone - Phone number
   * @returns {Promise<boolean>} True if verified
   */
  async isVerified(phone) {
    return (await this.#client.get(this.#keys.verified(phone))) === '1';
  }

  /**
   * Delete verified status for phone
   * @async
   * @param {string} phone - Phone number
   * @returns {Promise<number>} Number of keys deleted
   */
  async deleteVerified(phone) {
    return await this.#deleteKey(this.#keys.verified(phone));
  }

  // ─── Accounts ────────────────────────────────────────────────────────────────

  /**
   * Increment account creation attempts for device
   * @async
   * @param {string} deviceId - Device identifier
   * @param {number} [ttlSeconds=604800] - Time to live in seconds (default 7 days)
   * @returns {Promise<DeviceCountResult>} Device account count
   */
  async incrementAccounts(deviceId, ttlSeconds = 604800) {
    const deviceCount = await this.#client.eval(this.#incrementAccountsScript, {
      keys: [this.#keys.accountsDevice(deviceId)],
      arguments: [String(ttlSeconds)],
    });
    return { deviceCount: Number(deviceCount) };
  }

  /**
   * Get account creation attempts for device
   * @async
   * @param {string} deviceId - Device identifier
   * @returns {Promise<DeviceCountResult>} Device account count
   */
  async getAccountsAttempts(deviceId) {
    const val = await this.#client.get(this.#keys.accountsDevice(deviceId));
    const deviceCount = parseInt(val?.toString() ?? '0');
    return { deviceCount };
  }

  // ─── Reset ─────────────────────────────────────────────────────────────────

  /**
   * Reset rate limit state after successful verification
   * @async
   * @param {string} phone - Phone number
   * @param {pkg.$Enums.Method} method - OTP method
   * @param {string} deviceId - Device identifier
   * @returns {Promise<void>}
   */
  async resetAfterSuccess(phone, method, deviceId) {
    await Promise.all([
      this.#deleteKey(this.#keys.verify(phone, method)),
    ]);
  }
}
