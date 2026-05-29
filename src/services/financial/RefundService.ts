import { PrismaClient, RefundReasonCode } from '../../generated/prisma/client.js';
import { IRefundRepository } from '../../repositories/interfaces/financial/RefundRepository.js';
import IEscrowHoldRepository from '../../repositories/interfaces/financial/EscrowHoldRepository.js';
import ITransactionLogRepository from '../../repositories/interfaces/financial/TransactionLogRepository.js';
import IWorkerBalanceRepository from '../../repositories/interfaces/financial/WorkerBalanceRepository.js';
import { IWorkerDebtRepository } from '../../repositories/interfaces/financial/WorkerDebtRepository.js';
import { IPaymentRepository } from '../../repositories/interfaces/financial/PaymentRepository.js';
import { IPaymentProvider } from '../../providers/interfaces/IPaymentProvider.js';

import { logActivity } from './helpers/activityLogger.js';
import AppError from 'src/errors/AppError.js';

export class RefundService {
  constructor(
    private readonly refundRepo: IRefundRepository,
    private readonly escrowHoldRepo: IEscrowHoldRepository,
    private readonly transactionLogRepo: ITransactionLogRepository,
    private readonly workerBalanceRepo: IWorkerBalanceRepository,
    private readonly workerDebtRepo: IWorkerDebtRepository,
    private readonly paymentProvider: IPaymentProvider,
    private readonly paymentRepo: IPaymentRepository,
    private readonly prisma: PrismaClient
  ) {}

  async initiateRefund(
    orderId: string, 
    reasonCode: RefundReasonCode, 
    initiatedBy: string, 
    idempotencyKey: string, 
    notes?: string
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Get EscrowHold
      const escrow = await this.escrowHoldRepo.findByOrderId(orderId);
      if (!escrow) throw new AppError('Escrow hold not found');

      if (escrow.status === 'REFUNDED') {
        const error = new AppError('ALREADY_REFUNDED');
        error.name = 'ConflictError';
        throw error;
      }

      const payment = await this.paymentRepo.findByOrderId(orderId);
      if (!payment) throw new AppError('Payment not found');

      if (escrow.status === 'HELD') {
        // Pre-release
        const lockedEscrow = await this.escrowHoldRepo.lockForUpdate(escrow.id, tx);
        if (!lockedEscrow) throw new AppError('Could not lock escrow hold');

        const refundAmountCents = Number(escrow.totalAmount);
        
        const extRefund = await this.paymentProvider.initiateRefund(payment.externalReferenceId, refundAmountCents);
        if (!extRefund.success) {
          throw new AppError(`External refund failed: ${extRefund.error}`);
        }

        const refund = await this.refundRepo.create({
          orderId,
          escrowHoldId: escrow.id,
          amount: escrow.totalAmount,
          reasonCode,
          refundType: 'PRE_RELEASE',
          originalPaymentReference: payment.externalReferenceId,
          externalRefundReference: extRefund.refundId || null,
          initiatedBy,
          idempotencyKey,
          notes: notes || null,
        }, tx);

        if (!refund.created) {
          return refund.refund;
        }

        // Transaction log: refund from escrow to client
        await this.transactionLogRepo.create({
          userId: initiatedBy,
          amount: escrow.totalAmount,
          type: 'CREDIT',
          referenceId: refund.refund.id,
          referenceType: 'REFUND',
          description: `Pre-release refund for order ${orderId}`,
        }, tx);

        await tx.escrowHold.update({
          where: { id: escrow.id },
          data: { status: 'REFUNDED' }
        });

        await logActivity(tx, {
          actorId: initiatedBy,
          actionType: 'REFUND_PRE_RELEASE',
          entityType: 'Refund',
          entityId: refund.refund.id,
          metadata: { amount: escrow.totalAmount.toString(), orderId },
        });

        return refund.refund;
      } else if (escrow.status === 'RELEASED') {
        // Post-release
        const order = await tx.order.findUnique({ where: { id: orderId }, select: { workerProfileId: true } });
        if (!order || !order.workerProfileId) throw new AppError('Order/worker profile not found');

        const workerProfileId = order.workerProfileId;

        const balance = await this.workerBalanceRepo.lockForUpdate(workerProfileId, tx);
        if (!balance) throw new AppError('Worker balance not found');

        const refundResult = await this.refundRepo.create({
            orderId,
            escrowHoldId: escrow.id,
            amount: escrow.workerAmount,
            reasonCode,
            refundType: 'POST_RELEASE',
            originalPaymentReference: payment.externalReferenceId,
            externalRefundReference: null,
            initiatedBy,
            idempotencyKey,
            notes: notes || null,
          }, tx);

        if (!refundResult.created) return refundResult.refund;

        const refundObj = refundResult.refund;
        
        let available = balance.totalEarned - balance.withdrawn - balance.pendingWithdraw - balance.onHoldForDispute;
        let amountToDeduct = escrow.workerAmount;

        if (available >= amountToDeduct) {
          // Can fully deduct
          await tx.workerBalance.update(
            { 
              where: { id: balance.id, version: balance.version }, 
              data: { totalEarned: BigInt(balance.totalEarned) - amountToDeduct, version: balance.version + 1 } 
            }
          );

          await this.transactionLogRepo.create({
            userId: workerProfileId,
            amount: amountToDeduct,
            type: 'DEBIT',
            referenceId: refundObj.id,
            referenceType: 'REFUND',
            description: `Post-release refund for order ${orderId}`,
          }, tx);
        } else {
          // Cannot fully deduct. Create WorkerDebt for the remainder.
          const deductNow = available > 0n ? available : 0n;
          const debtAmount = amountToDeduct - deductNow;

          if (deductNow > 0n) {
            await tx.workerBalance.update(
              { 
                where: { id: balance.id, version: balance.version }, 
                data: { totalEarned: BigInt(balance.totalEarned) - deductNow, version: balance.version + 1 } 
              }
            );

            await this.transactionLogRepo.create({
              userId: workerProfileId,
              amount: deductNow,
              type: 'DEBIT',
              referenceId: refundObj.id,
              referenceType: 'REFUND',
              description: `Partial post-release refund for order ${orderId}`,
            }, tx);
          }

          // Create WorkerDebt
          const debtObj = await this.workerDebtRepo.create({
            workerProfileId,
            refundId: refundObj.id,
            originalAmount: amountToDeduct,
            outstandingAmount: debtAmount,
          }, tx);

          await logActivity(tx, {
            actorId: initiatedBy,
            actionType: 'DEBT_CREATED',
            entityType: 'WorkerDebt',
            entityId: debtObj.id,
            metadata: { amount: debtAmount.toString() },
          });
        }

        await logActivity(tx, {
          actorId: initiatedBy,
          actionType: 'REFUND_POST_RELEASE',
          entityType: 'Refund',
          entityId: refundObj.id,
          metadata: { amount: escrow.workerAmount.toString(), orderId },
        });

        return refundObj;
      }
      return null;
    });
  }
}
