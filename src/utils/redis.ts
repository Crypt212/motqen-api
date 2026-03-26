import redisClient from '../libs/redis.js';

export async function redisRetreiveOrCache<T>(
  key: string,
  createCacheCallback: () => Promise<T>
): Promise<T> {
  const stringifiedResult = await redisClient.get(key);
  if (!stringifiedResult) {
    const result = await createCacheCallback();
    await redisClient.set(key, JSON.stringify(result));
    return result;
  } else {
    return JSON.parse(String(stringifiedResult));
  }
}

export async function redisClearCache(key: string): Promise<void> {
  await redisClient.del(key);
}
