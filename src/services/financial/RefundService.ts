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
import { Refund } from '../../domain/financial/refund.entity.js';

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

  async listByOrderId(orderId: string): Promise<Refund[]> {
    return this.refundRepo.findByOrderId(orderId);
  }

  async initiateRefund(
    orderId: string,
    reasonCode: RefundReasonCode,
    initiatedBy: string,
    idempotencyKey: string,
    notes?: string
  ) {
    const existing = await this.refundRepo.findByIdempotencyKey(idempotencyKey);
    if (existing) return existing;

    const escrow = await this.escrowHoldRepo.findByOrderId(orderId);
    if (!escrow) throw new AppError('Escrow hold not found', 404);

    if (escrow.status === 'REFUNDED') {
      const error = new AppError('ALREADY_REFUNDED', 409);
      error.name = 'ConflictError';
      throw error;
    }

    const payment = await this.paymentRepo.findByOrderId(orderId);
    if (!payment) throw new AppError('Payment not found', 404);

    if (escrow.status === 'HELD') {
      const refundAmountCents = Number(escrow.totalAmount);
      const extRefund = await this.paymentProvider.initiateRefund(
        payment.externalReferenceId,
        refundAmountCents
      );
      if (!extRefund.success) {
        throw new AppError(`External refund failed: ${extRefund.error}`, 502);
      }

      return this.prisma.$transaction(async (tx) => {
        const lockedEscrow = await this.escrowHoldRepo.lockForUpdate(escrow.id, tx);
        if (!lockedEscrow) throw new AppError('Could not lock escrow hold', 500);

        if (lockedEscrow.status === 'REFUNDED') {
          const error = new AppError('ALREADY_REFUNDED', 409);
          error.name = 'ConflictError';
          throw error;
        }

        const refund = await this.refundRepo.create(
          {
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
          },
          tx
        );

        if (!refund.created) {
          return refund.refund;
        }

        await this.transactionLogRepo.create(
          {
            userId: initiatedBy,
            amount: escrow.totalAmount,
            type: 'CREDIT',
            referenceId: refund.refund.id,
            referenceType: 'REFUND',
            description: `Pre-release refund for order ${orderId}`,
          },
          tx
        );

        await tx.escrowHold.update({
          where: { id: escrow.id },
          data: { status: 'REFUNDED' },
        });

        await logActivity(tx, {
          actorId: initiatedBy,
          actionType: 'REFUND_PRE_RELEASE',
          entityType: 'Refund',
          entityId: refund.refund.id,
          metadata: { amount: escrow.totalAmount.toString(), orderId },
        });

        return refund.refund;
      });
    }

    if (escrow.status === 'RELEASED') {
      const refundAmountCents = Number(escrow.totalAmount);
      const extRefund = await this.paymentProvider.initiateRefund(
        payment.externalReferenceId,
        refundAmountCents
      );
      if (!extRefund.success) {
        throw new AppError(`External refund failed: ${extRefund.error}`, 502);
      }

      return this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          select: { workerProfileId: true },
        });
        if (!order?.workerProfileId) throw new AppError('Order/worker profile not found', 404);

        const workerProfileId = order.workerProfileId;

        const balance = await this.workerBalanceRepo.lockForUpdate(workerProfileId, tx);
        if (!balance) throw new AppError('Worker balance not found', 404);

        const refundResult = await this.refundRepo.create(
          {
            orderId,
            escrowHoldId: escrow.id,
            amount: escrow.workerAmount,
            reasonCode,
            refundType: 'POST_RELEASE',
            originalPaymentReference: payment.externalReferenceId,
            externalRefundReference: extRefund.refundId || null,
            initiatedBy,
            idempotencyKey,
            notes: notes || null,
          },
          tx
        );

        if (!refundResult.created) return refundResult.refund;

        const refundObj = refundResult.refund;

        const available =
          balance.totalEarned -
          balance.withdrawn -
          balance.pendingWithdraw -
          balance.onHoldForDispute;
        const amountToDeduct = escrow.workerAmount;

        if (available >= amountToDeduct) {
          await tx.workerBalance.update({
            where: { id: balance.id, version: balance.version },
            data: {
              totalEarned: BigInt(balance.totalEarned) - amountToDeduct,
              version: balance.version + 1,
            },
          });

          await this.transactionLogRepo.create(
            {
              userId: workerProfileId,
              amount: amountToDeduct,
              type: 'DEBIT',
              referenceId: refundObj.id,
              referenceType: 'REFUND',
              description: `Post-release refund for order ${orderId}`,
            },
            tx
          );
        } else {
          const deductNow = available > 0n ? available : 0n;
          const debtAmount = amountToDeduct - deductNow;

          if (deductNow > 0n) {
            await tx.workerBalance.update({
              where: { id: balance.id, version: balance.version },
              data: {
                totalEarned: BigInt(balance.totalEarned) - deductNow,
                version: balance.version + 1,
              },
            });

            await this.transactionLogRepo.create(
              {
                userId: workerProfileId,
                amount: deductNow,
                type: 'DEBIT',
                referenceId: refundObj.id,
                referenceType: 'REFUND',
                description: `Partial post-release refund for order ${orderId}`,
              },
              tx
            );
          }

          const debtObj = await this.workerDebtRepo.create(
            {
              workerProfileId,
              refundId: refundObj.id,
              originalAmount: amountToDeduct,
              outstandingAmount: debtAmount,
            },
            tx
          );

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
      });
    }

    throw new AppError(`Cannot refund escrow hold with status ${escrow.status}`, 400);
  }
}
