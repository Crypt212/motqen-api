import { Worker } from 'bullmq';
import { connection } from '../queue/connection.js';
import { contactDetectionService, messageRepository } from '../state.js';
import type { ContentDetectionJob } from '../queue/queue.js';
import { logger } from '../libs/winston.js';

export const contentDetectionWorker = new Worker<ContentDetectionJob>(
  'contentdetection',
  async (job) => {
    const message = await messageRepository.findById({ messageId: job.data.messageId });
    if (!message) {
      logger.warn('Content detection skipped: message not found', {
        messageId: job.data.messageId,
        jobId: job.id,
      });
      return;
    }
    await contactDetectionService.analyzeAndFlagMessage(message);
  },

  {
    connection,
    concurrency: 10,
  }
);

contentDetectionWorker.on('failed', (job, err) => {
  const attemptsMade = job?.attemptsMade ?? 0;
  const maxAttempts = job?.opts.attempts ?? 1;

  if (attemptsMade >= maxAttempts) {
    logger.error('Content detection job failed permanently', {
      jobId: job?.id,
      messageId: job?.data?.messageId,
      attemptsMade,
      maxAttempts,
      error: err.message ?? err,
      stack: err.stack ?? undefined,
    });
  } else {
    logger.warn('Content detection job failed, will retry', {
      jobId: job?.id,
      messageId: job?.data?.messageId,
      attemptsMade,
      maxAttempts,
      error: err.message ?? err,
      stack: err.stack ?? undefined,
    });
  }
});
contentDetectionWorker.on('error', (err) =>
  logger.error('Content detection worker error', {
    error: err instanceof Error ? err.message : err,
  })
);
