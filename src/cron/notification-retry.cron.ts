import prisma from '../libs/database.js';
import { logger } from '../libs/winston.js';
import { notificationService } from '../state.js';

const BATCH_SIZE = 100;
const MAX_AGE_HOURS = 24;
/** retry interval lives in the BullMQ scheduler ('notification-retry', every 10 min) */

/**
 * Re-deliver unsent notifications whose BullMQ push already gave up (or whose
 * enqueue failed). Rows newer than 15 minutes are skipped so the live queue
 * keeps ownership of them (its retries + exponential backoff have priority).
 *
 * Called by the BullMQ cron worker (see src/workers/cron.worker.ts) on the
 * 'notification-retry' job.
 */
export async function runNotificationRetry(): Promise<void> {
  const now = Date.now();
  const cutoff = new Date(now - MAX_AGE_HOURS * 60 * 60 * 1000);
  const freshCutoff = new Date(now - 15 * 60 * 1000); // leave ultra-recent rows to the live queue

  const notifications = await prisma.notification.findMany({
    where: {
      isSent: false,
      createdAt: { lt: freshCutoff, gte: cutoff },
    },
    orderBy: { createdAt: 'asc' },
    take: BATCH_SIZE,
  });

  logger.info(`[notification-retry] Found ${notifications.length} unsent notifications`);

  for (const notification of notifications) {
    // deliverPush has the same semantics as the old cron send:
    // marks the row sent when FCM succeeds for at least one token,
    // clears invalid tokens and only throws on retryable failures.
    await notificationService
      .deliverPush(
        notification.userId,
        {
          title: notification.title,
          body: notification.body,
          data: notification.data as Record<string, string>,
        },
        notification.id,
      )
      .catch((err) => {
        logger.error('[notification-retry] FCM error', {
          notificationId: notification.id,
          error: err,
        });
        // Leave isSent: false — will retry next scheduled run
      });
  }
}
