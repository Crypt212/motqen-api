// src/cron/scheduler.ts
import { cronQueue } from '../queue/queue.js';
import environment from '../configs/environment.js';
import { logger } from '../libs/winston.js';

/**
 * Registers (idempotently) the repeating cron jobs on the BullMQ 'cron' queue.
 * Fixed scheduler IDs make every startup an upsert of the same schedule.
 * Called once from server startup — replaces the old in-process setInterval.
 */
export async function registerCronJobs(): Promise<void> {
  await cronQueue.upsertJobScheduler('order-timeout', { every: environment.cron.intervalMs }, {
    name: 'order-timeout',
  });

  await cronQueue.upsertJobScheduler('notification-retry', { every: 10 * 60 * 1000 }, {
    name: 'notification-retry',
  });

  logger.info('[cron-scheduler] Registered cron job schedulers', {
    orderTimeoutEveryMs: environment.cron.intervalMs,
    notificationRetryEveryMs: 10 * 60 * 1000,
  });
}
