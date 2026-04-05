/**
 * @fileoverview Rate Limit Cache Repository - Handle rate limiting operations using Redis
 * @module repositories/cache/RateLimitCache
 */

import IRateLimitCache from '../interfaces/RateLimitCache.js';
import { RedisClientType } from '../../libs/redis.js';
import { Method } from '../../domain/otp.entity.js';
import { DeviceID } from '../../types/asyncHandler.js';
import { RateLimiterRedis } from 'rate-limiter-flexible';

/**
 * Rate Limit Cache - Handles rate limiting and account tracking using Redis
 * @class
 */
export default class RateLimitCache implements IRateLimitCache {
  /**
   * Key generators for rate limit cache
   */
  private keys: {
    sendCount: (phone: string, method: Method) => string;
    sendCooldown: (phone: string, method: Method) => string;
    sendDeviceCount: (deviceId: DeviceID) => string;
    sendDeviceCooldown: (deviceId: DeviceID) => string;
    verify: (phone: string, method: Method) => string;
    verified: (phone: string) => string;
    accountsDevice: (fp: string) => string;
  };
  private incrementSendScript: string;
  private incrementAccountsScript: string;
  private socketLimiters: Map<string, RateLimiterRedis> = new Map();

  /**
   * Creates an instance of RateLimitCache
   */
  constructor(private readonly client: RedisClientType) {
    this.keys = {
      sendCount: (phone: string, method: Method) => `rate:send:phone:${phone}:${method}:count`,
      sendCooldown: (phone: string, method: Method) => `rate:send:phone:${phone}:${method}:cd`,
      sendDeviceCount: (deviceId: DeviceID) => `rate:send:device:${deviceId}:count`,
      sendDeviceCooldown: (deviceId: DeviceID) => `rate:send:device:${deviceId}:cd`,
      verify: (phone: string, method: Method) => `rate:verify:phone:${phone}:${method}`,
      verified: (phone: string) => `verified:${phone}`,
      accountsDevice: (fp: string) => `accounts:device:${fp}`,
    };

    // Atomic: INCR counter (24h fixed) + SET cooldown (escalating TTL)
    // KEYS[1] = counter key, KEYS[2] = cooldown key
    // ARGV[1] = cooldown map JSON
    this.incrementSendScript = `
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
    this.incrementAccountsScript = `
      local c = redis.call('INCR', KEYS[1])
      if c == 1 then redis.call('EXPIRE', KEYS[1], tonumber(ARGV[1])) end
      return c
    `;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Generate cooldown map JSON for escalating cooldowns
   */
  private cooldownMap(): string {
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
   */
  private calcCooldown(attempts: number): number {
    const map = { 1: 30, 2: 30, 3: 60, 4: 300, 5: 900, 6: 3600 };
    return map[attempts] ?? 86400;
  }

  /**
   * Delete a key from Redis
   */
  private async deleteKey(key: string): Promise<number> {
    return Number(await this.client.del(key));
  }

  // ─── Send ───────────────────────────────────────────────────────────────────

  /**
   * Check if send OTP is on cooldown for phone/method
   */
  async isSendOnCooldown(phone: string, method: Method) {
    const key = this.keys.sendCooldown(phone, method);
    const found = await this.client.exists(key);
    return found === 1;
  }

  /**
   * Check if send OTP is on cooldown for device
   */
  async isDeviceOnCooldown(deviceId: DeviceID) {
    return (await this.client.exists(this.keys.sendDeviceCooldown(deviceId))) === 1;
  }

  /**
   * Get the TTL of send cooldown for phone or device
   */
  async getSendCooldownTTL(phone: string, method: Method, deviceId: DeviceID) {
    const [phoneTTL, deviceTTL] = await Promise.all([
      this.client.ttl(this.keys.sendCooldown(phone, method)),
      this.client.ttl(this.keys.sendDeviceCooldown(deviceId)),
    ]);
    const ttl = Math.max(Number(phoneTTL), Number(deviceTTL));
    return ttl > 0 ? ttl : 0;
  }

  /**
   * Increment send attempt counter for phone/method and device
   */
  async incrementSend(phone: string, method: Method, deviceId: DeviceID) {
    const [phoneCount] = await Promise.all([
      this.client.eval(this.incrementSendScript, {
        keys: [this.keys.sendCount(phone, method), this.keys.sendCooldown(phone, method)],
        arguments: [this.cooldownMap()],
      }),
      this.client.eval(this.incrementSendScript, {
        keys: [this.keys.sendDeviceCount(deviceId), this.keys.sendDeviceCooldown(deviceId)],
        arguments: [this.cooldownMap()],
      }),
    ]);
    const count = Number(phoneCount);
    return { attempts: count, cooldown: this.calcCooldown(count) };
  }

  // ─── Verify ──────────────────────────────────────────────────────────────────

  /**
   * Get verification attempts for phone/method
   */
  async getVerifyAttempts(phone: string, method: Method) {
    const val = await this.client.get(this.keys.verify(phone, method));
    return parseInt(val?.toString() ?? '0');
  }

  /**
   * Increment verification attempt counter
   */
  async incrementVerify(phone: string, method: Method) {
    const count = await this.client.incr(this.keys.verify(phone, method));
    // TTL tied to OTP lifetime (15 min) — counter dies when OTP expires
    const ttl = Number(await this.client.ttl(this.keys.verify(phone, method)));
    if (ttl < 0) {
      await this.client.expire(this.keys.verify(phone, method), 900);
    }
    return { attempts: Number(count), cooldown: 0 };
  }

  /**
   * Reset verification attempts for phone/method
   */
  async resetVerifyAttempts(phone: string, method: Method) {
    await this.deleteKey(this.keys.verify(phone, method));
  }

  // ─── Verified ────────────────────────────────────────────────────────────────

  /**
   * Set phone as verified with TTL
   */
  async setVerified(phone: string, ttlSeconds = 600) {
    await this.client.set(this.keys.verified(phone), '1', { EX: ttlSeconds });
  }

  /**
   * Check if phone is verified
   */
  async isVerified(phone: string) {
    return (await this.client.get(this.keys.verified(phone))) === '1';
  }

  /**
   * Delete verified status for phone
   */
  async deleteVerified(phone: string) {
    return await this.deleteKey(this.keys.verified(phone));
  }

  // ─── Accounts ────────────────────────────────────────────────────────────────

  /**
   * Increment account creation attempts for device
   */
  async incrementAccounts(deviceId: DeviceID, ttlSeconds: number = 604800) {
    const deviceCount = await this.client.eval(this.incrementAccountsScript, {
      keys: [this.keys.accountsDevice(deviceId)],
      arguments: [String(ttlSeconds)],
    });
    return { deviceCount: Number(deviceCount) };
  }

  /**
   * Get account creation attempts for device
   */
  async getAccountsAttempts(deviceId: DeviceID) {
    const val = await this.client.get(this.keys.accountsDevice(deviceId));
    const deviceCount = parseInt(val?.toString() ?? '0');
    return { deviceCount };
  }

  // ─── Reset ─────────────────────────────────────────────────────────────────

  /**
   * Reset rate limit state after successful verification
   */
  async resetAfterSuccess(phone: string, method: Method) {
    await Promise.all([this.deleteKey(this.keys.verify(phone, method))]);
  }

  // ─── Socket ────────────────────────────────────────────────────────────────

  /**
   * Consume a point for a socket event.
   * Throws an error (from rate-limiter-flexible) if exceeded.
   * Resolves (fail-open) if Redis connection drops.
   */
  async consumeSocketEvent(userId: string, event: string, points: number, durationSeconds: number): Promise<void> {
    try {
      const keyPrefix = `socket:rl:${event}`;
      let limiter = this.socketLimiters.get(keyPrefix);
      
      if (!limiter) {
        limiter = new RateLimiterRedis({
          storeClient: this.client,
          keyPrefix,
          points,
          duration: durationSeconds,
        });
        this.socketLimiters.set(keyPrefix, limiter);
      }

      await limiter.consume(userId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Internal Redis or connection error -> Fail Open
        return;
      }
      // Rate limit exceeded (RateLimiterRes thrown) -> Re-throw
      throw err;
    }
  }
}
