import { Prisma } from '../generated/prisma/client.js';
import AppError from '../errors/AppError.js';
import { AdminRole } from '../domain/admin.entity.js';
import {
  AdminCaseListFilter,
  AdminCaseStats,
  AdminCaseSummary,
  CaseType,
  SourceEntityType,
  allowedCaseTypesForRole,
  caseTypeToDepartment,
  isFinancialReport,
} from '../domain/adminCase.entity.js';
import {
  isOpenStatus,
  isResolvedStatus,
  normalizeCaseStatus,
} from '../utils/caseStatusNormalizer.js';
import prisma from '../libs/database.js';
import AdminIssuesService from './AdminIssuesService.js';
import { WithdrawalService } from './financial/WithdrawalService.js';
import { DisputeService } from './financial/DisputeService.js';
import { reportRepository } from '../state.js';
import { workerProfileRepository } from '../state.js';
import { activityLogRepository } from '../state.js';
import { orderRepository } from '../state.js';

type RawCaseRow = {
  id: string;
  sourceEntityType: SourceEntityType;
  rawStatus: string;
  assignedAdminId: string | null;
  assignedDepartment: AdminRole | null;
  title: string;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
  caseType: CaseType;
};

export default class AdminCasesService {
  constructor(
    private readonly issuesService: AdminIssuesService,
    private readonly withdrawalService: WithdrawalService,
    private readonly disputeService: DisputeService
  ) {}

  async listCases(
    adminRole: AdminRole,
    filter: AdminCaseListFilter
  ): Promise<{
    items: AdminCaseSummary[];
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const allowedTypes = this.resolveAllowedCaseTypes(adminRole, filter.caseType);
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const rows: RawCaseRow[] = [];

    if (allowedTypes.includes('ACCOUNT_ISSUE')) {
      rows.push(...(await this.fetchAccountCases(filter)));
    }
    if (allowedTypes.includes('FINANCIAL_ISSUE')) {
      rows.push(...(await this.fetchFinancialCases(filter)));
    }
    if (allowedTypes.includes('DISPUTE_CASE')) {
      rows.push(...(await this.fetchDisputeCases(filter)));
    }

    let summaries = rows.map((row) => this.toSummary(row));

    if (filter.status) {
      summaries = summaries.filter((c) => c.status === filter.status);
    }
    if (filter.assigned !== undefined) {
      summaries = summaries.filter((c) =>
        filter.assigned ? c.assignedAdminId !== null : c.assignedAdminId === null
      );
    }
    if (filter.assignedAdminId) {
      summaries = summaries.filter((c) => c.assignedAdminId === filter.assignedAdminId);
    }

    summaries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    const total = summaries.length;
    const offset = (page - 1) * limit;
    const items = summaries.slice(offset, offset + limit);

    return {
      items,
      page,
      limit,
      total,
      hasNext: offset + limit < total,
      hasPrevious: page > 1,
    };
  }

  async getCaseStats(
    adminRole: AdminRole,
    filter: { createdFrom?: Date; createdTo?: Date }
  ): Promise<AdminCaseStats> {
    const listFilter: AdminCaseListFilter = {
      createdFrom: filter.createdFrom,
      createdTo: filter.createdTo,
      page: 1,
      limit: 10000,
    };

    const { items } = await this.listCases(adminRole, listFilter);

    return {
      total: items.length,
      open: items.filter((c) => isOpenStatus(c.status)).length,
      assigned: items.filter((c) => c.assignedAdminId !== null).length,
      unassigned: items.filter((c) => c.assignedAdminId === null).length,
      resolved: items.filter((c) => isResolvedStatus(c.status)).length,
    };
  }

