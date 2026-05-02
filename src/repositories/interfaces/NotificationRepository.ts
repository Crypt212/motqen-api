import type { Notification, NotificationCreateInput} from '../../domain/notification.entity.js';

export default interface INotificationRepository {
  create(data: NotificationCreateInput): Promise<Notification>;
  findByUserId(userId: string, limit?: number, cursor?: string): Promise<{ notifications: Notification[]; nextCursor: string | null }>;
  findUnsentSince(since?: Date, limit?: number): Promise<Notification[]>;
  markSent(notificationId: string): Promise<void>;
  countUnreadSince(userId: string, since?: Date | null, cap?: number): Promise<number>;
}
