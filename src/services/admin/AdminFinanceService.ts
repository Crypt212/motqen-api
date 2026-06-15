import { PrismaClient } from '../../generated/prisma/client.js';
import { DashboardService } from '../financial/DashboardService.js';
import { EscrowService } from '../financial/EscrowService.js';
import { WithdrawalService } from '../financial/WithdrawalService.js';
import { RefundService } from '../financial/RefundService.js';
import IFeeRuleRepository from '../../repositories/interfaces/financial/FeeRuleRepository.js';
import IActivityLogRepository from '../../repositories/interfaces/financial/ActivityLogRepository.js';
import { parseAdminPagination, toNumber, toPaginatedResponse } from '../../utils/adminPagination.js';
import AppError from '../../errors/AppError.js';

type ListQuery = {
  page?: string | number;
  pageSize?: string | number;
};

const ESCROW_STATUS_MAP: Record<string, string> = {
  HELD: 'held',
  RELEASED: 'released',
  DISPUTE_HOLD: 'dispute_frozen',
  REFUNDED: 'refunded',
};

const WITHDRAW_STATUS_MAP: Record<string, string> = {
  PENDING: 'pending',
  IN_PROGRESS: 'processing',
  COMPLETED: 'approved',
  CANCELLED: 'rejected',
  FAILED: 'rejected',
};

const PAYOUT_STATUS_MAP: Record<string, string> = {
  PENDING: 'pending',
  COMPLETED: 'succeeded',
  FAILED: 'failed',
};

const DEBT_STATUS_MAP: Record<string, string> = {
  OUTSTANDING: 'outstanding',
  SETTLING: 'outstanding',
  SETTLED: 'recovered',
};

