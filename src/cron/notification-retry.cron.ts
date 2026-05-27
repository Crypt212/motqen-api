import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { FirebaseProvider } from '../providers/FirebaseProvider.js';
const firebaseProvider = new FirebaseProvider();
import { logger } from '../libs/winston.js';

const BATCH_SIZE = 100;
const MAX_AGE_HOURS = 24;
const RETRY_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const INVALID_TOKEN_CODES = [
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
];

async function retryFailedNotifications(): Promise<void> {
  const cutoff = new Date(Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000);

  const notifications = await prisma.notification.findMany({
    where: {
      isSent: false,
      createdAt: { gte: cutoff },
    },
    orderBy: { createdAt: 'asc' },
    take: BATCH_SIZE,
    include: {
      user: {
        select: {
          sessions: {
            where: {
              isRevoked: false,
              fcmToken: { not: null },
            },
            select: { id: true, fcmToken: true },
          },
        },
      },
    },
  });

  logger.info(`[notification-retry] Found ${notifications.length} unsent notifications`);

  for (const notification of notifications) {
    const sessions = notification.user.sessions;
    if (sessions.length === 0) continue;

    const tokens = sessions.map((s) => s.fcmToken!);

    const dataEntries = Object.entries(
      (notification.data as Record<string, unknown>) ?? {},
    );
    const serializedData: Record<string, string> = {};
    for (const [key, value] of dataEntries) {
      serializedData[key] = String(value ?? '');
    }

    try {
      const response = await firebaseProvider.sendMulticast({
        tokens,
        title: notification.title,
        body: notification.body,
        data: serializedData,
      });

      if (response.successCount > 0) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { isSent: true },
        });
      }

      // Clean invalid tokens
      for (let i = 0; i < response.responses.length; i++) {
        const resp = response.responses[i];
        if (resp.error && INVALID_TOKEN_CODES.includes(resp.error.code)) {
          await prisma.session.update({
            where: { id: sessions[i].id },
            data: { fcmToken: null },
          }).catch(() => {});
        }
      }
    } catch (err) {
      logger.error('[notification-retry] FCM error', {
        notificationId: notification.id,
        error: err,
      });
      // Leave isSent: false — will retry next run
    }
  }
}

// ─── Entry point ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  logger.info('[notification-retry] Starting retry cron...');
  await retryFailedNotifications();
  setInterval(() => {
    retryFailedNotifications().catch((err: unknown) => {
      logger.error('[notification-retry] Background execution error', { error: err });
    });
  }, RETRY_INTERVAL_MS);
}

main().catch((err) => {
  logger.error('[notification-retry] Fatal error', err);
  process.exit(1);
});
