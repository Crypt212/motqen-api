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

export type WorkerBalanceView = WorkerBalance & { availableToWithdraw: bigint };

export class WithdrawalService {
  constructor(
    private readonly workerBalanceRepo: IWorkerBalanceRepository,
    private readonly withdrawRequestRepo: IWithdrawRequestRepository,
    private readonly payoutMethodRepo: IPayoutMethodRepository,
    private readonly payoutExecutionRepo: IPayoutExecutionRepository,
    private readonly transactionLogRepo: ITransactionLogRepository,
    private readonly workerDebtRepo: IWorkerDebtRepository | null,
    private readonly prisma: PrismaClient
  ) {}

  public computeAvailableToWithdraw(balance: WorkerBalance): bigint {
    return balance.totalEarned - balance.withdrawn - balance.pendingWithdraw - balance.onHoldForDispute - balance.deductedForDebts;
  }

  async getBalance(workerProfileId: string): Promise<WorkerBalanceView> {
    const balance = await this.workerBalanceRepo.findByWorkerProfileId(workerProfileId);
    
    if (!balance) {
      return {
        id: '',
        workerProfileId,
        totalEarned: 0n,
        withdrawn: 0n,
        pendingWithdraw: 0n,
        onHoldForDispute: 0n,
        deductedForDebts: 0n,
        version: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        availableToWithdraw: 0n,
      } as any;
    }

    return {
      ...balance,
      availableToWithdraw: this.computeAvailableToWithdraw(balance),
    };
  }

