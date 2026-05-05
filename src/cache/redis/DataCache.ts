import { RedisArgument } from 'redis';
import { RedisClientType } from '../../libs/redis.js';
import IDataCache from '../interfaces/DataCache.js';

export default class DataCache implements IDataCache {
  constructor(private client: RedisClientType) { }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delPattern(pattern: string): Promise<void> {
    let cursor: RedisArgument = '0';
    do {
      const result = await this.client.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });
      cursor = result.cursor;
      const keys = result.keys;

      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } while (cursor !== '0');
  }
}
