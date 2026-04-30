import { PrismaClient } from '../../generated/prisma/client.js';
import IEscrowHoldRepository from '../../repositories/interfaces/financial/EscrowHoldRepository.js';
import ITransactionLogRepository from '../../repositories/interfaces/financial/TransactionLogRepository.js';
import IWorkerBalanceRepository from '../../repositories/interfaces/financial/WorkerBalanceRepository.js';
import { generateDeterministicKey } from './helpers/idempotencyHelper.js';
import { TransactionClient } from '../../repositories/interfaces/financial/EscrowHoldRepository.js';
import { IWorkerDebtRepository } from '../../repositories/interfaces/financial/WorkerDebtRepository.js';
import { logActivity } from './helpers/activityLogger.js';
import { RefundService } from './RefundService.js';

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

  async listHolds(filters: { status?: string, orderId?: string }, limit = 20, offset = 0) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.orderId) where.orderId = filters.orderId;

    const data = await this.prisma.escrowHold.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
    
    // Convert bigint
    const serializeBigints = (obj: any): any => 
      JSON.parse(JSON.stringify(obj, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      ));

    return serializeBigints(data);
  }

  async onOrderCompleted(orderId: string, completedAt: Date, tx?: TransactionClient): Promise<void> {
    const hold = await this.escrowHoldRepo.findByOrderId(orderId);
    if (!hold) {
      throw new Error(`EscrowHold not found for order ${orderId}`);
    }
    if (hold.status !== 'HELD') {
      throw new Error(`EscrowHold is not HELD for order ${orderId}, current status is ${hold.status}`);
    }

    const eligibleAt = new Date(completedAt.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

    if (tx) {
      await tx.escrowHold.update({
        where: { id: hold.id },
        data: { escrowReleaseEligibleAt: eligibleAt }
      });

      await logActivity(tx, {
        actorId: 'SYSTEM',
        actionType: 'ESCROW_RELEASE_SCHEDULED',
        entityType: 'EscrowHold',
        entityId: hold.id,
        metadata: { eligibleAt: eligibleAt.toISOString() },
      });
    } else {
      await this.prisma.$transaction(async (innerTx) => {
        await innerTx.escrowHold.update({
          where: { id: hold.id },
          data: { escrowReleaseEligibleAt: eligibleAt }
        });

        await logActivity(innerTx, {
          actorId: 'SYSTEM',
          actionType: 'ESCROW_RELEASE_SCHEDULED',
          entityType: 'EscrowHold',
          entityId: hold.id,
          metadata: { eligibleAt: eligibleAt.toISOString() },
        });
      });
    }
  }

  async releaseHold(holdId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Lock escrow hold FOR UPDATE
      const hold = await this.escrowHoldRepo.lockForUpdate(holdId, tx);
      if (!hold) {
        throw new Error('EscrowHold not found');
      }

      // 2. Guard status=HELD
      if (hold.status === 'RELEASED') {
        return; // Idempotent
      }
      if (hold.status !== 'HELD') {
        throw new Error(`Cannot release escrow hold with status ${hold.status}`);
      }

      // 3. Verify eligible_at <= now
      if (!hold.escrowReleaseEligibleAt || hold.escrowReleaseEligibleAt > new Date()) {
        throw new Error('EscrowHold is not yet eligible for release');
      }

      const order = await tx.order.findUnique({
        where: { id: hold.orderId },
        select: { workerProfileId: true }
      });
      if (!order || !order.workerProfileId) {
        throw new Error('Order or worker profile not found for escrow release');
      }

      const workerProfileId = order.workerProfileId;

      // Ensure WorkerBalance exists
      let workerBalance = await this.workerBalanceRepo.findByWorkerProfileId(workerProfileId);
      if (!workerBalance) {
        workerBalance = await this.workerBalanceRepo.create(workerProfileId, tx);
      }

      // 4. Lock WorkerBalance FOR UPDATE
      workerBalance = await this.workerBalanceRepo.lockForUpdate(workerProfileId, tx);
      if (!workerBalance) {
        throw new Error('Worker balance lock failed');
      }

      // 5. Check for outstanding WorkerDebt
      let totalDeduction = 0n;
      if (this.workerDebtRepo) {
        const debts = await this.workerDebtRepo.findOutstandingByWorkerId(workerProfileId, tx);
        let amountToCredit = hold.workerAmount;
        for (const debt of debts) {
          if (amountToCredit <= 0n) break;
          const deduction = amountToCredit < debt.outstandingAmount ? amountToCredit : debt.outstandingAmount;
          
          amountToCredit -= deduction;
          totalDeduction += deduction;
          
          const newOutstanding = debt.outstandingAmount - deduction;
          const newStatus = newOutstanding === 0n ? 'SETTLED' : 'SETTLING';
          
          await this.workerDebtRepo.updateAmount(debt.id, newOutstanding, newStatus, tx);

          // Transaction log for debt recovery
          await this.transactionLogRepo.create({
            userId: workerProfileId,
            amount: deduction,
            type: 'DEBIT',
            referenceId: debt.id,
            referenceType: 'WORKER_DEBT',
            description: `Auto-recovery from order ${hold.orderId}`,
          }, tx);
        }
      }

      // 6. Transaction log: escrow release to worker
      await this.transactionLogRepo.create({
        userId: workerProfileId,
        amount: hold.workerAmount,
        type: 'CREDIT',
        referenceId: hold.id,
        referenceType: 'ESCROW_HOLD',
        description: `Escrow release ${hold.workerAmount} for order ${hold.orderId}`,
      }, tx);

      // 7. Transaction log: platform fee (if > 0)
      if (hold.platformFee > 0n) {
        await this.transactionLogRepo.create({
          userId: 'PLATFORM',
          amount: hold.platformFee,
          type: 'CREDIT',
          referenceId: hold.id,
          referenceType: 'ESCROW_HOLD',
          description: `Platform fee ${hold.platformFee} for order ${hold.orderId}`,
        }, tx);
      }

      // 8. Update WorkerBalance
      await this.workerBalanceRepo.update(
        workerBalance.id,
        { 
          totalEarned: workerBalance.totalEarned + hold.workerAmount,
          deductedForDebts: workerBalance.deductedForDebts + totalDeduction,
        },
        workerBalance.version,
        tx
      );

      // 9. Update EscrowHold status=RELEASED
      await tx.escrowHold.update({
        where: { id: hold.id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date()
        }
      });

      await logActivity(tx, {
        actorId: 'SYSTEM',
        actionType: 'ESCROW_RELEASED',
        entityType: 'EscrowHold',
        entityId: hold.id,
        metadata: { workerAmount: hold.workerAmount.toString(), platformFee: hold.platformFee.toString() },
      });
    });
  }

  /**
   * Called by DisputeService when a dispute is opened.
   * Moves worker funds to on_hold_for_dispute.
   */
  async holdForDispute(orderId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const hold = await this.escrowHoldRepo.findByOrderId(orderId);
      if (!hold) throw new Error('EscrowHold not found');
      if (hold.status !== 'RELEASED') throw new Error('Cannot put unreleased funds on dispute hold');

      const order = await tx.order.findUnique({ where: { id: orderId }, select: { workerProfileId: true } });
      if (!order || !order.workerProfileId) throw new Error('Worker profile not found for order');
      
      const balance = await this.workerBalanceRepo.lockForUpdate(order.workerProfileId, tx);
      if (!balance) throw new Error('Worker balance lock failed');

      // Add to on_hold_for_dispute
      const available = balance.totalEarned - balance.withdrawn - balance.pendingWithdraw - balance.onHoldForDispute - balance.deductedForDebts;
      const holdAmount = available < hold.workerAmount ? available : hold.workerAmount;

      if (holdAmount > 0n) {
        await this.workerBalanceRepo.update(
          balance.id,
          { onHoldForDispute: balance.onHoldForDispute + holdAmount },
          balance.version,
          tx
        );

        await this.transactionLogRepo.create({
          userId: order.workerProfileId,
          amount: holdAmount,
          type: 'DEBIT',
          referenceId: hold.id,
          referenceType: 'DISPUTE_HOLD',
          description: `Dispute hold for order ${orderId}`,
        }, tx);

        await logActivity(tx, {
          actorId: 'SYSTEM',
          actionType: 'DISPUTE_HOLD_APPLIED',
          entityType: 'EscrowHold',
          entityId: hold.id,
          metadata: { holdAmount: holdAmount.toString() },
        });
      } else {
        console.warn(`Could not apply dispute hold for order ${orderId}: worker available balance is zero or less`);
      }
    });
  }

  /**
   * Called by DisputeService when a dispute is resolved in favor of the worker 
   * or dismissed without refund.
   */
  async releaseDisputeHold(orderId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const hold = await this.escrowHoldRepo.findByOrderId(orderId);
      if (!hold) throw new Error('EscrowHold not found');

      const order = await tx.order.findUnique({ where: { id: orderId }, select: { workerProfileId: true } });
      if (!order || !order.workerProfileId) throw new Error('Worker profile not found');

      const balance = await this.workerBalanceRepo.lockForUpdate(order.workerProfileId, tx);
      if (!balance) throw new Error('Worker balance lock failed');

      const releaseAmount = balance.onHoldForDispute < hold.workerAmount ? balance.onHoldForDispute : hold.workerAmount;

      if (releaseAmount > 0n) {
        await this.workerBalanceRepo.update(
          balance.id,
          { onHoldForDispute: balance.onHoldForDispute - releaseAmount },
          balance.version,
          tx
        );

        await this.transactionLogRepo.create({
          userId: order.workerProfileId,
          amount: releaseAmount,
          type: 'CREDIT',
          referenceId: hold.id,
          referenceType: 'DISPUTE_RELEASE',
          description: `Dispute release for order ${orderId}`,
        }, tx);

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

  /**
   * Called by DisputeService when a dispute is resolved against the worker.
   */
  async resolveDisputeAgainstWorker(orderId: string, adminId: string): Promise<void> {
    if (!this.refundService) throw new Error('RefundService not wired');
    
    const idempotencyKey = generateDeterministicKey('DISPUTE_RESOLUTION', orderId, 'REFUND');
    await this.refundService.initiateRefund(
      orderId,
      'DISPUTE_RESOLUTION',
      adminId,
      idempotencyKey,
      'Refund due to dispute resolution'
    );

    // Clear the hold
    await this.releaseDisputeHold(orderId);
  }
}