export class AdminFinanceService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly dashboardService: DashboardService,
    private readonly escrowService: EscrowService,
    private readonly withdrawalService: WithdrawalService,
    private readonly refundService: RefundService,
    private readonly feeRuleRepo: IFeeRuleRepository,
    private readonly activityLogRepo: IActivityLogRepository
  ) {}

  async listPayments(params?: ListQuery & { status?: string; from?: string; to?: string; orderId?: string; clientId?: string }) {
    const { page, pageSize, skip } = parseAdminPagination(params ?? {});
    const where: Record<string, unknown> = {};
    if (params?.orderId) where.orderId = params.orderId;
    if (params?.from || params?.to) {
      where.createdAt = {};
      if (params.from) (where.createdAt as Record<string, Date>).gte = new Date(params.from);
      if (params.to) (where.createdAt as Record<string, Date>).lte = new Date(params.to);
    }
    if (params?.clientId) {
      where.order = { clientProfile: { userId: params.clientId } };
    }

    const [rows, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: {
              clientProfile: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
            },
          },
          escrowHold: true,
          paymentAttempts: { orderBy: { createdAt: 'desc' } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    const data = rows.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      clientId: p.order.clientProfile.user.id,
      clientName: [p.order.clientProfile.user.firstName, p.order.clientProfile.user.lastName].filter(Boolean).join(' '),
      amount: toNumber(p.amount),
      currency: p.currency,
      status: p.escrowHold?.status === 'REFUNDED' ? 'refunded' : 'confirmed',
      confirmedAt: p.createdAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
      attempts: p.paymentAttempts.map((a) => ({
        id: a.id,
        intentionId: a.paymentId || '',
        status: a.status.toLowerCase(),
        providerAttemptId: a.id,
        providerResponseCode: a.providerResponseCode || '',
        providerMessage: a.providerResponseMessage || '',
        amount: toNumber(a.amount),
        attemptedAt: a.createdAt.toISOString(),
      })),
      escrowHold: p.escrowHold
        ? {
            id: p.escrowHold.id,
            paymentId: p.escrowHold.paymentId,
            orderId: p.escrowHold.orderId,
            heldAmount: toNumber(p.escrowHold.totalAmount),
            status: ESCROW_STATUS_MAP[p.escrowHold.status] || p.escrowHold.status.toLowerCase(),
            workerShare: toNumber(p.escrowHold.workerAmount),
            platformShare: toNumber(p.escrowHold.platformFee),
            createdAt: p.escrowHold.createdAt.toISOString(),
            releasedAt: p.escrowHold.releasedAt?.toISOString() ?? undefined,
          }
        : undefined,
    }));

    return toPaginatedResponse(data, total, page, pageSize);
  }

  async getPayment(id: string) {
    const list = await this.listPayments({ page: 1, pageSize: 1000 });
    const mapped = list.data.find((p) => p.id === id);
    if (!mapped) throw new AppError('Payment not found', 404);
    return mapped;
  }

  async listEscrowHolds(params?: ListQuery & { status?: string; orderId?: string }) {
    const { page, pageSize, skip } = parseAdminPagination(params ?? {});
    const where: Record<string, unknown> = {};
    if (params?.orderId) where.orderId = params.orderId;
    if (params?.status) {
      const statusKey = Object.entries(ESCROW_STATUS_MAP).find(([, v]) => v === params.status)?.[0];
      if (statusKey) where.status = statusKey;
    }

    const [rows, total] = await Promise.all([
      this.prisma.escrowHold.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.escrowHold.count({ where }),
    ]);

    const data = rows.map((h) => ({
      id: h.id,
      paymentId: h.paymentId,
      orderId: h.orderId,
      heldAmount: toNumber(h.totalAmount),
      status: ESCROW_STATUS_MAP[h.status] || h.status.toLowerCase(),
      workerShare: toNumber(h.workerAmount),
      platformShare: toNumber(h.platformFee),
      createdAt: h.createdAt.toISOString(),
      releasedAt: h.releasedAt?.toISOString() ?? undefined,
      releaseScheduledAt: h.escrowReleaseEligibleAt?.toISOString() ?? undefined,
    }));

    return toPaginatedResponse(data, total, page, pageSize);
  }

  async releaseEscrow(id: string, _note?: string) {
    await this.escrowService.releaseHold(id);
    const hold = await this.prisma.escrowHold.findUnique({ where: { id } });
    if (!hold) throw new AppError('Escrow hold not found', 404);
    return {
      id: hold.id,
      status: 'released',
      workerShare: toNumber(hold.workerAmount),
      platformShare: toNumber(hold.platformFee),
      feeRateApplied: ((hold.feeRuleSnapshot as { percentage?: number })?.percentage ?? 0) / 100,
      releasedAt: (hold.releasedAt ?? new Date()).toISOString(),
      ledgerEntryIds: [] as string[],
    };
  }

  async listLedgerEntries(params?: ListQuery & { entryType?: string; partyType?: string; partyId?: string; from?: string; to?: string }) {
    const { page, pageSize, skip } = parseAdminPagination(params ?? {});
    const where: Record<string, unknown> = {};
    if (params?.partyId) where.userId = params.partyId;
    if (params?.from || params?.to) {
      where.createdAt = {};
      if (params.from) (where.createdAt as Record<string, Date>).gte = new Date(params.from);
      if (params.to) (where.createdAt as Record<string, Date>).lte = new Date(params.to);
    }

    const [rows, total] = await Promise.all([
      this.prisma.transactionLog.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.transactionLog.count({ where }),
    ]);

    const data = rows.map((e) => ({
      id: e.id,
      entryType: e.referenceType.toLowerCase(),
      direction: e.type === 'CREDIT' ? 'credit' : 'debit',
      partyType: 'worker',
      partyId: e.userId,
      amount: toNumber(e.amount),
      currency: 'EGP',
      referenceType: e.referenceType,
      referenceId: e.referenceId,
      description: e.description ?? undefined,
      createdAt: e.createdAt.toISOString(),
    }));

    return toPaginatedResponse(data, total, page, pageSize);
  }

  async listWorkerBalances(params?: ListQuery & { workerId?: string }) {
    const { page, pageSize, skip } = parseAdminPagination(params ?? {});
    const where: Record<string, unknown> = {};
    if (params?.workerId) where.workerProfileId = params.workerId;

    const [rows, total] = await Promise.all([
      this.prisma.workerBalance.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          workerProfile: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      }),
      this.prisma.workerBalance.count({ where }),
    ]);

    const data = rows.map((b) => ({
      id: b.id,
      workerId: b.workerProfileId,
      workerName: [b.workerProfile.user.firstName, b.workerProfile.user.lastName].filter(Boolean).join(' '),
      totalEarned: toNumber(b.totalEarned),
      totalWithdrawn: toNumber(b.withdrawn),
      frozenAmount: toNumber(b.onHoldForDispute),
      pendingWithdrawal: toNumber(b.pendingWithdraw),
      availableBalance: toNumber(b.totalEarned - b.withdrawn - b.pendingWithdraw - b.onHoldForDispute - b.deductedForDebts),
      lastUpdatedAt: b.updatedAt.toISOString(),
      hasDebts: b.deductedForDebts > 0n,
    }));

    return toPaginatedResponse(data, total, page, pageSize);
  }

  async getWorkerBalanceWithLedger(workerId: string) {
    const balance = await this.prisma.workerBalance.findUnique({
      where: { workerProfileId: workerId },
      include: { workerProfile: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });
    if (!balance) throw new AppError('Worker balance not found', 404);

    const ledgerEntries = await this.prisma.transactionLog.findMany({
      where: { userId: workerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      balance: {
        id: balance.id,
        workerId: balance.workerProfileId,
        workerName: [balance.workerProfile.user.firstName, balance.workerProfile.user.lastName].filter(Boolean).join(' '),
        totalEarned: toNumber(balance.totalEarned),
        totalWithdrawn: toNumber(balance.withdrawn),
        frozenAmount: toNumber(balance.onHoldForDispute),
        pendingWithdrawal: toNumber(balance.pendingWithdraw),
        availableBalance: toNumber(
          balance.totalEarned -
            balance.withdrawn -
            balance.pendingWithdraw -
            balance.onHoldForDispute -
            balance.deductedForDebts
        ),
        lastUpdatedAt: balance.updatedAt.toISOString(),
      },
      ledgerEntries: ledgerEntries.map((e) => ({
        id: e.id,
        entryType: e.referenceType.toLowerCase(),
        direction: e.type === 'CREDIT' ? 'credit' : 'debit',
        partyType: 'worker',
        partyId: e.userId,
        amount: toNumber(e.amount),
        currency: 'EGP',
        referenceType: e.referenceType,
        referenceId: e.referenceId,
        description: e.description ?? undefined,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  }

  async listWithdrawals(params?: ListQuery & { status?: string; workerId?: string }) {
    const { page, pageSize, skip } = parseAdminPagination(params ?? {});
    const where: Record<string, unknown> = {};
    if (params?.workerId) where.workerProfileId = params.workerId;
    if (params?.status) {
      const statusKey = Object.entries(WITHDRAW_STATUS_MAP).find(([, v]) => v === params.status)?.[0];
      if (statusKey) where.status = statusKey;
    }

    const [rows, total] = await Promise.all([
      this.prisma.withdrawRequest.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { workerProfile: { include: { user: { select: { firstName: true, lastName: true } } } } },
      }),
      this.prisma.withdrawRequest.count({ where }),
    ]);

    const data = rows.map((w) => ({
      id: w.id,
      workerId: w.workerProfileId,
      workerName: [w.workerProfile.user.firstName, w.workerProfile.user.lastName].filter(Boolean).join(' '),
      amount: toNumber(w.amount),
      status: WITHDRAW_STATUS_MAP[w.status] || w.status.toLowerCase(),
      requestedAt: w.createdAt.toISOString(),
      reviewedAt: w.updatedAt.toISOString(),
      reviewedBy: w.processedBy,
      rejectionReason: w.adminNotes,
    }));

    return toPaginatedResponse(data, total, page, pageSize);
  }

  async getWithdrawal(id: string) {
    const w = await this.prisma.withdrawRequest.findUnique({
      where: { id },
      include: { workerProfile: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });
    if (!w) throw new AppError('Withdrawal not found', 404);
    return {
      id: w.id,
      workerId: w.workerProfileId,
      workerName: [w.workerProfile.user.firstName, w.workerProfile.user.lastName].filter(Boolean).join(' '),
      amount: toNumber(w.amount),
      status: WITHDRAW_STATUS_MAP[w.status] || w.status.toLowerCase(),
      requestedAt: w.createdAt.toISOString(),
      reviewedAt: w.updatedAt.toISOString(),
      reviewedBy: w.processedBy,
      rejectionReason: w.adminNotes,
    };
  }

  async approveWithdrawal(id: string, adminId: string, note?: string) {
    const execution = await this.withdrawalService.startProcessing(id, adminId);
    if (note) {
      await this.prisma.withdrawRequest.update({ where: { id }, data: { adminNotes: note } });
    }
    return {
      withdrawalId: id,
      status: 'processing',
      payoutExecutionId: execution.id,
      reviewedAt: new Date().toISOString(),
    };
  }

  async rejectWithdrawal(id: string, adminId: string, reason: string) {
    await this.withdrawalService.rejectRequest(id, adminId, reason);
    return { withdrawalId: id, status: 'rejected', rejectionReason: reason };
  }

  async listPayouts(params?: ListQuery & { status?: string; workerId?: string }) {
    const { page, pageSize, skip } = parseAdminPagination(params ?? {});
    const where: Record<string, unknown> = {};
    if (params?.status) {
      const statusKey = Object.entries(PAYOUT_STATUS_MAP).find(([, v]) => v === params.status)?.[0];
      if (statusKey) where.status = statusKey;
    }
    if (params?.workerId) {
      where.withdrawRequest = { workerProfileId: params.workerId };
    }

    const [rows, total] = await Promise.all([
      this.prisma.payoutExecution.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          withdrawRequest: {
            include: { workerProfile: { include: { user: { select: { firstName: true, lastName: true } } } } },
          },
        },
      }),
      this.prisma.payoutExecution.count({ where }),
    ]);

    const data = rows.map((p) => ({
      id: p.id,
      withdrawRequestId: p.withdrawRequestId,
      workerId: p.withdrawRequest.workerProfileId,
      workerName: [p.withdrawRequest.workerProfile.user.firstName, p.withdrawRequest.workerProfile.user.lastName]
        .filter(Boolean)
        .join(' '),
      amount: toNumber(p.amount),
      status: PAYOUT_STATUS_MAP[p.status] || p.status.toLowerCase(),
      providerReference: p.externalReferenceId,
      failureReason: p.failureReason,
      initiatedAt: p.createdAt.toISOString(),
      completedAt: p.completedAt?.toISOString() ?? null,
    }));

    return toPaginatedResponse(data, total, page, pageSize);
  }

  async getPayout(id: string) {
    const p = await this.prisma.payoutExecution.findUnique({
      where: { id },
      include: {
        withdrawRequest: {
          include: { workerProfile: { include: { user: { select: { firstName: true, lastName: true } } } } },
        },
      },
    });
    if (!p) throw new AppError('Payout not found', 404);
    return {
      id: p.id,
      withdrawRequestId: p.withdrawRequestId,
      workerId: p.withdrawRequest.workerProfileId,
      workerName: [p.withdrawRequest.workerProfile.user.firstName, p.withdrawRequest.workerProfile.user.lastName]
        .filter(Boolean)
        .join(' '),
      amount: toNumber(p.amount),
      status: PAYOUT_STATUS_MAP[p.status] || p.status.toLowerCase(),
      providerReference: p.externalReferenceId,
      failureReason: p.failureReason,
      initiatedAt: p.createdAt.toISOString(),
      completedAt: p.completedAt?.toISOString() ?? null,
    };
  }

  async listRefunds(params?: ListQuery & { status?: string; orderId?: string; from?: string; to?: string }) {
    const { page, pageSize, skip } = parseAdminPagination(params ?? {});
    const where: Record<string, unknown> = {};
    if (params?.orderId) where.orderId = params.orderId;
    if (params?.from || params?.to) {
      where.createdAt = {};
      if (params.from) (where.createdAt as Record<string, Date>).gte = new Date(params.from);
      if (params.to) (where.createdAt as Record<string, Date>).lte = new Date(params.to);
    }

    const [rows, total] = await Promise.all([
      this.prisma.refund.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.refund.count({ where }),
    ]);

    const data = rows.map((r) => ({
      id: r.id,
      paymentId: r.originalPaymentReference,
      orderId: r.orderId,
      amount: toNumber(r.amount),
      refundType: r.refundType === 'PRE_RELEASE' ? 'full' : 'partial',
      reason: r.notes ?? undefined,
      status: 'processed',
      issuedBy: r.initiatedBy,
      issuedAt: r.createdAt.toISOString(),
      processedAt: r.createdAt.toISOString(),
    }));

    return toPaginatedResponse(data, total, page, pageSize);
  }

  async getRefund(id: string) {
    const r = await this.prisma.refund.findUnique({ where: { id } });
    if (!r) throw new AppError('Refund not found', 404);
    return {
      id: r.id,
      paymentId: r.originalPaymentReference,
      orderId: r.orderId,
      amount: toNumber(r.amount),
      refundType: r.refundType === 'PRE_RELEASE' ? 'full' : 'partial',
      reason: r.notes ?? undefined,
      status: 'processed',
      issuedBy: r.initiatedBy,
      issuedAt: r.createdAt.toISOString(),
      processedAt: r.createdAt.toISOString(),
    };
  }

  async issueRefund(payload: { paymentId: string; amount: number; refundType: 'full' | 'partial'; reason: string }, adminId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: payload.paymentId } });
    if (!payment) throw new AppError('Payment not found', 404);
    const refund = await this.refundService.initiateRefund(
      payment.orderId,
      'ADMIN_INITIATED',
      adminId,
      `admin-refund-${payment.id}-${Date.now()}`,
      payload.reason
    );
    return {
      id: refund.id,
      paymentId: payload.paymentId,
      orderId: payment.orderId,
      amount: toNumber(refund.amount),
      refundType: payload.refundType,
      reason: payload.reason,
      status: 'processed',
      issuedBy: adminId,
      issuedAt: refund.createdAt.toISOString(),
      processedAt: refund.createdAt.toISOString(),
    };
  }

  async listWorkerDebts(params?: ListQuery & { status?: string; workerId?: string }) {
    const { page, pageSize, skip } = parseAdminPagination(params ?? {});
    const where: Record<string, unknown> = {};
    if (params?.workerId) where.workerProfileId = params.workerId;
    if (params?.status) {
      const statusKey = Object.entries(DEBT_STATUS_MAP).find(([, v]) => v === params.status)?.[0];
      if (statusKey) where.status = statusKey;
    }

    const [rows, total] = await Promise.all([
      this.prisma.workerDebt.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workerDebt.count({ where }),
    ]);

    const workerIds = [...new Set(rows.map((d) => d.workerProfileId))];
    const workers = await this.prisma.workerProfile.findMany({
      where: { id: { in: workerIds } },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    const workerNameById = new Map(
      workers.map((w) => [
        w.id,
        [w.user.firstName, w.user.lastName].filter(Boolean).join(' '),
      ])
    );

    const data = rows.map((d) => ({
      id: d.id,
      workerId: d.workerProfileId,
      workerName: workerNameById.get(d.workerProfileId) || '',
      refundId: d.refundId,
      amount: toNumber(d.outstandingAmount),
      status: DEBT_STATUS_MAP[d.status] || d.status.toLowerCase(),
      createdAt: d.createdAt.toISOString(),
      resolvedAt: d.settledAt?.toISOString() ?? null,
    }));

    return toPaginatedResponse(data, total, page, pageSize);
  }

  async waiveWorkerDebt(id: string, notes: string, adminId: string) {
    const result = await this.withdrawalService.settleDebt(id, adminId);
    const debt = await this.prisma.workerDebt.findUnique({ where: { id } });
    return {
      id: result.id,
      workerId: debt?.workerProfileId,
      amount: toNumber(debt?.outstandingAmount ?? 0n),
      status: 'waived',
      notes,
      resolvedAt: new Date().toISOString(),
      resolvedBy: adminId,
    };
  }

  async listAuditLogs(params?: ListQuery & { action?: string; actorId?: string; targetType?: string; targetId?: string; from?: string; to?: string }) {
    const { page, pageSize, skip } = parseAdminPagination(params ?? {});
    const where: Record<string, unknown> = {};
    if (params?.action) where.actionType = params.action;
    if (params?.actorId) where.actorId = params.actorId;
    if (params?.targetType) where.entityType = params.targetType;
    if (params?.targetId) where.entityId = params.targetId;
    if (params?.from || params?.to) {
      where.createdAt = {};
      if (params.from) (where.createdAt as Record<string, Date>).gte = new Date(params.from);
      if (params.to) (where.createdAt as Record<string, Date>).lte = new Date(params.to);
    }

    const [rows, total] = await Promise.all([
      this.prisma.activityLog.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.activityLog.count({ where }),
    ]);

    const data = rows.map((l) => ({
      id: l.id,
      actorType: 'admin',
      actorId: l.actorId,
      action: l.actionType,
      targetType: l.entityType,
      targetId: l.entityId,
      metadata: l.metadata,
      outcome: 'success',
      createdAt: l.createdAt.toISOString(),
    }));

    return toPaginatedResponse(data, total, page, pageSize);
  }

  async listFeeRules() {
    const rules = await this.prisma.feeRule.findMany({ orderBy: { effectiveFrom: 'desc' } });
    const data = rules.map((r) => ({
      id: r.id,
      platformFeePercent: r.percentage,
      description: r.description || '',
      effectiveFrom: r.effectiveFrom.toISOString(),
      effectiveTo: null,
      createdAt: r.createdAt.toISOString(),
      isActive: r.isActive,
    }));
    return toPaginatedResponse(data, data.length, 1, data.length || 1);
  }

  async getActiveFeeRule() {
    const rule = await this.feeRuleRepo.findActive();
    if (!rule) throw new AppError('No active fee rule found', 404);
    return {
      id: rule.id,
      platformFeePercent: rule.percentage,
      description: rule.description || '',
      effectiveFrom: rule.effectiveFrom.toISOString(),
      isActive: rule.isActive,
    };
  }

  async createFeeRule(payload: { platformFeePercent: number; effectiveFrom: string; description: string }) {
    const rule = await this.feeRuleRepo.create({
      percentage: payload.platformFeePercent,
      effectiveFrom: new Date(payload.effectiveFrom),
      description: payload.description,
      isActive: true,
    });
    return {
      id: rule.id,
      platformFeePercent: rule.percentage,
      description: rule.description || '',
      effectiveFrom: rule.effectiveFrom.toISOString(),
      isActive: rule.isActive,
    };
  }

  async getSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      platformEarnings,
      escrowSummary,
      withdrawalSummary,
      debts,
      pendingEscrow,
      pendingWithdrawals,
    ] = await Promise.all([
      this.dashboardService.getPlatformEarnings(startOfMonth, now),
      this.dashboardService.getEscrowSummary(),
      this.dashboardService.getWithdrawalSummary(),
      this.dashboardService.getOutstandingDebts(),
      this.prisma.escrowHold.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'HELD' },
      }),
      this.prisma.withdrawRequest.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: { status: 'PENDING' },
      }),
    ]);

    const heldEscrow = escrowSummary.HELD?.amount ?? 0n;
    const workerPayouts = withdrawalSummary.COMPLETED?.amount ?? 0n;

    return {
      totalCollectedThisMonth: toNumber(heldEscrow + platformEarnings),
      platformRevenueThisMonth: toNumber(platformEarnings),
      workerPayoutsThisMonth: toNumber(workerPayouts),
      pendingEscrowTotal: toNumber(pendingEscrow._sum.totalAmount ?? heldEscrow),
      pendingWithdrawalsCount: pendingWithdrawals._count.id,
      pendingWithdrawalsTotal: toNumber(pendingWithdrawals._sum.amount ?? 0n),
      outstandingDebtsTotal: toNumber(debts.amount),
      currency: 'EGP',
    };
  }
}
