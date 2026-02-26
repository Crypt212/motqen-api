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
const key = this.#keys.otp(phone, method)
    await this.#client.set(
      key,
      hashedOtp,
      { EX: ttlSeconds }
    );
  }

  async getOtp(phone, method) {
    const key = this.#keys.otp(phone, method);
    const value =  await this.#client.get(key);
    return value
  }

  async otpExists(phone, method) {
    const exists = await this.#client.exists(this.#keys.otp(phone, method));
    return exists === 1;
  }

  async deleteOtp(phone, method) {
    await this.#client.del(this.#keys.otp(phone, method));
  }
}
