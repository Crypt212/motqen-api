// src/workers/notifications.worker.ts
import { Worker } from 'bullmq';
import type { NotificationJob } from '../queue/queue.js';
import { connection } from '../queue/connection.js';
import { notificationRepository, notificationService } from '../state.js';
import { toPayload } from '../utils/notificationMapper.js';
import { logger } from '../libs/winston.js';

export const notificationWorker = new Worker<NotificationJob>(
  'notifications',
  async (job) => {
    const data = job.data;

    if (data.kind === 'saved') {
      // Idempotent: skip if the row was deleted already sent by a previous attempt.
      const notification = await notificationRepository.findById(data.notificationId);
      if (!notification || notification.isSent) return;

      await notificationService.deliverPush(data.userId, toPayload(notification), notification.id);
    } else {
      // transient: no DB row — the full payload travels with the job.
      await notificationService.deliverPush(
        data.userId,
        { title: data.title, body: data.body, data: data.data },
        null
      );
    }
  },
  {
    connection,
    concurrency: 20,
  }
);

notificationWorker.on('failed', (job, err) => {
  const attemptsMade = job?.attemptsMade ?? 0;
  const maxAttempts = job?.opts.attempts ?? 1;

  if (attemptsMade >= maxAttempts) {
    // Retries exhausted — the retry cron is the safety net for 'saved' jobs.
    logger.error('Notification job failed permanently', {
      jobId: job?.id,
      userId: job?.data && 'userId' in job.data ? job.data.userId : undefined,
      attemptsMade,
      maxAttempts,
      error: err.message ?? err,
      stack: err.stack ?? undefined,
    });
  } else {
    logger.warn('Notification job failed, will retry', {
      jobId: job?.id,
      userId: job?.data && 'userId' in job.data ? job.data.userId : undefined,
      attemptsMade,
      maxAttempts,
      error: err.message ?? err,
      stack: err.stack ?? undefined,
    });
  }
});
notificationWorker.on('error', (err) =>
  logger.error('Notification worker error', { error: err instanceof Error ? err.message : err })
);
