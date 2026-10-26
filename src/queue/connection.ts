// src/queue/connection.ts
import type { ConnectionOptions } from 'bullmq';
import { RedisConnection, createNodeRedisClient } from 'bullmq';
import { createClient } from 'redis';
import environment from '../configs/environment.js';
import { logger } from '../libs/winston.js';

/**
 * Dedicated BullMQ connection (separate from the node-redis client in libs/redis.ts).
 * `maxRetriesPerRequest: null` is required for Workers (blocking commands).
 *
 * bullmq's default backend tries to lazily require `ioredis`, which is not a
 * direct dependency in this pnpm workspace and fails under node ESM — so we
 * register a client factory that builds BullMQ's connections (including the
 * worker's blocking one) on node-redis instead.
 */
RedisConnection.clientFactory = (opts) => {
  const client = createClient({ url: opts.url ?? environment.redis.url ?? undefined });
  client.on('error', (err) =>
    logger.error('BullMQ redis error', { error: err instanceof Error ? err.message : err })
  );
  return createNodeRedisClient(client);
};
export const connection: ConnectionOptions = {
  url: environment.redis.url ?? undefined,
  maxRetriesPerRequest: null,
};
