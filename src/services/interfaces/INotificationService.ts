import type { NotificationEventContext, Notification } from '../../domain/notification.entity.js';

export default interface INotificationService {
  /**
   * Create a DB notification and send FCM to the user's devices.
   */
  notify(
    userId: string,
    event: NotificationEventContext,
    saveNotification?: boolean,
  ): Promise<void>;

  /**
   * Mark all notifications as read for a user.
   */
  markAllRead(userId: string): Promise<void>;

  /**
   * Get paginated notifications with unread count.
   */
  getNotifications(
    userId: string,
    cursor?: string,
    limit?: number,
  ): Promise<{ notifications: Notification[]; nextCursor: string | null; unreadCount: number }>;

  /**
   * Subscribe a device to an FCM topic.
   */
  subscribeToTopic(userId: string, deviceId: string, topic: string, fcm?: string): Promise<void>;

  /**
   * Unsubscribe a device from an FCM topic.
   */
  unsubscribeFromTopic(userId: string, deviceId: string, topic: string, fcm?: string): Promise<void>;
}
