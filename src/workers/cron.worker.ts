// src/workers/cron.worker.ts
import { Worker } from 'bullmq';
import { connection } from '../queue/connection.js';
import { runOrderTimeout } from '../cron/order-timeout.cron.js';
import { runNotificationRetry } from '../cron/notification-retry.cron.js';
import { logger } from '../libs/winston.js';

export const cronWorker = new Worker(
  'cron',
  async (job) => {
    const startedAt = Date.now();
    logger.info('[cron-worker] Job started', { jobId: job.id, name: job.name });

    switch (job.name) {
      case 'order-timeout':
        await runOrderTimeout();
        break;
      case 'notification-retry':
        await runNotificationRetry();
        break;
      default:
        logger.warn('[cron-worker] Unknown job name — skipping', { jobId: job.id, name: job.name });
    }

    logger.info('[cron-worker] Job finished', {
      jobId: job.id,
      name: job.name,
      durationMs: Date.now() - startedAt,
    });
  },
  {
    connection,
    concurrency: 1, // crons must not overlap each other within this worker
  },
);

cronWorker.on('failed', (job, err) => {
  logger.error('[cron-worker] Job failed', {
    jobId: job?.id,
    name: job?.name,
    attemptsMade: job?.attemptsMade ?? 0,
    error: err instanceof Error ? err.message : err,
    stack: err instanceof Error ? err.stack : undefined,
  });
});

cronWorker.on('error', (err) => {
  logger.error('[cron-worker] Worker error', {
    error: err instanceof Error ? err.message : err,
  });
});
