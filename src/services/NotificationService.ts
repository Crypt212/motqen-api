import type { RedisClientType } from '../libs/redis.js';
import { IFirebaseProvider } from '../providers/interfaces/IFirebaseProvider.js';
import { logger } from '../libs/winston.js';
import type INotificationRepository from '../repositories/interfaces/NotificationRepository.js';
import type ISessionRepository from '../repositories/interfaces/SessionRepository.js';
import type IUserRepository from '../repositories/interfaces/UserRepository.js';
import type IWorkerProfileRepository from '../repositories/interfaces/WorkerRepository.js';
import type { NotificationType, BroadcastTargetRole } from '../generated/prisma/client.js';
import type {
  NotificationEventContext,
  NotificationPayload,
  NotificationData,
  Notification,
} from '../domain/notification.entity.js';
import { mapEventToNotification } from '../utils/notificationMapper.js';
import { UserState } from '../types/asyncHandler.js';

const UNREAD_COUNT_TTL = 300;
const UNREAD_COUNT_KEY = (userId: string): string => `unread_notif:${userId}`;
const UNREAD_COUNT_CAP = 20;

export class NotificationService {
  constructor(
    private repo: INotificationRepository,
    private redis: RedisClientType,
    private sessionRepo: ISessionRepository,
    private userRepo: IUserRepository,
    private firebaseProvider: IFirebaseProvider,
    private workerProfileRepository: IWorkerProfileRepository,
  ) {}

  async buildUserTopics(state: UserState): Promise<string[]> {
    const topics = ['all'];

    if (state.accountStatus === 'ACTIVE') {
      if (state.worker) {
        topics.push('workers');
        const result = await this.workerProfileRepository.findWorkGovernments({
          workerProfileFilter: { userId: state.userId },
          pagination: { page: 1, limit: 27 },
        });
        topics.push(...result.governments.map((id) => `gov_${id}`));
      }
      if (state.client) topics.push('clients');
    }

    return [...new Set(topics)];
  }

  async notify(
    userId: string,
    event: NotificationEventContext,
    saveNotification: boolean = true,
  ): Promise<void> {
    const payload = mapEventToNotification(event);

    if (saveNotification) {
      let created: Notification;
      try {
        created = await this.repo.create({
          userId,
          type: payload.type,
          title: payload.title,
          body: payload.body,
          data: payload.data,
          isSent: false,
        });
      } catch (err) {
        console.log('NotificationService.notify error', err);
        throw err;
      }

      await this.redis.del(UNREAD_COUNT_KEY(userId));

      this.sendFCMToUser(userId, payload, created.id).catch((err) => {
        logger.error('FCM send failed (fire-and-forget)', { userId, error: err });
      });
    } else {
      this.sendFCMToUser(userId, payload, null).catch((err) => {
        logger.error('FCM send failed (fire-and-forget)', { userId, error: err });
      });
    }
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
    if (!this.firebaseProvider.isReady()) {
      logger.warn('Firebase not initialized — skipping broadcast');
      return;
    }

    try {
      await this.firebaseProvider.sendTopic({
        topic: options.topic,
        title: options.title,
        body: options.body,
        data: options.data,
      });
    } catch (err) {
      logger.error('Broadcast FCM send failed', { topic: options.topic, error: err });
    }
  }

  async markAllRead(userId: string): Promise<void> {
    await this.userRepo.update({
      filter: { id: userId },
      user: { lastNotificationReadAt: new Date() },
    });

    await this.redis.del(UNREAD_COUNT_KEY(userId));
  }

  async getNotifications(
    userId: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<{ notifications: Notification[]; nextCursor: string | null; unreadCount: number }> {
    const result = await this.repo.findByUserId(userId, limit, cursor);
    const unreadCount = await this.getUnreadCount(userId);
    return { ...result, unreadCount };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const cached = await this.redis.get(UNREAD_COUNT_KEY(userId));
    if (cached !== null) {
      return Math.min(parseInt(String(cached), 10), UNREAD_COUNT_CAP);
    }

    const user = await this.userRepo.find({ filter: { id: userId } });
    const lastRead = user?.lastNotificationReadAt;

    const count = await this.repo.countUnreadSince(userId, lastRead, UNREAD_COUNT_CAP);

    const cappedCount = Math.min(count, UNREAD_COUNT_CAP);
    await this.redis.setEx(UNREAD_COUNT_KEY(userId), UNREAD_COUNT_TTL, String(cappedCount));

    return cappedCount;
  }

  async subscribeToTopic(
    userId: string,
    deviceId: string,
    topic: string,
    fcm?: string,
  ): Promise<void> {
    const fcmToken =
      fcm ??
      (await this.sessionRepo
        .find({
          filter: { userId, deviceId },
        })
        .then((session) => session?.fcmToken));

    if (!fcmToken) {
      logger.warn('No active session with FCM token found for subscription', {
        userId,
        deviceId,
      });
      return;
    }

    this.firebaseProvider.subscribeToTopic([fcmToken], topic).catch((err) => {
      logger.error('Failed to subscribe to topic', { userId, deviceId, topic, error: err });
    });
  }

  async unsubscribeFromTopic(
    userId: string,
    deviceId: string,
    topic: string,
    fcm?: string,
  ): Promise<void> {
    const fcmToken =
      fcm ??
      (await this.sessionRepo
        .find({
          filter: { userId, deviceId },
        })
        .then((session) => session?.fcmToken));

    if (!fcmToken) {
      logger.warn('No active session with FCM token found for unsubscription', {
        userId,
        deviceId,
      });
      return;
    }

    this.firebaseProvider.unsubscribeFromTopic([fcmToken], topic).catch((err) => {
      logger.error('Failed to unsubscribe from topic', { userId, deviceId, topic, error: err });
    });
  }

  // ─── Private methods ──────────────────────────────────────────────────

  private async sendFCMToUser(
    userId: string,
    payload: NotificationPayload,
    notificationId: string | null,
  ): Promise<void> {
    if (!this.firebaseProvider.isReady()) {
      logger.warn('Firebase not initialized — skipping FCM send', { userId });
      return;
    }

    const sessions = await this.sessionRepo.findMany({
      filter: { userId },
    });
    if (sessions.length === 0) return;
    const tokens = sessions
      .filter((s: { isRevoked: boolean; fcmToken: string | null }) => !s.isRevoked && s.fcmToken)
      .map((s: { fcmToken: string }) => s.fcmToken);

    if (tokens.length === 0) return;

    const serializedData = this.serializeData(payload.data);

    const response = await this.firebaseProvider.sendMulticast({
      tokens,
      title: payload.title,
      body: payload.body,
      data: serializedData,
    });

    if (notificationId && response.successCount > 0) {
      await this.repo.markSent(notificationId);
    }

    const invalidCodes = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
    ];

    for (let i = 0; i < response.responses.length; i++) {
      const resp = response.responses[i];
      if (resp.error && invalidCodes.includes(resp.error.code)) {
        const session = sessions[i] as { id: string };
        if (session) {
          await this.sessionRepo.updateFcmToken(session.id, null).catch((err: unknown) => {
            logger.error('Failed to clear invalid FCM token', {
              sessionId: session.id,
              error: err,
            });
          });
        }
      }
    }
  }

  private serializeData(data: NotificationData): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        result[key] = String(value);
      }
    }
    return result;
  }
}

export default NotificationService;
