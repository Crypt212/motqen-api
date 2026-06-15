import { PrismaClient, BroadcastTargetRole } from '../../generated/prisma/client.js';
import { NotificationService } from '../NotificationService.js';
import { parseAdminPagination, toPaginatedResponse } from '../../utils/adminPagination.js';
import AppError from '../../errors/AppError.js';

export type AdminNotificationTarget = 'all' | 'users' | 'craftsmen';

const TARGET_TO_ROLE: Record<AdminNotificationTarget, BroadcastTargetRole | null> = {
  all: 'ALL',
  users: 'CLIENT',
  craftsmen: 'WORKER',
};

const TARGET_TO_TOPIC: Record<AdminNotificationTarget, string> = {
  all: 'all',
  users: 'clients',
  craftsmen: 'workers',
};

export class AdminNotificationService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly notificationService: NotificationService
  ) {}

  async listNotifications(params?: { page?: string | number; pageSize?: string | number }) {
    const { page, pageSize, skip } = parseAdminPagination(params ?? {});

    const [rows, total] = await Promise.all([
      this.prisma.broadcast.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.broadcast.count(),
    ]);

    const data = rows.map((b) => ({
      id: b.id,
      title: b.title,
      body: b.body,
      target: this.mapTargetRole(b.targetRole),
      sentAt: b.createdAt.toISOString(),
      status: 'sent',
      recipientsCount: 0,
    }));

    return toPaginatedResponse(data, total, page, pageSize);
  }

  async getNotification(id: string) {
    const broadcast = await this.prisma.broadcast.findUnique({ where: { id } });
    if (!broadcast) throw new AppError('Notification not found', 404);
    return {
      id: broadcast.id,
      title: broadcast.title,
      body: broadcast.body,
      target: this.mapTargetRole(broadcast.targetRole),
      sentAt: broadcast.createdAt.toISOString(),
      status: 'sent',
      recipientsCount: 0,
    };
  }

  async createNotification(payload: { title: string; body: string; target: AdminNotificationTarget }) {
    const broadcast = await this.prisma.broadcast.create({
      data: {
        type: 'ADMIN_ACTION',
        title: payload.title,
        body: payload.body,
        data: { target: payload.target },
        targetRole: TARGET_TO_ROLE[payload.target],
      },
    });

    return {
      id: broadcast.id,
      title: broadcast.title,
      body: broadcast.body,
      target: payload.target,
      sentAt: broadcast.createdAt.toISOString(),
      status: 'sent',
      recipientsCount: 0,
    };
  }

  async deleteNotification(id: string) {
    const broadcast = await this.prisma.broadcast.findUnique({ where: { id } });
    if (!broadcast) throw new AppError('Notification not found', 404);
    await this.prisma.broadcast.delete({ where: { id } });
  }

  async sendNotification(id: string) {
    const broadcast = await this.prisma.broadcast.findUnique({ where: { id } });
    if (!broadcast) throw new AppError('Notification not found', 404);

    const target = this.mapTargetRole(broadcast.targetRole);
    await this.notificationService.broadcast({
      type: 'ADMIN_ACTION',
      title: broadcast.title,
      body: broadcast.body,
      data: { broadcastId: broadcast.id },
      topic: TARGET_TO_TOPIC[target],
      targetRole: broadcast.targetRole ?? undefined,
    });

    const recipientCount = await this.countRecipients(target);

    return {
      id: broadcast.id,
      title: broadcast.title,
      body: broadcast.body,
      target,
      sentAt: new Date().toISOString(),
      status: 'sent',
      recipientsCount: recipientCount,
    };
  }

  async sendAndCreate(payload: { title: string; body: string; target: AdminNotificationTarget }) {
    const created = await this.createNotification(payload);
    return this.sendNotification(created.id);
  }

  async listTemplates() {
    return toPaginatedResponse(
      [
        {
          id: 'tpl-welcome',
          title: 'مرحبًا بك في متقن',
          body: 'نشكرك على انضمامك إلى منصة متقن.',
          target: 'all',
        },
        {
          id: 'tpl-profile',
          title: 'أكمل ملفك الشخصي',
          body: 'يرجى إكمال بيانات ملفك الشخصي لتفعيل حسابك.',
          target: 'craftsmen',
        },
      ],
      2,
      1,
      20
    );
  }

  async createTemplate(payload: { title: string; body: string; target: AdminNotificationTarget }) {
    return {
      id: `tpl-${Date.now()}`,
      title: payload.title,
      body: payload.body,
      target: payload.target,
    };
  }

  private mapTargetRole(role: BroadcastTargetRole | null): AdminNotificationTarget {
    if (role === 'CLIENT') return 'users';
    if (role === 'WORKER') return 'craftsmen';
    return 'all';
  }

  private async countRecipients(target: AdminNotificationTarget): Promise<number> {
    if (target === 'all') return this.prisma.user.count();
    if (target === 'users') {
      return this.prisma.clientProfile.count();
    }
    return this.prisma.workerProfile.count();
  }
}