  async createWithdrawRequest(workerProfileId: string, amount: bigint, payoutMethodId: string, idempotencyKey: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Lock WorkerBalance
      const balance = await this.workerBalanceRepo.lockForUpdate(workerProfileId, tx);
      if (!balance) throw new Error('Worker balance not found');

      // 2. Validate available
      const available = this.computeAvailableToWithdraw(balance);
      if (available < amount) {
        throw new Error('Insufficient balance for withdrawal');
      }

      // 3. Snapshot payout method
      const payoutMethod = await this.payoutMethodRepo.findById(payoutMethodId);
      if (!payoutMethod || payoutMethod.workerProfileId !== workerProfileId) {
        throw new Error('Payout method not found or does not belong to worker');
      }

      const snapshot = {
        methodType: payoutMethod.methodType,
        accountName: payoutMethod.accountName,
        accountNumber: payoutMethod.accountNumber,
        bankName: payoutMethod.bankName,
      };

      // 4. Update balance (pending_withdraw += amount, version++)
      await this.workerBalanceRepo.update(
        balance.id,
        { pendingWithdraw: balance.pendingWithdraw + amount },
        balance.version,
        tx
      );

      // 5. Create WithdrawRequest (status: PENDING)
      const result = await this.withdrawRequestRepo.create({
        workerProfileId,
        workerBalanceId: balance.id,
        payoutMethodId,
        amount,
        payoutMethodSnapshot: snapshot,
        idempotencyKey,
      }, tx);

      if (result.created) {
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
  }

  /**
   * Admin starts processing a withdrawal request.
   * Moves status: PENDING → IN_PROGRESS and creates a PayoutExecution.
   */
  async startProcessing(requestId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await this.withdrawRequestRepo.findById(requestId);
      if (!request) throw new Error('Withdraw request not found');

      if (request.status !== 'PENDING') {
        throw new Error(`Cannot start processing request in status ${request.status}`);
      }

      await this.withdrawRequestRepo.updateStatus(requestId, 'IN_PROGRESS', tx);

      const idempotencyKey = generateDeterministicKey('PAYOUT_EXECUTION', requestId, 'EXECUTION');
      
      const execResult = await this.payoutExecutionRepo.create({
        withdrawRequestId: requestId,
        idempotencyKey,
        amount: request.amount,
      }, tx);

      await logActivity(tx, {
        actorId: adminId,
        actionType: 'WITHDRAWAL_PROCESSING_STARTED',
        entityType: 'WithdrawRequest',
        entityId: requestId,
        metadata: { amount: request.amount.toString() },
      });

      return execResult.execution;
    });
  }

  /**
   * Reject a PENDING withdrawal request.
   */
  async rejectRequest(requestId: string, adminId: string, notes?: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await this.withdrawRequestRepo.findById(requestId);
      if (!request) throw new Error('Withdraw request not found');
      if (request.status !== 'PENDING') throw new Error(`Cannot reject request in status ${request.status}`);

      const balance = await this.workerBalanceRepo.lockForUpdate(request.workerProfileId, tx);
      if (!balance) throw new Error('Worker balance not found');

      // Return reserved amount (pendingWithdraw -= amount)
      await this.workerBalanceRepo.update(
        balance.id,
        { pendingWithdraw: balance.pendingWithdraw - request.amount },
        balance.version,
        tx
      );

      await this.withdrawRequestRepo.updateStatus(requestId, 'CANCELLED', tx);

      await this.transactionLogRepo.create({
        userId: request.workerProfileId,
        amount: request.amount,
        type: 'CREDIT',
        referenceId: requestId,
        referenceType: 'WITHDRAW_REQUEST',
        description: `Withdraw request rejected. Notes: ${notes || ''}`,
      }, tx);

      await logActivity(tx, {
        actorId: adminId,
        actionType: 'WITHDRAWAL_REJECTED',
        entityType: 'WithdrawRequest',
        entityId: requestId,
        metadata: { amount: request.amount.toString(), notes },
      });
    });
  }

  /**
   * Complete payout execution. Requires proof of payment URL.
   * Only allowed when request is IN_PROGRESS, not PENDING.
   */
  async completePayout(executionId: string, proofOfPaymentUrl: string, externalRefId: string, adminId: string) {
    if (!proofOfPaymentUrl) throw new Error('Proof of payment URL is required');

    return this.prisma.$transaction(async (tx) => {
      const execution = await this.payoutExecutionRepo.lockForUpdate(executionId, tx);
      if (!execution) throw new Error('Payout execution not found');
      if (execution.status !== 'PENDING') throw new Error(`Cannot complete Execution in status ${execution.status}`);

      const request = await this.withdrawRequestRepo.findById(execution.withdrawRequestId);
      if (!request) throw new Error('Withdraw request not found for execution');

      // Enforce staged flow: request must be IN_PROGRESS
      if (request.status !== 'IN_PROGRESS') {
        throw new Error(`Cannot complete payout: withdraw request is in status ${request.status}, must be IN_PROGRESS`);
      }

      const balance = await this.workerBalanceRepo.lockForUpdate(request.workerProfileId, tx);
      if (!balance) throw new Error('Worker balance not found');

      await this.workerBalanceRepo.update(
        balance.id,
        {
          pendingWithdraw: balance.pendingWithdraw - request.amount,
          withdrawn: balance.withdrawn + request.amount,
        },
        balance.version,
        tx
      );

      await this.transactionLogRepo.create({
        userId: request.workerProfileId,
        amount: request.amount,
        type: 'DEBIT',
        referenceId: executionId,
        referenceType: 'PAYOUT_EXECUTION',
        description: `Payout completed externalRef ${externalRefId}`,
      }, tx);

      await this.payoutExecutionRepo.updateStatus(executionId, 'COMPLETED', {
        externalReferenceId: externalRefId,
        proofOfPaymentUrl,
        executedAt: new Date(),
      }, tx);
      await this.withdrawRequestRepo.updateStatus(request.id, 'COMPLETED', tx);

      await logActivity(tx, {
        actorId: adminId,
        actionType: 'PAYOUT_COMPLETED',
        entityType: 'PayoutExecution',
        entityId: executionId,
        metadata: { amount: request.amount.toString(), externalRefId, proofOfPaymentUrl },
      });
    });
  }

  async failPayout(executionId: string, reason: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const execution = await this.payoutExecutionRepo.lockForUpdate(executionId, tx);
      if (!execution) throw new Error('Payout execution not found');
      if (execution.status !== 'PENDING') throw new Error(`Cannot fail Execution in status ${execution.status}`);

      const request = await this.withdrawRequestRepo.findById(execution.withdrawRequestId);
      if (!request) throw new Error('Withdraw request not found');

      const balance = await this.workerBalanceRepo.lockForUpdate(request.workerProfileId, tx);
      if (!balance) throw new Error('Worker balance not found');

      await this.workerBalanceRepo.update(
        balance.id,
        { pendingWithdraw: balance.pendingWithdraw - request.amount },
        balance.version,
        tx
      );

      await this.transactionLogRepo.create({
        userId: request.workerProfileId,
        amount: request.amount,
        type: 'CREDIT',
        referenceId: executionId,
        referenceType: 'PAYOUT_EXECUTION',
        description: `Payout failed reason: ${reason}`,
      }, tx);

      await this.payoutExecutionRepo.updateStatus(executionId, 'FAILED', { providerResponseMessage: reason }, tx);
      await this.withdrawRequestRepo.updateStatus(request.id, 'FAILED', tx);

      await logActivity(tx, {
        actorId: adminId,
        actionType: 'PAYOUT_FAILED',
        entityType: 'PayoutExecution',
        entityId: executionId,
        metadata: { amount: request.amount.toString(), reason },
      });
    });
  }

  async listWithdrawRequests(workerProfileId: string, limit = 20, offset = 0) {
    return this.withdrawRequestRepo.findByWorkerId(workerProfileId, limit, offset);
  }

  async listPayoutMethods(workerProfileId: string) {
    return this.payoutMethodRepo.findByWorkerId(workerProfileId);
  }

  async addPayoutMethod(workerProfileId: string, data: any) {
    return this.payoutMethodRepo.create({
      workerProfileId,
      methodType: data.method_type,
      accountName: data.account_name,
      accountNumber: data.account_number,
      bankName: data.bank_name,
    });
  }

  async listWorkerDebts(limit = 20, offset = 0) {
    if (!this.workerDebtRepo) throw new Error('WorkerDebtRepo not available');
    return (this.workerDebtRepo as any).prisma.workerDebt.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });
  }

  async settleDebt(debtId: string, adminId: string) {
    if (!this.workerDebtRepo) throw new Error('WorkerDebtRepo not available');
    
    return this.prisma.$transaction(async (tx) => {
      const debt = await (this.workerDebtRepo as any).prisma.workerDebt.findUnique({
        where: { id: debtId }
      });
      if (!debt) throw new Error('Debt not found');
      if (debt.status === 'SETTLED') throw new Error('Debt already settled');

      const balance = await this.workerBalanceRepo.lockForUpdate(debt.workerProfileId, tx);
      if (!balance) throw new Error('Worker balance not found');

      // 1. Mark as settled
      await this.workerDebtRepo!.updateAmount(debtId, 0n, 'SETTLED', tx);

      // 2. Transaction log for manual debt recovery
      await this.transactionLogRepo.create({
        userId: debt.workerProfileId,
        amount: debt.outstandingAmount,
        type: 'CREDIT',
        referenceId: debtId,
        referenceType: 'WORKER_DEBT',
        description: `Manual debt settlement by admin ${adminId}`,
      }, tx);

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
}
