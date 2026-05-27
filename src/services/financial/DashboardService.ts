import { PrismaClient } from '../../generated/prisma/client.js';

export class DashboardService {
  constructor(private readonly prisma: PrismaClient) {}

  async getPlatformEarnings(startDate?: Date, endDate?: Date) {
    const whereClause: any = {
      userId: 'PLATFORM',
      type: 'CREDIT',
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const result = await this.prisma.transactionLog.aggregate({
      _sum: { amount: true },
      where: whereClause,
    });

    return result._sum.amount || 0n;
  }

  async getEscrowSummary() {
    const holds = await this.prisma.escrowHold.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    const summary = holds.reduce((acc: any, row) => {
      acc[row.status] = { count: row._count.id, amount: row._sum.totalAmount || 0n };
      return acc;
    }, {});

    return summary;
  }

  async getRefundSummary(startDate?: Date, endDate?: Date) {
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const refunds = await this.prisma.refund.groupBy({
      by: ['refundType'],
      where: whereClause,
      _count: { id: true },
      _sum: { amount: true },
    });

    return refunds.reduce((acc: any, row) => {
      acc[row.refundType] = { count: row._count.id, amount: row._sum.amount || 0n };
      return acc;
    }, {});
  }

  async getWithdrawalSummary() {
    const requests = await this.prisma.withdrawRequest.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
    });

    return requests.reduce((acc: any, row) => {
      acc[row.status] = { count: row._count.id, amount: row._sum.amount || 0n };
      return acc;
    }, {});
  }

  async getOutstandingDebts() {
    const result = await this.prisma.workerDebt.aggregate({
      _count: { id: true },
      _sum: { outstandingAmount: true },
      where: {
        status: { in: ['OUTSTANDING', 'SETTLING'] },
      },
    });

    return {
      count: result._count.id,
      amount: result._sum.outstandingAmount || 0n,
    };
  }

  /**
   * Full user profile aggregation for admin dashboard.
   * Returns user info, transaction history, work history, ratings, disputes.
   */
  async getUserAggregation(userId: string) {
    // 1. User info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        workerProfile: {
          include: {
            workerBalances: true,
            chosenSpecializations: { include: { specialization: true, subSpecialization: true } },
          },
        },
        clientProfile: true,
      },
    });

    if (!user) throw new Error('User not found');

    // 2. Transaction history
    const workerProfileId = user.workerProfile?.id;
    const transactionHistory = workerProfileId
      ? await this.prisma.transactionLog.findMany({
          where: { userId: workerProfileId },
          orderBy: { createdAt: 'desc' },
          take: 50,
        })
      : [];

    // 3. Work history (orders)
    const workHistory = workerProfileId
      ? await this.prisma.order.findMany({
          where: { workerProfileId },
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { ClientProfile: { include: { user: { select: { firstName: true, lastName: true } } } } },
        })
      : [];

    // 4. Ratings
    const ratings = workerProfileId
      ? await this.prisma.order.aggregate({
          where: { workerProfileId, rate: { not: -1.0 } },
          _avg: { rate: true },
          _count: { rate: true },
        })
      : { _avg: { rate: null }, _count: { rate: 0 } };

    // 5. Disputes involvement
    const disputes = await this.prisma.dispute.findMany({
      where: {
        OR: [
          { openedBy: userId },
          ...(workerProfileId
            ? [{ order: { workerProfileId } }]
            : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt,
        profileImageUrl: user.profileImageUrl,
      },
      workerProfile: user.workerProfile
        ? {
            id: user.workerProfile.id,
            rate: user.workerProfile.rate,
            completedJobsCount: user.workerProfile.completedJobsCount,
            experienceYears: user.workerProfile.experienceYears,
            balance: user.workerProfile.workerBalances?.[0] || null,
            specializations: user.workerProfile.chosenSpecializations,
          }
        : null,
      clientProfile: user.clientProfile,
      transactionHistory,
      workHistory,
      ratings: {
        average: ratings._avg.rating,
        count: ratings._count.rating,
      },
      disputes,
    };
  }
}
