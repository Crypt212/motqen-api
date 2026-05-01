import { PrismaClient, Prisma } from '../../generated/prisma/client.js';
import INotificationRepository from '../interfaces/NotificationRepository.js';
import type { Notification, NotificationCreateInput, NotificationData, NotificationType } from '../../domain/notification.entity.js';

export class NotificationRepository implements INotificationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: NotificationCreateInput): Promise<Notification> {
    // Ensure data matches domain NotificationData shape before passing to Prisma
    const jsonData = data.data as NotificationData;

    const created = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        // domain NotificationType is compatible with generated enum
        type: data.type as unknown as NotificationType,
        title: data.title,
        body: data.body,
        data: jsonData as unknown as Prisma.JsonValue,
        isSent: false,
      },
    });

    // Map Prisma result to domain Notification
    const result: Notification = {
      id: created.id,
      userId: created.userId,
      type: created.type as unknown as NotificationType,
      title: created.title,
      body: created.body,
      data: created.data as unknown as NotificationData,
      isSent: created.isSent,
      createdAt: created.createdAt,
    };

    return result;
  }

  async findByUserId(userId: string, limit: number = 20, cursor?: string): Promise<{ notifications: Notification[]; nextCursor: string | null }> {
    const take = limit + 1;
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | null = null;
    if (rows.length > limit) {
      const last = rows.pop()!;
      nextCursor = last.id;
    }

    const notifications: Notification[] = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      type: r.type as unknown as NotificationType,
      title: r.title,
      body: r.body,
      data: r.data as unknown as NotificationData,
      isSent: r.isSent,
      createdAt: r.createdAt,
    }));

    return { notifications, nextCursor };
  }

  async findUnsentSince(since?: Date, limit: number = 100): Promise<Notification[]> {
    const where: Prisma.NotificationWhereInput = { isSent: false };
    if (since) where.createdAt = { gt: since };
    const rows = await this.prisma.notification.findMany({ where, take: limit });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      type: r.type as unknown as NotificationType,
      title: r.title,
      body: r.body,
      data: r.data as unknown as NotificationData,
      isSent: r.isSent,
      createdAt: r.createdAt,
    }));
  }

  async countUnreadSince(userId: string, since?: Date | null, cap: number = 20): Promise<number> {
    const rows = await this.prisma.notification.findMany({
      where: {
        userId,
        ...(since ? { createdAt: { gt: since } } : {}),
      },
      take: cap + 1,
      select: { id: true },
    });
    return rows.length;
  }

  async markSent(notificationId: string): Promise<void> {
    await this.prisma.notification.update({ where: { id: notificationId }, data: { isSent: true } });
  }
}

export default NotificationRepository;
