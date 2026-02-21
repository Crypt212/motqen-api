import redisClient from '../libs/redis.js';

export default class OTPRepository {
  #client;
  #keys;

  constructor() {
    this.#client = redisClient;

    this.#keys = {
      otp: (phoneNumber, method) => `otp:${phoneNumber}:${method}`,
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

  async getRecord(phone, method) {
    return await this.#getRecord(this.#keys.otp(phone));
  }
  async getOTP(phone, method) {
    return (await this.#getRecord(this.#keys.otp(phone))).otp;
  }

  async deleteOTPRecord(phone, method) {
    return this.#deleteKey(this.#keys.otp(phone));
  }

  async upsertOTP(phone, method, newOTP) {
    const increment = async (phone) => {
      const record = await this.getRecord(this.#keys.otp(phone, method));
      record.attempts = (record.attempts ?? 0) + 1;
      record.lastAttempt = Date.now();
      record.expiresAt = Date.now() + this.#calcCooldown(record.attempts);
      record.otp = newOTP;
      record.method = method;
      await this.#setRecord(this.#keys.otp(phone, method), record, this.#calcCooldown(record.attempts));
      return record;
    };

    return await increment(this.#keys.otp(phone));
  }


}
