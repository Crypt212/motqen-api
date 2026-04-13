/**
 * @fileoverview Token Cache Interface - One-time use token tracking in Redis
 * @module cache/interfaces/tokenCache
 */

export default interface ITokenCache {
  /**
   * Store a token hash in cache with TTL.
   * Uses SET NX to prevent overwriting an existing entry (race-condition safe).
   * @returns true if set successfully, false if key already existed
   */
  setToken(tokenType: 'register' | 'login', tokenHash: string, ttlSeconds: number): Promise<boolean>;

  /**
   * Atomically consume a token – get its value and delete it in one step.
   * @returns true if the token existed and was consumed, false if already used / expired
   */
  consumeToken(tokenType: 'register' | 'login', tokenHash: string): Promise<boolean>;

  /**
   * Restore a consumed token back to Redis with a TTL.
   * Used to rollback consumption if subsequent verification fails.
   * @returns true if restored successfully
   */
  restoreToken(tokenType: 'register' | 'login', tokenHash: string, ttlSeconds: number): Promise<boolean>;
}