  async getCaseDetail(
    adminRole: AdminRole,
    adminId: string,
    caseType: CaseType,
    caseId: string
  ): Promise<Record<string, unknown>> {
    this.assertCaseTypeAccess(adminRole, caseType);

    const resolved = await this.resolveSourceEntity(caseType, caseId);
    if (!resolved) throw new AppError('Case not found', 404);

    const { sourceEntityType, sourceEntityId, ownership } = resolved;

    if (adminRole !== 'SUPER_ADMIN') {
      if (!ownership.assignedAdminId || ownership.assignedAdminId !== adminId) {
        throw new AppError('Cannot access a case you do not own', 403);
      }
    }

    const [notes, history] = await Promise.all([
      this.issuesService.getNotes(sourceEntityType, sourceEntityId),
      this.issuesService.getHistory(sourceEntityType, sourceEntityId),
    ]);

    const assignment = {
      owner: ownership.assignedAdminId,
      department: ownership.assignedDepartment,
      notes,
      history,
    };

    switch (caseType) {
      case 'ACCOUNT_ISSUE':
        return this.buildAccountDetail(sourceEntityType, sourceEntityId, assignment);
      case 'FINANCIAL_ISSUE':
        return this.buildFinancialDetail(sourceEntityType, sourceEntityId, assignment);
      case 'DISPUTE_CASE':
        return this.buildDisputeDetail(sourceEntityId, assignment);
    }
  }

  private resolveAllowedCaseTypes(role: AdminRole, requested?: CaseType): CaseType[] {
    const roleAllowed = allowedCaseTypesForRole(role);
    const allTypes: CaseType[] = ['ACCOUNT_ISSUE', 'FINANCIAL_ISSUE', 'DISPUTE_CASE'];

    const base = roleAllowed === null ? allTypes : roleAllowed;
    if (requested) {
      if (!base.includes(requested)) {
        throw new AppError('You do not have access to this case type', 403);
      }
      return [requested];
    }
    return base;
  }

  private assertCaseTypeAccess(role: AdminRole, caseType: CaseType): void {
    const allowed = allowedCaseTypesForRole(role);
    if (allowed !== null && !allowed.includes(caseType)) {
      throw new AppError('You do not have access to this case type', 403);
    }
  }

  private buildOwnershipWhere(filter: AdminCaseListFilter): Prisma.ReportWhereInput {
    const where: Prisma.ReportWhereInput = {};

    if (filter.createdFrom || filter.createdTo) {
      where.createdAt = {};
      if (filter.createdFrom) where.createdAt.gte = filter.createdFrom;
      if (filter.createdTo) where.createdAt.lte = filter.createdTo;
    }
    if (filter.assignedAdminId) where.assignedAdminId = filter.assignedAdminId;
    if (filter.assigned === true) where.assignedAdminId = { not: null };
    if (filter.assigned === false) where.assignedAdminId = null;

    return where;
  }

  private buildSearchOr(search: string): Prisma.StringFilter | undefined {
    if (!search) return undefined;
    return { contains: search, mode: 'insensitive' };
  }

