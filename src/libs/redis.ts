import * as redis from 'redis';
import environment from '../configs/environment.js';
import { logger } from './winston.js';

const redisClient: ReturnType<typeof redis.createClient> = redis.createClient({ url: environment.redis.url });

redisClient.on('error', (err) => logger.error('❌ Redis client error', err));
redisClient.on('connect', () => logger.info('✅ Redis client connected'));
redisClient.on('disconnected', () => logger.error('❌ Redis disconnected'));

export default redisClient;
export type RedisClientType = ReturnType<typeof redis.createClient>;
