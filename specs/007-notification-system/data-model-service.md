# Service, Controller, Routes & Cron — Tasks 6–13

## TASK 6: Create `src/notifications/notification.service.ts`

Full file content:

```typescript
import { PrismaClient, NotificationType, BroadcastTargetRole } from '../generated/prisma/client.js';
import type { RedisClientType } from '../libs/redis.js';
import admin from '../libs/firebase.js';
import { firebaseReady } from '../libs/firebase.js';
import { logger } from '../libs/winston.js';
import {
  mapEventToNotification,
  NotificationEventContext,
  NotificationPayload,
  NotificationData,
} from './notification.mapper.js';

const UNREAD_COUNT_TTL = 300;
const UNREAD_COUNT_KEY = (userId: string) => `unread_notif:${userId}`;
const UNREAD_COUNT_CAP = 99;

export class NotificationService {
  constructor(
    private prisma: PrismaClient,
    private redis: RedisClientType,
  ) {}

  async notify(userId: string, event: NotificationEventContext): Promise<void> {
    const payload = mapEventToNotification(event);

    const created = await this.prisma.notification.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data as Record<string, unknown>,
        isSent: false,
      },
    });

    await this.redis.del(UNREAD_COUNT_KEY(userId));

    // Fire and forget — errors are swallowed
    this.sendFCMToUser(userId, payload, created.id).catch((err) => {
      logger.error('FCM send failed (fire-and-forget)', { userId, error: err });
    });
  }

  async broadcast(options: {
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, string>;
    topic: string;
    targetRole?: BroadcastTargetRole;
    targetGovId?: string;
  }): Promise<void> {
    await this.prisma.broadcast.create({
      data: {
        type: options.type,
        title: options.title,
        body: options.body,
        data: options.data as Record<string, unknown>,
        targetRole: options.targetRole,
        targetGovId: options.targetGovId,
      },
    });

    try {
      await admin.messaging().send({
        topic: options.topic,
        notification: { title: options.title, body: options.body },
        data: options.data,
      });
    } catch (err) {
      logger.error('Broadcast FCM send failed', { topic: options.topic, error: err });
    }
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastNotificationReadAt: new Date() },
    });

    await this.redis.del(UNREAD_COUNT_KEY(userId));
  }

  async getNotifications(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<{
    notifications: Array<{
      id: string;
      type: string;
      title: string;
      body: string;
      data: unknown;
      isSent: boolean;
      createdAt: Date;
    }>;
    nextCursor: string | null;
    unreadCount: number;
  }> {
    const take = limit + 1;

    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          data: true,
          isSent: true,
          createdAt: true,
        },
      }),
      this.getUnreadCount(userId),
    ]);

    let nextCursor: string | null = null;
    if (notifications.length > limit) {
      const lastItem = notifications.pop()!;
      nextCursor = lastItem.id;
    }

    return { notifications, nextCursor, unreadCount };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const cached = await this.redis.get(UNREAD_COUNT_KEY(userId));
    if (cached !== null) {
      return Math.min(parseInt(cached, 10), UNREAD_COUNT_CAP);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastNotificationReadAt: true },
    });

    const lastRead = user?.lastNotificationReadAt;

    const rows = await this.prisma.notification.findMany({
      where: {
        userId,
        ...(lastRead ? { createdAt: { gt: lastRead } } : {}),
      },
      take: UNREAD_COUNT_CAP + 1,
      select: { id: true },
    });
    const count = rows.length;

    const cappedCount = Math.min(count, UNREAD_COUNT_CAP);
    await this.redis.setEx(UNREAD_COUNT_KEY(userId), UNREAD_COUNT_TTL, String(cappedCount));

    return cappedCount;
  }

  // ─── Private methods ──────────────────────────────────────────────────

  private async sendFCMToUser(
    userId: string,
    payload: NotificationPayload,
    notificationId: string,
  ): Promise<void> {
    if (!firebaseReady) {
      logger.warn('Firebase not initialized — skipping FCM send', { userId });
      return;
    }

    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        isRevoked: false,
        fcmToken: { not: null },
      },
      select: { id: true, fcmToken: true },
    });

    if (sessions.length === 0) return;

    const tokens = sessions.map((s) => s.fcmToken!);
    const serializedData = this.serializeData(payload.data);

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title: payload.title, body: payload.body },
      data: serializedData,
    });

    if (response.successCount > 0) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { isSent: true },
      });
    }

    // Clean up invalid tokens
    const invalidCodes = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
    ];

    for (let i = 0; i < response.responses.length; i++) {
      const resp = response.responses[i];
      if (resp.error && invalidCodes.includes(resp.error.code)) {
        const session = sessions[i];
        await this.prisma.session.update({
          where: { id: session.id },
          data: { fcmToken: null },
        }).catch((err) => {
          logger.error('Failed to clear invalid FCM token', { sessionId: session.id, error: err });
        });
      }
    }
  }



  private serializeData(data: NotificationData): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = String(value ?? '');
    }
    return result;
  }
}
```

