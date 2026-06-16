import { PrismaClient } from '../../generated/prisma/client.js';
import IWorkerBalanceRepository from '../../repositories/interfaces/financial/WorkerBalanceRepository.js';
import { IWithdrawRequestRepository } from '../../repositories/interfaces/financial/WithdrawRequestRepository.js';
import { IPayoutMethodRepository } from '../../repositories/interfaces/financial/PayoutMethodRepository.js';
import { IPayoutExecutionRepository } from '../../repositories/interfaces/financial/PayoutExecutionRepository.js';
import ITransactionLogRepository from '../../repositories/interfaces/financial/TransactionLogRepository.js';
import { IWorkerDebtRepository } from '../../repositories/interfaces/financial/WorkerDebtRepository.js';
import { WorkerBalance } from '../../domain/financial/workerBalance.entity.js';
import { generateDeterministicKey } from './helpers/idempotencyHelper.js';
import { logActivity } from './helpers/activityLogger.js';
import { PayoutMethod, WithdrawRequest, PayoutMethodType } from '../../domain/financial/withdrawal.entity.js';
import AppError from '../../errors/AppError.js';
import { PayoutMethodInput, ListWithdrawRequestsOptions, CursorPaginatedResult } from '../../schemas/financial/withdrawal.schema.js';
import { PayoutMethodUpdateInput } from '../../repositories/interfaces/financial/PayoutMethodRepository.js';
import { notificationService } from '../../state.js';
import type { NotificationEventContext } from '../../domain/notification.entity.js';

export type WorkerBalanceView = Omit<
  WorkerBalance,
  'id' | 'version' | 'createdAt' | 'updatedAt' | 'workerProfileId'
> & { availableToWithdraw: bigint };

export class WithdrawalService {
  constructor(
    private readonly workerBalanceRepo: IWorkerBalanceRepository,
    private readonly withdrawRequestRepo: IWithdrawRequestRepository,
    private readonly payoutMethodRepo: IPayoutMethodRepository,
    private readonly payoutExecutionRepo: IPayoutExecutionRepository,
    private readonly transactionLogRepo: ITransactionLogRepository,
    private readonly workerDebtRepo: IWorkerDebtRepository,
    private readonly prisma: PrismaClient
  ) {}

  public computeAvailableToWithdraw(balance: WorkerBalance): bigint {
    return (
      balance.totalEarned -
      balance.withdrawn -
      balance.pendingWithdraw -
      balance.onHoldForDispute -
      balance.deductedForDebts
    );
  }

  async getBalance(workerProfileId: string): Promise<WorkerBalanceView> {
    const balance = await this.workerBalanceRepo.findByWorkerProfileId(workerProfileId);
    return {
      totalEarned: balance?.totalEarned || 0n,
      withdrawn: balance?.withdrawn || 0n,
      pendingWithdraw: balance?.pendingWithdraw || 0n,
      onHoldForDispute: balance?.onHoldForDispute || 0n,
      deductedForDebts: balance?.deductedForDebts || 0n,
      availableToWithdraw: balance ? this.computeAvailableToWithdraw(balance) : 0n,
    };
  }

