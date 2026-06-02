import { PrismaClient } from '../../../generated/prisma/client.js';
import { Repository } from '../Repository.js';
import IFinancialDashboardRepository, {
  EscrowStatusSummary,
  OutstandingDebtsSummary,
  RefundTypeSummary,
  WithdrawStatusSummary,
} from '../../interfaces/financial/FinancialDashboardRepository.js';

export class FinancialDashboardRepository extends Repository implements IFinancialDashboardRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async aggregatePlatformEarnings(startDate?: Date, endDate?: Date): Promise<bigint> {
    const whereClause: Record<string, unknown> = {
      userId: 'PLATFORM',
      type: 'CREDIT',
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) (whereClause.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (whereClause.createdAt as Record<string, Date>).lte = endDate;
    }

    const result = await this.prismaClient.transactionLog.aggregate({
      _sum: { amount: true },
      where: whereClause,
    });

    return result._sum.amount || 0n;
  }

  async groupEscrowByStatus(): Promise<EscrowStatusSummary> {
    const holds = await this.prismaClient.escrowHold.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    return holds.reduce((acc: EscrowStatusSummary, row) => {
      acc[row.status] = { count: row._count.id, amount: row._sum.totalAmount || 0n };
      return acc;
    }, {});
  }

  async groupRefundsByType(startDate?: Date, endDate?: Date): Promise<RefundTypeSummary> {
    const whereClause: Record<string, unknown> = {};
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) (whereClause.createdAt as Record<string, Date>).gte = startDate;
      if (endDate) (whereClause.createdAt as Record<string, Date>).lte = endDate;
    }

    const refunds = await this.prismaClient.refund.groupBy({
      by: ['refundType'],
      where: whereClause,
      _count: { id: true },
      _sum: { amount: true },
    });

    return refunds.reduce((acc: RefundTypeSummary, row) => {
      acc[row.refundType] = { count: row._count.id, amount: row._sum.amount || 0n };
      return acc;
    }, {});
  }

  async groupWithdrawRequestsByStatus(): Promise<WithdrawStatusSummary> {
    const requests = await this.prismaClient.withdrawRequest.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true },
    });

    return requests.reduce((acc: WithdrawStatusSummary, row) => {
      acc[row.status] = { count: row._count.id, amount: row._sum.amount || 0n };
      return acc;
    }, {});
  }

  async aggregateOutstandingDebts(): Promise<OutstandingDebtsSummary> {
    const result = await this.prismaClient.workerDebt.aggregate({
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

  async findUserForAggregation(userId: string) {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
      include: {
        workerProfile: {
          include: {
            workerBalance: true,
            chosenSpecializations: { include: { specialization: true, subSpecialization: true } },
          },
        },
        clientProfile: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt,
      profileImageUrl: user.profileImageUrl,
      workerProfile: user.workerProfile
        ? {
            id: user.workerProfile.id,
            rate: user.workerProfile.rate,
            completedJobsCount: user.workerProfile.completedJobsCount,
            experienceYears: user.workerProfile.experienceYears,
            balance: user.workerProfile.workerBalance || null,
            specializations: user.workerProfile.chosenSpecializations,
          }
        : null,
      clientProfile: user.clientProfile,
      workerProfileId: user.workerProfile?.id,
    };
  }

  async findTransactionHistory(workerProfileId: string, limit: number) {
    return this.prismaClient.transactionLog.findMany({
      where: { userId: workerProfileId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findWorkHistory(workerProfileId: string, limit: number) {
    return this.prismaClient.order.findMany({
      where: { workerProfileId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        clientProfile: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
  }

  async aggregateWorkerRatings(workerProfileId: string) {
    const ratings = await this.prismaClient.order.aggregate({
      where: { workerProfileId, rate: { not: -1.0 } },
      _avg: { rate: true },
      _count: { rate: true },
    });

    return {
      average: ratings._avg.rate,
      count: ratings._count.rate,
    };
  }

  async findUserDisputes(userId: string, workerProfileId?: string, limit = 20) {
    return this.prismaClient.dispute.findMany({
      where: {
        OR: [
          { openedBy: userId },
          ...(workerProfileId ? [{ order: { workerProfileId } }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async adminHasAssignedIssueForUser(adminId: string, userId: string): Promise<boolean> {
    const [hasReport, hasDispute, hasVerification] = await Promise.all([
      this.prismaClient.report.findFirst({
        where: {
          assignedAdminId: adminId,
          OR: [{ targetId: userId }, { reporterId: userId }],
        },
      }),
      this.prismaClient.dispute.findFirst({
        where: {
          assignedAdminId: adminId,
          order: { workerProfile: { userId } },
        },
      }),
      this.prismaClient.workerVerification.findFirst({
        where: {
          assignedAdminId: adminId,
          workerProfile: { userId },
        },
      }),
    ]);

    return Boolean(hasReport || hasDispute || hasVerification);
  }
}
