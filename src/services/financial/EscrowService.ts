import IEscrowHoldRepository from '../../repositories/interfaces/financial/EscrowHoldRepository.js';
import ITransactionLogRepository from '../../repositories/interfaces/financial/TransactionLogRepository.js';
import IWorkerBalanceRepository from '../../repositories/interfaces/financial/WorkerBalanceRepository.js';
import { generateDeterministicKey } from './helpers/idempotencyHelper.js';
import { TransactionClient } from '../../repositories/interfaces/financial/EscrowHoldRepository.js';
import { IWorkerDebtRepository } from '../../repositories/interfaces/financial/WorkerDebtRepository.js';
import { logActivity } from './helpers/activityLogger.js';
import { RefundService } from './RefundService.js';
import { serializeBigints } from '../../utils/serializeBigints.js';
import AppError from '../../errors/AppError.js';
import { PrismaClient } from '../../generated/prisma/client.js';

export class EscrowService {
  private refundService?: RefundService;

  constructor(
    private readonly escrowHoldRepo: IEscrowHoldRepository,
    private readonly transactionLogRepo: ITransactionLogRepository,
    private readonly workerBalanceRepo: IWorkerBalanceRepository,
    private readonly workerDebtRepo: IWorkerDebtRepository | null,
    private readonly prisma: PrismaClient
  ) {}

  public setRefundService(refundService: RefundService) {
    this.refundService = refundService;
  }

  async listHolds(filters: { status?: string; orderId?: string }, limit = 20, offset = 0) {
    const data = await this.escrowHoldRepo.findMany(filters, limit, offset);
    return serializeBigints(data);
  }

  async onOrderCompleted(orderId: string, completedAt: Date, tx?: TransactionClient): Promise<void> {
    const hold = await this.escrowHoldRepo.findByOrderId(orderId);
    if (!hold) {
      throw new AppError(`EscrowHold not found for order ${orderId}`, 404);
    }
    if (hold.status !== 'HELD') {
      throw new AppError(
        `EscrowHold is not HELD for order ${orderId}, current status is ${hold.status}`,
        400
      );
    }

    const eligibleAt = new Date(completedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    const schedule = async (client: TransactionClient) => {
      await this.escrowHoldRepo.updateReleaseEligibleAt(hold.id, eligibleAt, client);
      await logActivity(client, {
        actorId: 'SYSTEM',
        actionType: 'ESCROW_RELEASE_SCHEDULED',
        entityType: 'EscrowHold',
        entityId: hold.id,
        metadata: { eligibleAt: eligibleAt.toISOString() },
      });
    };

    if (tx) {
      await schedule(tx);
    } else {
      await this.prisma.$transaction(async (innerTx) => {
        await schedule(innerTx);
      });
    }
  }

  async releaseHold(holdId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const hold = await this.escrowHoldRepo.lockForUpdate(holdId, tx);
      if (!hold) {
        throw new AppError('EscrowHold not found', 404);
      }

      if (hold.status === 'RELEASED') {
        return;
      }
      if (hold.status !== 'HELD') {
        throw new AppError(`Cannot release escrow hold with status ${hold.status}`, 400);
      }

      if (!hold.escrowReleaseEligibleAt || hold.escrowReleaseEligibleAt > new Date()) {
        throw new AppError('EscrowHold is not yet eligible for release', 422);
      }

      const order = await tx.order.findUnique({
        where: { id: hold.orderId },
        select: { workerProfileId: true },
      });
      if (!order?.workerProfileId) {
        throw new AppError('Order or worker profile not found for escrow release', 404);
      }

      const workerProfileId = order.workerProfileId;

      let workerBalance = await this.workerBalanceRepo.findByWorkerProfileId(workerProfileId);
      if (!workerBalance) {
        workerBalance = await this.workerBalanceRepo.create(workerProfileId, tx);
      }

      workerBalance = await this.workerBalanceRepo.lockForUpdate(workerProfileId, tx);
      if (!workerBalance) {
        throw new AppError('Worker balance lock failed', 500);
      }

      let totalDeduction = 0n;
      if (this.workerDebtRepo) {
        const debts = await this.workerDebtRepo.findOutstandingByWorkerId(workerProfileId, tx);
        let amountToCredit = hold.workerAmount;
        for (const debt of debts) {
          if (amountToCredit <= 0n) break;
          const deduction =
            amountToCredit < debt.outstandingAmount ? amountToCredit : debt.outstandingAmount;

          amountToCredit -= deduction;
          totalDeduction += deduction;

          const newOutstanding = debt.outstandingAmount - deduction;
          const newStatus = newOutstanding === 0n ? 'SETTLED' : 'SETTLING';

          await this.workerDebtRepo.updateAmount(debt.id, newOutstanding, newStatus, tx);

          await this.transactionLogRepo.create(
            {
              userId: workerProfileId,
              amount: deduction,
              type: 'DEBIT',
              referenceId: debt.id,
              referenceType: 'WORKER_DEBT',
              description: `Auto-recovery from order ${hold.orderId}`,
            },
            tx
          );
        }
      }

      await this.transactionLogRepo.create(
        {
          userId: workerProfileId,
          amount: hold.workerAmount,
          type: 'CREDIT',
          referenceId: hold.id,
          referenceType: 'ESCROW_HOLD',
          description: `Escrow release ${hold.workerAmount} for order ${hold.orderId}`,
        },
        tx
      );

      if (hold.platformFee > 0n) {
        await this.transactionLogRepo.create(
          {
            userId: 'PLATFORM',
            amount: hold.platformFee,
            type: 'CREDIT',
            referenceId: hold.id,
            referenceType: 'ESCROW_HOLD',
            description: `Platform fee ${hold.platformFee} for order ${hold.orderId}`,
          },
          tx
        );
      }

      await this.workerBalanceRepo.update(
        workerBalance.id,
        {
          totalEarned: workerBalance.totalEarned + hold.workerAmount,
          deductedForDebts: workerBalance.deductedForDebts + totalDeduction,
        },
        workerBalance.version,
        tx
      );

      await tx.escrowHold.update({
        where: { id: hold.id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      });

      await logActivity(tx, {
        actorId: 'SYSTEM',
        actionType: 'ESCROW_RELEASED',
        entityType: 'EscrowHold',
        entityId: hold.id,
        metadata: {
          workerAmount: hold.workerAmount.toString(),
          platformFee: hold.platformFee.toString(),
        },
      });
    });
  }