---

## TASK 7: Create `src/notifications/notification.controller.ts`

Full file content:

```typescript
import SuccessResponse from '../responses/successResponse.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { notificationService } from '../state.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const cursor = req.query.cursor as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const result = await notificationService.getNotifications(userId, cursor, limit);

  new SuccessResponse('Notifications retrieved successfully', result, 200).send(res);
});

export const markAllRead = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;

  await notificationService.markAllRead(userId);

  new SuccessResponse('All notifications marked as read', { success: true }, 200).send(res);
});
```

---

## TASK 8: Create `src/routes/v1/notifications.ts`

Full file content:

```typescript
import { Router } from 'express';
import { getNotifications, markAllRead } from '../../notifications/notification.controller.js';
import { validateQuery } from '../../middlewares/validateRequest.js';
import { z } from 'zod';

const notificationRouter = Router();

const GetNotificationsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

notificationRouter.get('/', validateQuery(GetNotificationsQuerySchema), getNotifications);
notificationRouter.post('/mark-all-read', markAllRead);

export default notificationRouter;
```

---

## TASK 9: Add FCM Token Update to Auth

### 9a — Add handler to `src/controllers/AuthController.ts`

Append this at the bottom of the file (before the last line if needed):

```typescript
/**
 * Update FCM token for the current session
 */
export const updateFcmToken = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const deviceId = req.deviceId;
  const { fcmToken } = req.body;

  // Find the active session by userId + deviceId
  const session = await prisma.session.findFirst({
    where: { userId, deviceId, isRevoked: false },
    select: { id: true },
  });

  if (!session) {
    throw new AppError('Session not found', 404);
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { fcmToken },
  });

  new SuccessResponse('FCM token updated successfully', { success: true }, 200).send(res);
});
```

Also add this import at the top of the AuthController file:

```typescript
import prisma from '../libs/database.js';
```

### 9b — Add route to `src/routes/v1/auth.ts`

Add import at top:

```typescript
import { updateFcmToken } from '../../controllers/AuthController.js';
```

Add the Zod schema and route (before `export default authRouter`):

```typescript
const FcmTokenSchema = z.object({
  fcmToken: z.string().min(1),
});

authRouter.patch(
  '/fcm-token',
  authenticateAccess,
  isActive,
  validateBody(FcmTokenSchema),
  updateFcmToken
);
```

Also add z import at top if not present:

```typescript
import { z } from 'zod';
```

---

## TASK 10: Register Routes in `src/routes/v1/api.ts`

Add import:

```typescript
import notificationRouter from './notifications.js';
```

Add route (after the orders line):

```typescript
mainRouter.use('/notifications', authenticateAccess, isActive, notificationRouter);
```

---

## TASK 11: Wire Up in `src/state.ts`

Add import at top:

```typescript
import { NotificationService } from './notifications/notification.service.js';
```

Add instantiation (after `negotiationService` or wherever appropriate):

```typescript
export const notificationService = new NotificationService(prisma, redisClient);
```

---

## TASK 12: Create `src/cron/notification-retry.cron.ts`

Full file content:

```typescript
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import admin from '../libs/firebase.js';
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
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title: notification.title, body: notification.body },
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

async function main() {
  logger.info('[notification-retry] Starting retry cron...');
  await retryFailedNotifications();
  setInterval(retryFailedNotifications, RETRY_INTERVAL_MS);
}

main().catch((err) => {
  logger.error('[notification-retry] Fatal error', err);
  process.exit(1);
});
```

---

## TASK 13: Add ORDER_ACCEPTED Example Trigger in NegotiationService

**File**: `src/services/NegotiationService.ts`

This is the ONE example trigger to prove the notification system works end-to-end.

### 13a — Add import at top of file:

```typescript
import { notificationService } from '../state.js';
```

### 13b — Add notification call in `acceptNegotiation` method

Inside `acceptNegotiation()`, after `this.notifyOpponent(...)` call (around line 185), add:

```typescript
      // Send push notification to client — ORDER_ACCEPTED
      // Resolve the client's userId from the order's clientProfile
      const clientUser = await this.transactionManager.execute(
        {},
        async (_, tx) => {
          return tx.clientProfile.findUnique({
            where: { id: order.clientProfileId },
            select: { userId: true },
          });
        },
      );

      if (clientUser) {
        notificationService.notify(clientUser.userId, {
          type: 'ORDER_ACCEPTED',
          ctx: {
            orderId: order.id,
            orderTitle: order.title,
          },
        }).catch((err) => {
          // Fire-and-forget — don't break negotiation flow
        });
      }
```

> **NOTE**: The `notifyOpponent` socket method is currently a no-op placeholder. The push notification via `notificationService.notify()` is the REAL notification that works.
