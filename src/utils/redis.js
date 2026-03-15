import redisClient from "../libs/redis.js";

/**
 * Retrieve a value from Redis by key; if missing, generate it with the provided callback, store it, and return it.
 *
 * @template T
 * @param {string} key - Redis key used to look up the cached value.
 * @param {function(): Promise<T>} createCacheCallback - Callback invoked when the key is not present; should produce the value to cache.
 * @returns {Promise<T>} The cached value associated with the key or the newly created value returned by the callback.
 */
export async function redisRetreiveOrCache(key, createCacheCallback) {
  const stringifiedResult = await redisClient.get(key);
  if (!stringifiedResult) {
    const result = await createCacheCallback();
    await redisClient.set(key, JSON.stringify(result));
    return result;
  } else {
    return JSON.parse(String(stringifiedResult));
  }
}
