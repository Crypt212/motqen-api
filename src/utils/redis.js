import redisClient from "../libs/redis.js";

/**
 * @template T
 * @param {string} key - Redis key
 * @param {function(): Promise<T>} createCacheCallback - Function to create the cache
 * @return {Promise<T>}
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