  private async fetchAccountCases(filter: AdminCaseListFilter): Promise<RawCaseRow[]> {
    const baseWhere = this.buildOwnershipWhere(filter);
    const search = filter.search?.trim();

    const accountReportWhere: Prisma.ReportWhereInput = {
      ...baseWhere,
      NOT: {
        AND: [{ problemCategory: 'ORDER_ISSUE' }, { problemType: { in: ['PAYMENT_DISPUTE', 'PAYMENT_FRAUD'] } }],
      },
      ...(search
        ? {
            OR: [
              { description: { contains: search, mode: 'insensitive' } },
              ...(search.length === 36 ? [{ id: search }] : []),
            ],
          }
        : {}),
    };

    const verificationWhere: Prisma.WorkerVerificationWhereInput = {
      ...(filter.createdFrom || filter.createdTo
        ? {
            createdAt: {
              ...(filter.createdFrom ? { gte: filter.createdFrom } : {}),
              ...(filter.createdTo ? { lte: filter.createdTo } : {}),
            },
          }
        : {}),
      ...(filter.assignedAdminId ? { assignedAdminId: filter.assignedAdminId } : {}),
      ...(filter.assigned === true ? { assignedAdminId: { not: null } } : {}),
      ...(filter.assigned === false ? { assignedAdminId: null } : {}),
      ...(search
        ? {
            workerProfile: {
              user: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { phoneNumber: { contains: search } },
                ],
              },
            },
          }
        : {}),
    };

    const [reports, verifications] = await Promise.all([
      prisma.report.findMany({
        where: accountReportWhere,
        select: {
          id: true,
          status: true,
          assignedAdminId: true,
          assignedDepartment: true,
          problemCategory: true,
          problemType: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
        take: 500,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.workerVerification.findMany({
        where: verificationWhere,
        select: {
          id: true,
          status: true,
          assignedAdminId: true,
          assignedDepartment: true,
          createdAt: true,
          updatedAt: true,
          workerProfile: {
            select: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
        take: 500,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return [
      ...reports.map((r) => ({
        id: r.id,
        sourceEntityType: 'REPORT' as const,
        rawStatus: r.status,
        assignedAdminId: r.assignedAdminId,
        assignedDepartment: r.assignedDepartment,
        title: `${r.problemCategory} - ${r.problemType}`,
        summary: r.description.slice(0, 200),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        caseType: 'ACCOUNT_ISSUE' as const,
      })),
      ...verifications.map((v) => ({
        id: v.id,
        sourceEntityType: 'VERIFICATION' as const,
        rawStatus: v.status,
        assignedAdminId: v.assignedAdminId,
        assignedDepartment: v.assignedDepartment,
        title: 'Worker Verification Review',
        summary: `Verification for ${v.workerProfile.user.firstName} ${v.workerProfile.user.lastName}`,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        caseType: 'ACCOUNT_ISSUE' as const,
      })),
    ];
  }

  private async fetchFinancialCases(filter: AdminCaseListFilter): Promise<RawCaseRow[]> {
    const dateFilter =
      filter.createdFrom || filter.createdTo
        ? {
            createdAt: {
              ...(filter.createdFrom ? { gte: filter.createdFrom } : {}),
              ...(filter.createdTo ? { lte: filter.createdTo } : {}),
            },
          }
        : {};

    const assignmentFilter = {
      ...(filter.assignedAdminId ? { assignedAdminId: filter.assignedAdminId } : {}),
      ...(filter.assigned === true ? { assignedAdminId: { not: null } } : {}),
      ...(filter.assigned === false ? { assignedAdminId: null } : {}),
    };

    const search = filter.search?.trim();

    const financialReportWhere: Prisma.ReportWhereInput = {
      ...this.buildOwnershipWhere(filter),
      problemCategory: 'ORDER_ISSUE',
      problemType: { in: ['PAYMENT_DISPUTE', 'PAYMENT_FRAUD'] },
      ...(search
        ? {
            OR: [
              { description: { contains: search, mode: 'insensitive' } },
              { id: search.length === 36 ? search : undefined },
            ].filter(Boolean) as Prisma.ReportWhereInput[],
          }
        : {}),
    };

    const withdrawWhere: Prisma.WithdrawRequestWhereInput = {
      ...dateFilter,
      ...assignmentFilter,
      ...(search
        ? {
            workerProfile: {
              user: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { phoneNumber: { contains: search } },
                ],
              },
            },
          }
        : {}),
    };

    const [financialReports, withdraws, refunds, escrows, failedPayments] = await Promise.all([
      prisma.report.findMany({
        where: financialReportWhere,
        select: {
          id: true,
          status: true,
          assignedAdminId: true,
          assignedDepartment: true,
          problemType: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
        take: 500,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.withdrawRequest.findMany({
        where: withdrawWhere,
        select: {
          id: true,
          status: true,
          amount: true,
          createdAt: true,
          updatedAt: true,
        },
        take: 500,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.refund.findMany({
        where: {
          ...dateFilter,
          ...assignmentFilter,
          ...(search ? { orderId: search.length === 36 ? search : undefined } : {}),
        },
        select: {
          id: true,
          orderId: true,
          amount: true,
          reasonCode: true,
          createdAt: true,
        },
        take: 500,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.escrowHold.findMany({
        where: {
          ...dateFilter,
          ...assignmentFilter,
          ...(search ? { orderId: search.length === 36 ? search : undefined } : {}),
        },
        select: {
          id: true,
          orderId: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          updatedAt: true,
        },
        take: 500,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.paymentAttempt.findMany({
        where: {
          status: 'FAILED',
          ...dateFilter,
          ...(search
            ? {
                OR: [{ orderId: search.length === 36 ? search : undefined }, { id: search.length === 36 ? search : undefined }],
              }
            : {}),
        },
        select: {
          id: true,
          orderId: true,
          status: true,
          amount: true,
          createdAt: true,
        },
        take: 500,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return [
      ...financialReports.map((r) => ({
        id: r.id,
        sourceEntityType: 'REPORT' as const,
        rawStatus: r.status,
        assignedAdminId: r.assignedAdminId,
        assignedDepartment: r.assignedDepartment,
        title: `Financial Report - ${r.problemType}`,
        summary: r.description.slice(0, 200),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        caseType: 'FINANCIAL_ISSUE' as const,
      })),
      ...withdraws.map((w) => ({
        id: w.id,
        sourceEntityType: 'WITHDRAW_REQUEST' as const,
        rawStatus: w.status,
        assignedAdminId: null,
        assignedDepartment: null,
        title: 'Withdrawal Request',
        summary: `Amount: ${w.amount.toString()} EGP`,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        caseType: 'FINANCIAL_ISSUE' as const,
      })),
      ...refunds.map((r) => ({
        id: r.id,
        sourceEntityType: 'REFUND' as const,
        rawStatus: 'RESOLVED',
        assignedAdminId: null,
        assignedDepartment: null,
        title: 'Refund',
        summary: `Order ${r.orderId} - ${r.reasonCode}`,
        createdAt: r.createdAt,
        updatedAt: r.createdAt,
        caseType: 'FINANCIAL_ISSUE' as const,
      })),
      ...escrows.map((e) => ({
        id: e.id,
        sourceEntityType: 'ESCROW_HOLD' as const,
        rawStatus: e.status,
        assignedAdminId: null,
        assignedDepartment: null,
        title: 'Escrow Hold',
        summary: `Order ${e.orderId} - ${e.totalAmount.toString()} EGP`,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        caseType: 'FINANCIAL_ISSUE' as const,
      })),
      ...failedPayments.map((p) => ({
        id: p.id,
        sourceEntityType: 'PAYMENT_ATTEMPT' as const,
        rawStatus: p.status,
        assignedAdminId: null,
        assignedDepartment: null,
        title: 'Failed Payment Attempt',
        summary: `Order ${p.orderId} - ${p.amount.toString()} EGP`,
        createdAt: p.createdAt,
        updatedAt: p.createdAt,
        caseType: 'FINANCIAL_ISSUE' as const,
      })),
    ];
  }

  private async fetchDisputeCases(filter: AdminCaseListFilter): Promise<RawCaseRow[]> {
    const search = filter.search?.trim();

    const where: Prisma.DisputeWhereInput = {
      ...(filter.createdFrom || filter.createdTo
        ? {
            createdAt: {
              ...(filter.createdFrom ? { gte: filter.createdFrom } : {}),
              ...(filter.createdTo ? { lte: filter.createdTo } : {}),
            },
          }
        : {}),
      ...(filter.assignedAdminId ? { assignedAdminId: filter.assignedAdminId } : {}),
      ...(filter.assigned === true ? { assignedAdminId: { not: null } } : {}),
      ...(filter.assigned === false ? { assignedAdminId: null } : {}),
      ...(search
        ? {
            OR: [
              { id: search.length === 36 ? search : undefined },
              { orderId: search.length === 36 ? search : undefined },
            ],
          }
        : {}),
    };

    const disputes = await prisma.dispute.findMany({
      where,
      select: {
        id: true,
        orderId: true,
        status: true,
        assignedAdminId: true,
        assignedDepartment: true,
        createdAt: true,
        updatedAt: true,
      },
      take: 500,
      orderBy: { updatedAt: 'desc' },
    });

    return disputes.map((d) => ({
      id: d.id,
      sourceEntityType: 'DISPUTE' as const,
      rawStatus: d.status,
      assignedAdminId: d.assignedAdminId,
      assignedDepartment: d.assignedDepartment,
      title: 'Service Dispute',
      summary: `Dispute for order ${d.orderId}`,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      caseType: 'DISPUTE_CASE' as const,
    }));
  }

  private toSummary(row: RawCaseRow): AdminCaseSummary {
    return {
      caseId: row.id,
      caseType: row.caseType,
      department: caseTypeToDepartment(row.caseType),
      assignedAdminId: row.assignedAdminId,
      title: row.title,
      summary: row.summary,
      status: normalizeCaseStatus(row.sourceEntityType, row.rawStatus),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      sourceEntityType: row.sourceEntityType,
      sourceEntityId: row.id,
    };
  }

  private async resolveSourceEntity(
    caseType: CaseType,
    caseId: string
  ): Promise<{
    sourceEntityType: SourceEntityType;
    sourceEntityId: string;
    ownership: { assignedAdminId: string | null; assignedDepartment: AdminRole | null };
  } | null> {
    switch (caseType) {
      case 'ACCOUNT_ISSUE': {
        const report = await prisma.report.findUnique({
          where: { id: caseId },
          select: {
            id: true,
            problemCategory: true,
            problemType: true,
            assignedAdminId: true,
            assignedDepartment: true,
          },
        });
        if (report && !isFinancialReport(report.problemCategory, report.problemType)) {
          return {
            sourceEntityType: 'REPORT',
            sourceEntityId: report.id,
            ownership: {
              assignedAdminId: report.assignedAdminId,
              assignedDepartment: report.assignedDepartment,
            },
          };
        }
        const verification = await prisma.workerVerification.findUnique({
          where: { id: caseId },
          select: { id: true, assignedAdminId: true, assignedDepartment: true },
        });
        if (verification) {
          return {
            sourceEntityType: 'VERIFICATION',
            sourceEntityId: verification.id,
            ownership: {
              assignedAdminId: verification.assignedAdminId,
              assignedDepartment: verification.assignedDepartment,
            },
          };
        }
        return null;
      }
      case 'FINANCIAL_ISSUE': {
        const report = await prisma.report.findUnique({
          where: { id: caseId },
          select: {
            id: true,
            problemCategory: true,
            problemType: true,
            assignedAdminId: true,
            assignedDepartment: true,
          },
        });
        if (report && isFinancialReport(report.problemCategory, report.problemType)) {
          return {
            sourceEntityType: 'REPORT',
            sourceEntityId: report.id,
            ownership: {
              assignedAdminId: report.assignedAdminId,
              assignedDepartment: report.assignedDepartment,
            },
          };
        }
        const withdraw = await prisma.withdrawRequest.findUnique({
          where: { id: caseId },
          select: { id: true },
        });
        if (withdraw) {
          return {
            sourceEntityType: 'WITHDRAW_REQUEST',
            sourceEntityId: withdraw.id,
            ownership: {
              assignedAdminId: null,
              assignedDepartment: null,
            },
          };
        }
        const refund = await prisma.refund.findUnique({
          where: { id: caseId },
          select: { id: true },
        });
        if (refund) {
          return {
            sourceEntityType: 'REFUND',
            sourceEntityId: refund.id,
            ownership: {
              assignedAdminId: null,
              assignedDepartment: null,
            },
          };
        }
        const escrow = await prisma.escrowHold.findUnique({
          where: { id: caseId },
          select: { id: true },
        });
        if (escrow) {
          return {
            sourceEntityType: 'ESCROW_HOLD',
            sourceEntityId: escrow.id,
            ownership: {
              assignedAdminId: null,
              assignedDepartment: null,
            },
          };
        }
        const paymentAttempt = await prisma.paymentAttempt.findUnique({
          where: { id: caseId },
          select: { id: true, status: true },
        });
        if (paymentAttempt) {
          return {
            sourceEntityType: 'PAYMENT_ATTEMPT',
            sourceEntityId: paymentAttempt.id,
            ownership: { assignedAdminId: null, assignedDepartment: null },
          };
        }
        return null;
      }
      case 'DISPUTE_CASE': {
        const dispute = await prisma.dispute.findUnique({
          where: { id: caseId },
          select: { id: true },
        });
        if (!dispute) return null;
        return {
          sourceEntityType: 'DISPUTE',
          sourceEntityId: dispute.id,
          ownership: {
            assignedAdminId: null,
            assignedDepartment: null,
          },
        };
      }
    }
  }

  private async buildAccountDetail(
    sourceEntityType: SourceEntityType,
    sourceEntityId: string,
    assignment: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (sourceEntityType === 'REPORT') {
      const report = await reportRepository.findById({ id: sourceEntityId });
      if (!report) throw new AppError('Report not found', 404);

      const reporter = await prisma.user.findUnique({
        where: { id: report.reporterId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
        },
      });

      let target: Record<string, unknown> | null = null;
      if (report.targetId) {
        const targetUser = await prisma.user.findUnique({
          where: { id: report.targetId },
          select: { id: true, firstName: true, lastName: true, phoneNumber: true, role: true },
        });
        target = targetUser;
      }

      return {
        caseType: 'ACCOUNT_ISSUE',
        sourceEntityType,
        sourceEntityId,
        report: {
          ...report,
          status: report.status,
          category: report.problemCategory,
          problemType: report.problemType,
          description: report.description,
        },
        reporter,
        target,
        attachments: report.images,
        assignment,
      };
    }

    const verification = await workerProfileRepository.findVerificationById(sourceEntityId);
    if (!verification) throw new AppError('Verification not found', 404);

    const workerProfile = verification.workerProfileId
      ? await prisma.workerProfile.findUnique({
          where: { id: verification.workerProfileId as string },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, phoneNumber: true },
            },
          },
        })
      : null;

    return {
      caseType: 'ACCOUNT_ISSUE',
      sourceEntityType,
      sourceEntityId,
      verification,
      worker: workerProfile?.user ?? null,
      assignment,
    };
  }

  private async buildFinancialDetail(
    sourceEntityType: SourceEntityType,
    sourceEntityId: string,
    assignment: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (sourceEntityType === 'WITHDRAW_REQUEST') {
      const withdrawal = await this.withdrawalService.getWithdrawRequestForAdmin(sourceEntityId);
      const activityLogs = await activityLogRepository.findByEntity('WithdrawRequest', sourceEntityId);
      return {
        caseType: 'FINANCIAL_ISSUE',
        sourceEntityType,
        sourceEntityId,
        withdrawal,
        activityLogs,
        assignment,
      };
    }

    if (sourceEntityType === 'REPORT') {
      const report = await reportRepository.findById({ id: sourceEntityId });
      if (!report) throw new AppError('Report not found', 404);
      return {
        caseType: 'FINANCIAL_ISSUE',
        sourceEntityType,
        sourceEntityId,
        report,
        assignment,
      };
    }

    if (sourceEntityType === 'REFUND') {
      const refund = await prisma.refund.findUnique({ where: { id: sourceEntityId } });
      if (!refund) throw new AppError('Refund not found', 404);
      const order = await orderRepository.find({ filter: { id: refund.orderId } });
      const activityLogs = await activityLogRepository.findByEntity('Refund', sourceEntityId);
      return {
        caseType: 'FINANCIAL_ISSUE',
        sourceEntityType,
        sourceEntityId,
        refund,
        order,
        activityLogs,
        assignment,
      };
    }

    if (sourceEntityType === 'ESCROW_HOLD') {
      const escrow = await prisma.escrowHold.findUnique({
        where: { id: sourceEntityId },
        include: { order: true, payment: true },
      });
      if (!escrow) throw new AppError('Escrow hold not found', 404);
      const activityLogs = await activityLogRepository.findByEntity('EscrowHold', sourceEntityId);
      return {
        caseType: 'FINANCIAL_ISSUE',
        sourceEntityType,
        sourceEntityId,
        escrow,
        activityLogs,
        assignment,
      };
    }

    const paymentAttempt = await prisma.paymentAttempt.findUnique({
      where: { id: sourceEntityId },
      include: { order: true },
    });
    if (!paymentAttempt) throw new AppError('Payment attempt not found', 404);

    return {
      caseType: 'FINANCIAL_ISSUE',
      sourceEntityType,
      sourceEntityId,
      paymentAttempt,
      assignment,
    };
  }

  private async buildDisputeDetail(
    sourceEntityId: string,
    assignment: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const disputeDetail = await this.disputeService.getDispute(sourceEntityId);
    const order = await orderRepository.find({ filter: { id: disputeDetail.orderId } });

    const orderRecord = order
      ? await prisma.order.findUnique({
          where: { id: disputeDetail.orderId },
          include: {
            workerProfile: {
              include: { user: { select: { id: true, firstName: true, lastName: true } } },
            },
            clientProfile: {
              include: { user: { select: { id: true, firstName: true, lastName: true } } },
            },
          },
        })
      : null;

    return {
      caseType: 'DISPUTE_CASE',
      sourceEntityType: 'DISPUTE',
      sourceEntityId,
      dispute: {
        status: disputeDetail.status,
        evidence: disputeDetail.evidence,
        timeline: disputeDetail.eventTimeline,
        resolution: disputeDetail.resolution,
        resolutionNote: disputeDetail.resolutionNote,
      },
      order: orderRecord,
      participants: {
        worker: orderRecord?.workerProfile?.user ?? null,
        client: orderRecord?.clientProfile?.user ?? null,
      },
      messages: disputeDetail.messages,
      assignment,
    };
  }
}