  async createWithdrawRequest(
    workerProfileId: string,
    amount: bigint,
    payoutMethodId: string,
    idempotencyKey: string
  ): Promise<{ request: WithdrawRequest }> {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Lock WorkerBalance
      const balance = await this.workerBalanceRepo.lockForUpdate(workerProfileId, tx);
      if (!balance) throw new AppError('Worker balance not found', 404);

      // 2. Validate available
      const available = this.computeAvailableToWithdraw(balance);
      if (available < amount) {
        throw new AppError('Insufficient balance for withdrawal', 400);
      }

      // 3. Snapshot payout method (read inside tx)
      const payoutMethod = await this.payoutMethodRepo.findById(payoutMethodId, tx);
      if (!payoutMethod || payoutMethod.workerProfileId !== workerProfileId) {
        throw new AppError('Payout method not found or does not belong to worker', 404);
      }

      const snapshot = {
        methodType: payoutMethod.methodType,
        accountName: payoutMethod.accountName,
        accountNumber: payoutMethod.accountNumber,
        bankName: payoutMethod.bankName,
      };

      // 4. Create WithdrawRequest FIRST (status: PENDING) — idempotency safe
      const result = await this.withdrawRequestRepo.create(
        {
          workerProfileId,
          workerBalanceId: balance.id,
          payoutMethodId,
          amount,
          payoutMethodSnapshot: snapshot,
          idempotencyKey,
        },
        tx
      );

      // 5. Only update balance if a new request was created (not a duplicate)
      if (result.created) {
        await this.workerBalanceRepo.update(
          balance.id,
          { pendingWithdraw: balance.pendingWithdraw + amount },
          balance.version,
          tx
        );

        await logActivity(tx, {
          actorId: workerProfileId,
          actionType: 'WITHDRAW_REQUESTED',
          entityType: 'WithdrawRequest',
          entityId: result.request.id,
          metadata: { amount: amount.toString() },
        });
      }

      return result;
    });

    if (result.created) {
      this.notifyWorkerWithdrawal(workerProfileId, {
        type: 'WITHDRAW_REQUESTED',
        ctx: { withdrawId: result.request.id, amount: Number(amount) },
      }).catch(() => {});
    }

    return result;
  }
  /**
   * Admin starts processing a withdrawal request.
   * Moves status: PENDING → IN_PROGRESS and creates a PayoutExecution.
   */
  async startProcessing(requestId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await this.withdrawRequestRepo.findById(requestId, tx);
      if (!request) throw new AppError('Withdraw request not found', 404);

      if (request.status !== 'PENDING') {
        throw new AppError(`Cannot start processing request in status ${request.status}`, 400);
      }

      await this.withdrawRequestRepo.update(
        requestId,
        {
          status: 'IN_PROGRESS',
          processedBy: adminId,
          updatedAt: new Date(),
        },
        tx
      );

      const idempotencyKey = generateDeterministicKey('PAYOUT_EXECUTION', requestId, 'EXECUTION');

      const execResult = await this.payoutExecutionRepo.create(
        {
          withdrawRequestId: requestId,
          idempotencyKey,
          amount: request.amount,
        },
        tx
      );

      await logActivity(tx, {
        actorId: adminId,
        actionType: 'WITHDRAWAL_PROCESSING_STARTED',
        entityType: 'WithdrawRequest',
        entityId: requestId,
        metadata: { amount: request.amount.toString() },
      });

      return { execution: execResult.execution, workerProfileId: request.workerProfileId };
    }).then(async (result) => {
      this.notifyWorkerWithdrawal(result.workerProfileId, {
        type: 'WITHDRAW_APPROVED',
        ctx: { withdrawId: requestId, amount: result.execution.amount ? Number(result.execution.amount) : 0 },
      }).catch(() => {});
      return result.execution;
    });
  }

  /**
   * Reject a PENDING withdrawal request.
   */
  async rejectRequest(requestId: string, adminId: string, notes?: string) {
    const request = await this.prisma.$transaction(async (tx) => {
      const request = await this.withdrawRequestRepo.findById(requestId, tx);
      if (!request) throw new AppError('Withdraw request not found', 404);
      if (request.status !== 'PENDING')
        throw new AppError(`Cannot reject request in status ${request.status}`, 400);

      const balance = await this.workerBalanceRepo.lockForUpdate(request.workerProfileId, tx);
      if (!balance) throw new AppError('Worker balance not found', 404);

      // Return reserved amount (pendingWithdraw -= amount)
      await this.workerBalanceRepo.update(
        balance.id,
        { pendingWithdraw: balance.pendingWithdraw - request.amount },
        balance.version,
        tx
      );

      await this.withdrawRequestRepo.update(
        requestId,
        {
          status: 'CANCELLED',
          adminNotes: notes || null,
          updatedAt: new Date(),
        },
        tx
      );

      await this.transactionLogRepo.create(
        {
          userId: request.workerProfileId,
          amount: request.amount,
          type: 'CREDIT',
          referenceId: requestId,
          referenceType: 'WITHDRAW_REQUEST',
          description: `Withdraw request rejected. Notes: ${notes || ''}`,
        },
        tx
      );

      await logActivity(tx, {
        actorId: adminId,
        actionType: 'WITHDRAWAL_REJECTED',
        entityType: 'WithdrawRequest',
        entityId: requestId,
        metadata: { amount: request.amount.toString(), notes },
      });

      return request;
    });

    this.notifyWorkerWithdrawal(request.workerProfileId, {
      type: 'WITHDRAW_REJECTED',
      ctx: { withdrawId: requestId, rejectionReason: notes },
    }).catch(() => {});
  }

  /**
   * Complete payout execution. Requires proof of payment URL.
   * Only allowed when request is IN_PROGRESS, not PENDING.
   */
  async completePayout(
    executionId: string,
    proofOfPaymentUrl: string,
    externalRefId: string,
    adminId: string
  ) {
    const request = await this.prisma.$transaction(async (tx) => {
      const execution = await this.payoutExecutionRepo.lockForUpdate(executionId, tx);
      if (!execution) throw new AppError('Payout execution not found', 404);
      if (execution.status !== 'PENDING')
        throw new AppError(`Cannot complete Execution in status ${execution.status}`, 400);

      const request = await this.withdrawRequestRepo.findById(execution.withdrawRequestId, tx);
      if (!request) throw new AppError('Withdraw request not found for execution', 404);

      // Enforce staged flow: request must be IN_PROGRESS
      if (request.status !== 'IN_PROGRESS') {
        throw new AppError(
          `Cannot complete payout: withdraw request is in status ${request.status}, must be IN_PROGRESS`,
          400
        );
      }

      const balance = await this.workerBalanceRepo.lockForUpdate(request.workerProfileId, tx);
      if (!balance) throw new AppError('Worker balance not found', 404);

      await this.workerBalanceRepo.update(
        balance.id,
        {
          pendingWithdraw: balance.pendingWithdraw - request.amount,
          withdrawn: balance.withdrawn + request.amount,
        },
        balance.version,
        tx
      );

      await this.transactionLogRepo.create(
        {
          userId: request.workerProfileId,
          amount: request.amount,
          type: 'DEBIT',
          referenceId: executionId,
          referenceType: 'PAYOUT_EXECUTION',
          description: `Payout completed externalRef ${externalRefId}`,
        },
        tx
      );

      await this.payoutExecutionRepo.updateStatus(
        executionId,
        'COMPLETED',
        {
          externalReferenceId: externalRefId,
          proofOfPaymentUrl,
          executedAt: new Date(),
        },
        tx
      );

      await this.withdrawRequestRepo.update(
        request.id,
        {
          status: 'COMPLETED',
          updatedAt: new Date(),
        },
        tx
      );

      await logActivity(tx, {
        actorId: adminId,
        actionType: 'PAYOUT_COMPLETED',
        entityType: 'PayoutExecution',
        entityId: executionId,
        metadata: { amount: request.amount.toString(), externalRefId, proofOfPaymentUrl },
      });

      return request;
    });

    this.notifyWorkerWithdrawal(request.workerProfileId, {
      type: 'PAYOUT_COMPLETED',
      ctx: { payoutId: executionId, amount: Number(request.amount) },
    }).catch(() => {});
  }

  async failPayout(executionId: string, reason: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const execution = await this.payoutExecutionRepo.lockForUpdate(executionId, tx);
      if (!execution) throw new AppError('Payout execution not found', 404);
      if (execution.status !== 'PENDING')
        throw new AppError(`Cannot fail Execution in status ${execution.status}`, 400);

      const request = await this.withdrawRequestRepo.findById(execution.withdrawRequestId, tx);
      if (!request) throw new AppError('Withdraw request not found', 404);

      const balance = await this.workerBalanceRepo.lockForUpdate(request.workerProfileId, tx);
      if (!balance) throw new AppError('Worker balance not found', 404);

      await this.workerBalanceRepo.update(
        balance.id,
        { pendingWithdraw: balance.pendingWithdraw - request.amount },
        balance.version,
        tx
      );

      await this.transactionLogRepo.create(
        {
          userId: request.workerProfileId,
          amount: request.amount,
          type: 'CREDIT',
          referenceId: executionId,
          referenceType: 'PAYOUT_EXECUTION',
          description: `Payout failed reason: ${reason}`,
        },
        tx
      );

      await this.payoutExecutionRepo.updateStatus(
        executionId,
        'FAILED',
        { providerResponseMessage: reason },
        tx
      );

      await this.withdrawRequestRepo.update(
        request.id,
        {
          status: 'FAILED',
          adminNotes: reason,
          updatedAt: new Date(),
        },
        tx
      );

      await logActivity(tx, {
        actorId: adminId,
        actionType: 'PAYOUT_FAILED',
        entityType: 'PayoutExecution',
        entityId: executionId,
        metadata: { amount: request.amount.toString(), reason },
      });
    });
  }

  async listWithdrawRequests(
    options: ListWithdrawRequestsOptions
  ): Promise<CursorPaginatedResult<WithdrawRequest>> {
    return this.withdrawRequestRepo.findMany(options);
  }

  async listPayoutMethods(workerProfileId: string) {
    return this.payoutMethodRepo.findByWorkerId(workerProfileId);
  }

  async getWithdrawRequest(requestId: string, workerProfileId: string): Promise<WithdrawRequest> {
    const request = await this.withdrawRequestRepo.findById(requestId);
    if (!request) throw new AppError('Withdraw request not found', 404);
    if (request.workerProfileId !== workerProfileId)
      throw new AppError('Withdraw request not found', 404); 
    return request;
  }

  async updatePayoutMethod(
    id: string,
    workerProfileId: string,
    data: PayoutMethodUpdateInput
  ): Promise<PayoutMethod> {
    const method = await this.payoutMethodRepo.findById(id);
    if (!method || method.workerProfileId !== workerProfileId)
      throw new AppError('Payout method not found', 404);
    return this.payoutMethodRepo.update(id, data);
  }

  async deletePayoutMethod(id: string, workerProfileId: string): Promise<void> {
    const method = await this.payoutMethodRepo.findById(id);
    if (!method || method.workerProfileId !== workerProfileId)
      throw new AppError('Payout method not found', 404);

    // Guard: cannot delete if there's an active withdraw request using this method
    const hasActive = await this.withdrawRequestRepo.hasActiveRequests(id);
    if (hasActive)
      throw new AppError('Cannot delete payout method with active withdraw requests', 409);

    await this.payoutMethodRepo.delete(id);
  }

  async addPayoutMethod(workerProfileId: string, data: PayoutMethodInput): Promise<PayoutMethod> {
    const result = await this.payoutMethodRepo.create({
      workerProfileId,
      methodType: data.methodType as PayoutMethodType,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      bankName: data.bankName,
    });
    if (!result.created) {
      throw new AppError('Payout method already exists', 409);
    }
    return result.payoutMethod;
  }

  async listWorkerDebts(limit = 20, offset = 0) {
    return this.workerDebtRepo.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async settleDebt(debtId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const debt = await this.workerDebtRepo.findById(debtId, tx);
      if (!debt) throw new AppError('Debt not found', 404);
      if (debt.status === 'SETTLED') throw new AppError('Debt already settled', 400);

      const balance = await this.workerBalanceRepo.lockForUpdate(debt.workerProfileId, tx);
      if (!balance) throw new AppError('Worker balance not found', 404);

      // 1. Mark as settled
      await this.workerDebtRepo.updateAmount(debtId, 0n, 'SETTLED', tx);

      // 2. Transaction log for manual debt recovery
      await this.transactionLogRepo.create(
        {
          userId: debt.workerProfileId,
          amount: debt.outstandingAmount,
          type: 'CREDIT',
          referenceId: debtId,
          referenceType: 'WORKER_DEBT',
          description: `Manual debt settlement by admin ${adminId}`,
        },
        tx
      );

      await logActivity(tx, {
        actorId: adminId,
        actionType: 'DEBT_SETTLED_MANUALLY',
        entityType: 'WorkerDebt',
        entityId: debtId,
        metadata: { amount: debt.outstandingAmount.toString() },
      });

      return { status: 'SETTLED', id: debtId };
    });
  }

  private async notifyWorkerWithdrawal(workerProfileId: string, event: NotificationEventContext): Promise<void> {
    try {
      const profile = await this.prisma.workerProfile.findUnique({
        where: { id: workerProfileId },
        select: { userId: true },
      });
      if (!profile) return;
      await notificationService.notify(profile.userId, event);
    } catch {
      // Fire-and-forget
    }
  }
}
