// src/queue/queue.ts
import { Queue } from 'bullmq';
import { connection } from './connection.js';

export type NotificationJob =
  | { kind: 'saved'; notificationId: string; userId: string }
  | {
      kind: 'transient';
      userId: string;
      title: string;
      body: string;
      data: Record<string, string>;
    };

export const notificationQueue = new Queue<NotificationJob>('notifications', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export type ContentDetectionJob = { messageId: string };

export const contentdetection = new Queue<ContentDetectionJob>('contentdetection', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 500,
    removeOnFail: 2000,
  },
});
/**
 * Queue for long-running housekeeping jobs (was process-local crons).
 * Jobs are created by the job schedulers registered in src/cron/scheduler.ts
 * and processed by src/workers/cron.worker.ts.
 */
export const cronQueue = new Queue('cron', {
  connection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});
