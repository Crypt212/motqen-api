import redisClient from '../libs/redis.js';

export default class RateLimitRepository {
  #client;
  #keys;

  constructor() {
    this.#client = redisClient;

    this.#keys = {
      send: (phone) => `rate:send:phone:${phone}`,
      sendDevice: (deviceId) => `rate:send:device:${deviceId}`,
      verify: (phone) => `rate:verify:phone:${phone}`,
      api: (key) => `rate:api:${key}`,
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  async #getRecord(key) {
    const raw = await this.#client.get(key);
    return JSON.parse(raw?.toString() || '{}');
  }

  async #setRecord(key, record, ttlSeconds) {
    const safeTtl = Math.max(ttlSeconds, 1);
    await this.#client.set(key, JSON.stringify(record), { EX: safeTtl });
  }

  async #deleteKey(key) {
    await this.#client.del(key);
  }

  #calcCooldown(attempts) {
    switch (attempts) {
      case 1:
        return 0;
      case 2:
        return 30;
      case 3:
        return 60;
      case 4:
        return 300;
      case 5:
        return 900;
      case 6:
        return 3600;
      default:
        return 86400;
    }
  }

  // ─── Send ──────────────────────────────────────────────────────────────────

  async getSendRecord(phone) {
    return await this.#getRecord(this.#keys.send(phone));
  }

  async getDeviceRecord(deviceId) {
    return await this.#getRecord(this.#keys.sendDevice(deviceId));
  }

  async incrementSend(phone, deviceId) {
    const increment = async (key) => {
      const record = await this.#getRecord(key);
      record.attempts = (record.attempts ?? 0) + 1;
      record.lastAttempt = Date.now();
      record.blockedUntil = this.#calcCooldown(record.attempts);
      await this.#setRecord(key, record, record.blockedUntil);
      return record;
    };

    const [phoneRecord] = await Promise.all([
      increment(this.#keys.send(phone)),
      increment(this.#keys.sendDevice(deviceId)),
    ]);

    return phoneRecord;
  }

  // ─── Verify ────────────────────────────────────────────────────────────────

  async getVerifyRecord(phone) {
    return this.#getRecord(this.#keys.verify(phone));
  }

  async incrementVerify(phone) {
    const key = this.#keys.verify(phone);
    const record = await this.#getRecord(key);

    record.attempts = (record.attempts ?? 0) + 1;
    record.lastAttempt = Date.now();
    record.blockedUntil = this.#calcCooldown(record.attempts);

    await this.#setRecord(key, record, record.blockedUntil);
    return record;
  }

  // ─── Reset ─────────────────────────────────────────────────────────────────

  async reset(phone, deviceId) {
    await Promise.all([
      this.#deleteKey(this.#keys.send(phone)),
      this.#deleteKey(this.#keys.sendDevice(deviceId)),
      this.#deleteKey(this.#keys.verify(phone)),
    ]);
  }
}
