import { PrismaClient } from '../../generated/prisma/client.js';

export type DashboardStats = {
  pendingApprovals: number;
  activeOrders: number;
  openDisputes: number;
  totalUsers: number;
};

export type DashboardRecentEvents = {
  latestPendingCraftsman: {
    id: string;
    fullName: string;
    specialty: string;
    registeredAt: string;
  } | null;
  latestOrder: {
    id: string;
    serviceType: string;
    status: string;
    createdAt: string;
  } | null;
  latestDispute: {
    id: string;
    summary: string;
    openedAt: string;
  } | null;
};

export class AdminPlatformDashboardService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStats(): Promise<DashboardStats> {
    const [pendingApprovals, activeOrders, openDisputes, totalUsers] = await Promise.all([
      this.prisma.workerVerification.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({
        where: { orderStatus: { in: ['OPEN', 'PRICE_AGREED', 'PAID'] } },
      }),
      this.prisma.dispute.count({
        where: { status: { in: ['OPEN', 'AWAITING_INFO'] } },
      }),
      this.prisma.user.count(),
    ]);

    return { pendingApprovals, activeOrders, openDisputes, totalUsers };
  }

  async getRecentEvents(): Promise<DashboardRecentEvents> {
    const [latestPendingCraftsman, latestOrder, latestDispute] = await Promise.all([
      this.prisma.workerProfile.findFirst({
        where: { verification: { status: 'PENDING' } },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, middleName: true } },
          chosenSpecializations: {
            take: 1,
            include: { specialization: { select: { nameAr: true, name: true } } },
          },
        },
      }),
      this.prisma.order.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
          subSpecialization: {
            select: {
              nameAr: true,
              name: true,
              mainSpecialization: { select: { nameAr: true, name: true } },
            },
          },
        },
      }),
      this.prisma.dispute.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
          messages: { take: 1, orderBy: { createdAt: 'asc' } },
        },
      }),
    ]);

    return {
      latestPendingCraftsman: latestPendingCraftsman
        ? {
            id: latestPendingCraftsman.id,
            fullName: [
              latestPendingCraftsman.user.firstName,
              latestPendingCraftsman.user.middleName,
              latestPendingCraftsman.user.lastName,
            ]
              .filter(Boolean)
              .join(' '),
            specialty:
              latestPendingCraftsman.chosenSpecializations[0]?.specialization.nameAr ||
              latestPendingCraftsman.chosenSpecializations[0]?.specialization.name ||
              '—',
            registeredAt: latestPendingCraftsman.createdAt.toISOString(),
          }
        : null,
      latestOrder: latestOrder
        ? {
            id: latestOrder.id,
            serviceType:
              latestOrder.subSpecialization?.nameAr ||
              latestOrder.subSpecialization?.name ||
              latestOrder.subSpecialization?.mainSpecialization?.nameAr ||
              '—',
            status: latestOrder.orderStatus,
            createdAt: latestOrder.createdAt.toISOString(),
          }
        : null,
      latestDispute: latestDispute
        ? {
            id: latestDispute.id,
            summary:
              latestDispute.messages[0]?.content ||
              latestDispute.resolutionNote ||
              `Dispute on order ${latestDispute.orderId}`,
            openedAt: latestDispute.createdAt.toISOString(),
          }
        : null,
    };
  }
}
