import redisClient from '../libs/redis.js';

export default class RateLimitRepository {
  #client;
  #keys;
  #incrementSendScript;
  #incrementAccountsScript;

  constructor() {
    this.#client = redisClient;

    this.#keys = {
      sendCount:    (phone, method) => `rate:send:phone:${phone}:${method}:count`,
      sendCooldown: (phone, method) => `rate:send:phone:${phone}:${method}:cd`,
      sendDeviceCount:    (deviceId) => `rate:send:device:${deviceId}:count`,
      sendDeviceCooldown: (deviceId) => `rate:send:device:${deviceId}:cd`,
      verify:       (phone, method) => `rate:verify:phone:${phone}:${method}`,
      verified:     (phone)    => `verified:${phone}`,
      accountsDevice: (fp)     => `accounts:device:${fp}`,
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

  #calcCooldown(attempts) {
    const map = { 1: 30, 2: 30, 3: 60, 4: 300, 5: 900, 6: 3600 };
    return map[attempts] ?? 86400;
  }

  async #deleteKey(key) {
    await this.#client.del(key);
  }

  // ─── Send ────────────────────────────────────────────────────────────────────

  async isSendOnCooldown(phone, method) {
    return (await this.#client.exists(this.#keys.sendCooldown(phone, method))) === 1;
  }

  async isDeviceOnCooldown(deviceId) {
    return (await this.#client.exists(this.#keys.sendDeviceCooldown(deviceId))) === 1;
  }

  async getSendCooldownTTL(phone, method, deviceId) {
    const [phoneTTL, deviceTTL] = await Promise.all([
      this.#client.ttl(this.#keys.sendCooldown(phone, method)),
      this.#client.ttl(this.#keys.sendDeviceCooldown(deviceId)),
    ]);
    const ttl = Math.max(Number(phoneTTL), Number(deviceTTL));
    return ttl > 0 ? ttl : 0;
  }

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

  async getVerifyAttempts(phone, method) {
    const val = await this.#client.get(this.#keys.verify(phone, method));
    return parseInt(val?.toString() ?? '0');
  }

  async incrementVerify(phone, method) {
    const count = await this.#client.incr(this.#keys.verify(phone, method));
    // TTL tied to OTP lifetime (15 min) — counter dies when OTP expires
    const ttl = Number(await this.#client.ttl(this.#keys.verify(phone, method)));
    if (ttl < 0) {
      await this.#client.expire(this.#keys.verify(phone, method), 900);
    }
    return { attempts: Number(count), cooldown: 0 };
  }

  async resetVerifyAttempts(phone, method) {
    await this.#deleteKey(this.#keys.verify(phone, method));
  }

  // ─── Verified ────────────────────────────────────────────────────────────────

  async setVerified(phone, ttlSeconds = 600) {
    await this.#client.set(this.#keys.verified(phone), '1', { EX: ttlSeconds });
  }

  async isVerified(phone) {
    return (await this.#client.get(this.#keys.verified(phone))) === '1';
  }

  async deleteVerified(phone) {
    await this.#deleteKey(this.#keys.verified(phone));
  }

  // ─── Accounts ────────────────────────────────────────────────────────────────

  async incrementAccounts(deviceId, ttlSeconds = 604800) {
    const deviceCount = await this.#client.eval(this.#incrementAccountsScript, {
      keys: [this.#keys.accountsDevice(deviceId)],
      arguments: [String(ttlSeconds)],
    });
    return { deviceCount: Number(deviceCount) };
  }

  async getAccountsAttempts(deviceId) {
    const val = await this.#client.get(this.#keys.accountsDevice(deviceId));
    const deviceCount = parseInt(val?.toString() ?? '0');
    return { deviceCount };
  }

  // ─── Reset ───────────────────────────────────────────────────────────────────

  async resetAfterSuccess(phone, method, deviceId) {
    await Promise.all([
      this.#deleteKey(this.#keys.sendCount(phone, method)),
      this.#deleteKey(this.#keys.sendCooldown(phone, method)),
      this.#deleteKey(this.#keys.sendDeviceCount(deviceId)),
      this.#deleteKey(this.#keys.sendDeviceCooldown(deviceId)),
      this.#deleteKey(this.#keys.verify(phone, method)),
    ]);
  }
}