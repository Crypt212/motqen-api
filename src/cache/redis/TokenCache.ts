/**
 * @fileoverview Token Cache Repository - One-time use register/login token tracking via Redis
 * @module cache/redis/TokenCache
 */

import environment from 'src/configs/environment.js';
import { RedisClientType } from '../../libs/redis.js';
import ITokenCache from '../interfaces/tokenCache.js';

/**
 * TokenCache – ensures register & login tokens are used exactly once.
 *
 * - `setToken`  uses `SET NX EX` so the same key can never be overwritten (race-condition safe).
 * - `consumeToken` runs a Lua script that atomically GETs + DELs the key,
 *   guaranteeing that only the *first* caller succeeds.
 */
export default class TokenCache implements ITokenCache {
  private keys: { token: (type: 'register' | 'login', hash: string) => string };

  /** Lua script: atomically GET + DEL. Returns 1 if key existed (consumed), 0 otherwise. */
  private static readonly CONSUME_SCRIPT = `
    local val = redis.call('GET', KEYS[1])
    if val then
      redis.call('DEL', KEYS[1])
      return 1
    end
    return 0
  `;

  constructor(private client: RedisClientType) {
    this.keys = {
      token: (type, hash) => `token:${type}:${hash}`,
    };
  }

  async setToken(
    tokenType: 'register' | 'login',
    tokenHash: string,
    ttlSeconds: number
  ): Promise<boolean> {
    const key = this.keys.token(tokenType, tokenHash);
    const result = await this.client.set(key, '1', { NX: true, EX: ttlSeconds });
    return result === 'OK';
  }

  async consumeToken(tokenType: 'register' | 'login', tokenHash: string): Promise<boolean> {
    if (environment.nodeEnv === 'development') return true;
    const key = this.keys.token(tokenType, tokenHash);
    const result = await this.client.eval(TokenCache.CONSUME_SCRIPT, {
      keys: [key],
    });
    return result === 1;
  }

  async restoreToken(
    tokenType: 'register' | 'login',
    tokenHash: string,
    ttlSeconds: number
  ): Promise<boolean> {
    const key = this.keys.token(tokenType, tokenHash);
    const result = await this.client.set(key, '1', { EX: ttlSeconds });
    return result === 'OK';
  }
}