  async holdForDispute(orderId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const hold = await this.escrowHoldRepo.findByOrderId(orderId);
      if (!hold) throw new AppError('EscrowHold not found', 404);
      if (hold.status !== 'RELEASED') {
        throw new AppError('Cannot put unreleased funds on dispute hold', 400);
      }

      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { workerProfileId: true },
      });
      if (!order?.workerProfileId) throw new AppError('Worker profile not found for order', 404);

      const balance = await this.workerBalanceRepo.lockForUpdate(order.workerProfileId, tx);
      if (!balance) throw new AppError('Worker balance lock failed', 500);

      const available =
        balance.totalEarned -
        balance.withdrawn -
        balance.pendingWithdraw -
        balance.onHoldForDispute -
        balance.deductedForDebts;
      const holdAmount = available < hold.workerAmount ? available : hold.workerAmount;

      if (holdAmount > 0n) {
        await this.workerBalanceRepo.update(
          balance.id,
          { onHoldForDispute: balance.onHoldForDispute + holdAmount },
          balance.version,
          tx
        );

        await this.transactionLogRepo.create(
          {
            userId: order.workerProfileId,
            amount: holdAmount,
            type: 'DEBIT',
            referenceId: hold.id,
            referenceType: 'DISPUTE_HOLD',
            description: `Dispute hold for order ${orderId}`,
          },
          tx
        );

        await logActivity(tx, {
          actorId: 'SYSTEM',
          actionType: 'DISPUTE_HOLD_APPLIED',
          entityType: 'EscrowHold',
          entityId: hold.id,
          metadata: { holdAmount: holdAmount.toString() },
        });
      }
    });
  }

  async releaseDisputeHold(orderId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const hold = await this.escrowHoldRepo.findByOrderId(orderId);
      if (!hold) throw new AppError('EscrowHold not found', 404);

      const order = await tx.order.findUnique({
        where: { id: orderId },
        select: { workerProfileId: true },
      });
      if (!order?.workerProfileId) throw new AppError('Worker profile not found', 404);

      const balance = await this.workerBalanceRepo.lockForUpdate(order.workerProfileId, tx);
      if (!balance) throw new AppError('Worker balance lock failed', 500);

      const releaseAmount =
        balance.onHoldForDispute < hold.workerAmount ? balance.onHoldForDispute : hold.workerAmount;

      if (releaseAmount > 0n) {
        await this.workerBalanceRepo.update(
          balance.id,
          { onHoldForDispute: balance.onHoldForDispute - releaseAmount },
          balance.version,
          tx
        );

        await this.transactionLogRepo.create(
          {
            userId: order.workerProfileId,
            amount: releaseAmount,
            type: 'CREDIT',
            referenceId: hold.id,
            referenceType: 'DISPUTE_RELEASE',
            description: `Dispute release for order ${orderId}`,
          },
          tx
        );

        await logActivity(tx, {
          actorId: 'SYSTEM',
          actionType: 'DISPUTE_HOLD_RELEASED',
          entityType: 'EscrowHold',
          entityId: hold.id,
          metadata: { releaseAmount: releaseAmount.toString() },
        });
      }
    });
  }

  async resolveDisputeAgainstWorker(orderId: string, adminId: string): Promise<void> {
    if (!this.refundService) throw new AppError('RefundService not wired', 500);

    const idempotencyKey = generateDeterministicKey('DISPUTE_RESOLUTION', orderId, 'REFUND');
    await this.refundService.initiateRefund(
      orderId,
      'DISPUTE_RESOLUTION',
      adminId,
      idempotencyKey,
      'Refund due to dispute resolution'
    );

    await this.releaseDisputeHold(orderId);
  }
}
