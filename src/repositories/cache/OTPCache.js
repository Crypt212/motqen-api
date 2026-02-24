import redisClient from '../../libs/redis.js';

export default class OtpCache {
  #client;
  #keys;

  constructor() {
    this.#client = redisClient;
    this.#keys = {
      otp: (phone, method) => `otp:${phone}:${method}`,
    };
  }

  async setOtp(phone, method, hashedOtp, ttlSeconds) {

    await this.#client.set(
      this.#keys.otp(phone, method),
      hashedOtp,
      { EX: ttlSeconds }
    );
  }

  async getOtp(phone, method) {
    return await this.#client.get(this.#keys.otp(phone, method));
  }

  async otpExists(phone, method) {
    const exists = await this.#client.exists(this.#keys.otp(phone, method));
    return exists === 1;
  }

  async deleteOtp(phone, method) {
    await this.#client.del(this.#keys.otp(phone, method));
  }
}
