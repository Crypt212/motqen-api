export default interface IDataCache {
  /**
   * Get a value from the cache by key.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value in the cache with a specific TTL in seconds.
   */
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;

  /**
   * Delete a specific key from the cache.
   */
  del(key: string): Promise<void>;

  /**
   * Delete all keys matching a pattern from the cache.
   */
  delPattern(pattern: string): Promise<void>;
}
