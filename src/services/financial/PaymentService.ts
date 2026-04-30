import { PrismaClient } from '../../generated/prisma/client.js';
import { IWebhookEventRepository } from '../../repositories/interfaces/financial/WebhookEventRepository.js';
import { IPaymentRepository } from '../../repositories/interfaces/financial/PaymentRepository.js';
import { IPaymentAttemptRepository } from '../../repositories/interfaces/financial/PaymentAttemptRepository.js';
import IEscrowHoldRepository from '../../repositories/interfaces/financial/EscrowHoldRepository.js';
import ITransactionLogRepository from '../../repositories/interfaces/financial/TransactionLogRepository.js';
import IFeeRuleRepository from '../../repositories/interfaces/financial/FeeRuleRepository.js';
import IWorkerBalanceRepository from '../../repositories/interfaces/financial/WorkerBalanceRepository.js';
import { IPaymentProvider } from '../../providers/interfaces/IPaymentProvider.js';

import { calculateFee } from './helpers/feeCalculator.js';
import { generateDeterministicKey } from './helpers/idempotencyHelper.js';
import { logActivity } from './helpers/activityLogger.js';
import { IDType } from 'src/repositories/interfaces/Repository.js';

import AppError from 'src/errors/AppError.js';
import { PaymobWebhookPayload } from 'src/schemas/financial/payment.schema.js';
import { FeeRule } from 'src/domain/financial/feeRule.entity.js';
import {
  AmountMismatchError,
  WebhookProcessingError,
  WebhookValidationError,
} from 'src/errors/WebHookError.js';
import { emitToUser } from 'src/socket/socket-emitter.js';

type WebhookStep = 'VALIDATION' | 'TX_ATTEMPT' | 'TX_PAYMENT' | 'TX_ORDER_STATUS' | 'TX_EFFECTS';

export interface WebhookContext {
  step: WebhookStep;
  orderId: string;
  providerEventId: string;
  webhookEventId: string;
  amountBigInt: bigint;
  success: boolean;
  feeRule: FeeRule;
  attemptId?: string;
  paymentId?: string;
  escrowId?: string;
  userId: string;
  specialReference: string;
}
export class PaymentService {
  constructor(
    private readonly webhookEventRepo: IWebhookEventRepository,
    private readonly paymentRepo: IPaymentRepository,
    private readonly paymentAttemptRepo: IPaymentAttemptRepository,
    private readonly escrowHoldRepo: IEscrowHoldRepository,
    private readonly transactionLogRepo: ITransactionLogRepository,
    private readonly feeRuleRepo: IFeeRuleRepository,
    private readonly workerBalanceRepo: IWorkerBalanceRepository,
    private readonly paymentProvider: IPaymentProvider,
    private readonly prisma: PrismaClient
  ) {}

  private async handleWebhookError(e: any, ctx: Partial<WebhookContext>) {
    if (e instanceof WebhookProcessingError) {
      if (e.code === 'DUPLICATE_WEBHOOK') {
        await this.webhookEventRepo
          .update(ctx.webhookEventId!, {
            status: 'DUPLICATE',
          })
          .catch(() => {});
        return { status: 'duplicate' };
      }

      if (e.code === 'DUPLICATE_PAYMENT') {
        // Duplicate payment on a paid order → immediate refund
        await this.webhookEventRepo
          .update(ctx.webhookEventId!, {
            status: 'FAILED',
            failureReason: 'DUPLICATE_PAYMENT',
          })
          .catch(() => {});

        await logActivity(this.prisma, {
          actorId: 'SYSTEM',
          actionType: 'DUPLICATE_PAYMENT_DETECTED',
          entityType: 'Order',
          entityId: ctx.orderId!,
          metadata: { amount: ctx.amountBigInt?.toString(), providerEventId: ctx.providerEventId },
        });

        const refundResult = await this.paymentProvider.initiateRefund(
          ctx.providerEventId!,
          Number(ctx.amountBigInt)
        );
        console.log(
          `Refund initiated for duplicate payment on order ${ctx.orderId}:`,
          refundResult
        );
        return { status: 'refunded_duplicate' };
      }

      // Other codes
      await this.webhookEventRepo
        .update(ctx.webhookEventId!, {
          status: 'FAILED',
          failureReason: e.code,
        })
        .catch(() => {});

      if (e.shouldReturn200) {
        return { status: 'rejected', reason: e.code };
      }
      throw e;
    }

    // Unexpected P2002 — race condition
    if (e.code === 'P2002') {
      console.error('Unexpected P2002 outside duplicate payment check', ctx);
      throw e;
    }

    throw e;
  }

  private async txRecordAttempt(ctx: WebhookContext, obj: any) {
    const attempt = await this.prisma.$transaction(async (tx) => {
      const attempt = await this.paymentAttemptRepo.create(
        {
          orderId: ctx.orderId,
          paymentId: null,
          webhookEventId: ctx.webhookEventId,
          status: ctx.success ? 'SUCCESS' : 'FAILED',
          providerResponseCode: String(obj.data?.txn_response_code ?? 'UNKNOWN'),
          providerResponseMessage: String(obj.data?.message ?? 'UNKNOWN'),
          amount: ctx.amountBigInt,
        },
        tx
      );
      return attempt;
    });
    ctx.attemptId = attempt.id;
  }
  private async txCreatePayment(ctx: WebhookContext, obj: any) {
    await this.prisma.$transaction(async (tx) => {
      // ── Pessimistic lock + double check inside tx ──────────
      const [lockedOrder] = await tx.$queryRaw<{ id: string; status: string }[]>`
      SELECT id, status FROM orders WHERE id = ${ctx.orderId} FOR UPDATE
    `;

      const allowedStatuses = ['ORDERED', 'APPROVED'];
      if (!allowedStatuses.includes(lockedOrder.status)) {
        throw new WebhookProcessingError('UNALLOCATED_FUNDS', ctx);
      }

      const lockedPayment = await tx.payment.findUnique({
        where: { orderId: ctx.orderId },
        select: { id: true, externalReferenceId: true },
      });

      if (lockedPayment) {
        if (lockedPayment.externalReferenceId === ctx.providerEventId) {
          throw new WebhookProcessingError('DUPLICATE_WEBHOOK', ctx);
        }
        throw new WebhookProcessingError('UNALLOCATED_FUNDS', ctx);
      }

      // ── Payment ────────────────────────────────────────────
      const idempotencyKey = generateDeterministicKey(
        'PAYMOB_PAYMENT',
        ctx.providerEventId,
        'PAYMENT_RECEIVED'
      );
      const { workerAmount, platformFee, feeRuleSnapshot } = calculateFee(
        ctx.amountBigInt,
        ctx.feeRule as any
      );

      const payment = await this.paymentRepo.create(
        {
          orderId: ctx.orderId,
          webhookEventId: ctx.webhookEventId,
          idempotencyKey,
          externalReferenceId: ctx.providerEventId,
          amount: ctx.amountBigInt,
          currency: String(obj.currency || 'EGP'),
        },
        tx
      );

      ctx.paymentId = payment.id;

      await tx.paymentAttempt.update({
        where: { id: ctx.attemptId },
        data: { paymentId: payment.id },
      });

      // ── Escrow ─────────────────────────────────────────────
      const escrowKey = generateDeterministicKey('PAYMENT_TO_ESCROW', payment.id, 'ESCROW_HOLD');
      const escrow = await this.escrowHoldRepo.create(
        {
          orderId: ctx.orderId,
          paymentId: payment.id,
          totalAmount: ctx.amountBigInt,
          workerAmount,
          platformFee,
          feeRuleSnapshot,
          idempotencyKey: escrowKey,
        },
        tx
      );

      ctx.escrowId = escrow.id;

      // ── Transaction Log (passive, replaces double-entry ledger) ──
      await this.transactionLogRepo.create(
        {
          userId: ctx.userId,
          amount: ctx.amountBigInt,
          type: 'DEBIT',
          referenceId: payment.id,
          referenceType: 'PAYMENT',
          description: `Payment for order ${ctx.orderId} held in escrow`,
        },
        tx
      );

      // ── Intentions & Order status → PAID ────────────────
      await tx.paymentIntention.update({
        where: { specialReference: ctx.specialReference },
        data: { isPaid: true },
      });

      await tx.order.update({
        where: { id: ctx.orderId },
        data: { orderStatus: 'PAID' },
      });

      // ── Activity log ─────────────────────────────────────
      await logActivity(tx, {
        actorId: ctx.userId,
        actionType: 'PAYMENT_RECEIVED',
        entityType: 'Payment',
        entityId: payment.id,
        metadata: { amount: ctx.amountBigInt.toString(), orderId: ctx.orderId },
      });

      await logActivity(tx, {
        actorId: ctx.userId,
        actionType: 'ESCROW_CREATED',
        entityType: 'EscrowHold',
        entityId: escrow.id,
        metadata: { amount: ctx.amountBigInt.toString(), orderId: ctx.orderId },
      });

      await tx.webhookEvent.update({
        where: { id: ctx.webhookEventId },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });
    });
  }

  private async txSideEffects(ctx: WebhookContext) {
    emitToUser(ctx.userId, 'OrderPaid', {
      orderId: ctx.orderId,
      paymentId: ctx.paymentId,
      escrowId: ctx.escrowId,
      amount: ctx.amountBigInt.toString(),
    });
  }

  async processWebhook(rawPayload: PaymobWebhookPayload, eventID: string) {
    const ctx: WebhookContext = {} as any;

    try {
      ctx.step = 'VALIDATION';

      const obj = rawPayload.obj;
      if (!obj) throw new WebhookValidationError('INVALID_PAYLOAD', ctx);

      const merchantOrderId = obj.order.merchant_order_id;
      if (!merchantOrderId) throw new WebhookValidationError('MISSING_MERCHANT_ORDER_ID', ctx);

      const parts = merchantOrderId.split('_');
      if (!parts[0]) throw new WebhookValidationError('INVALID_ORDER_ID_FORMAT', ctx);

      ctx.orderId = parts[0];
      ctx.specialReference = merchantOrderId;
      ctx.providerEventId = String(obj.id);
      ctx.webhookEventId = eventID;
      ctx.success = obj.success === true;
      ctx.amountBigInt = BigInt(obj.amount_cents);

      const intention = await this.prisma.paymentIntention.findUnique({
        where: { specialReference: ctx.specialReference },
        include: {
          order: {
            include: { clientProfile: { include: { user: true } } },
          },
        },
      });

      if (!intention) throw new WebhookValidationError('INVALID_SPECIAL_REFERENCE', ctx);
      if (intention.orderId !== ctx.orderId) {
        throw new WebhookValidationError('ORDER_REFERENCE_MISMATCH', ctx);
      }
      if (intention.isPaid) throw new WebhookProcessingError('UNALLOCATED_FUNDS', ctx);

      const order = intention.order;
      if (!order) throw new WebhookValidationError('ORDER_NOT_FOUND', ctx);

      ctx.userId = order.clientProfile?.user?.id;
      if (!ctx.userId) throw new WebhookValidationError('USER_ORDER_MISMATCH', ctx);

      // ── Status check ───────────────────────────────────────
      const allowedStatuses = ['ORDERED', 'APPROVED'];
      if (!allowedStatuses.includes(order.orderStatus)) {
        throw new WebhookProcessingError('UNALLOCATED_FUNDS', ctx);
      }

      // ── Amount check ───────────────────────────────────────
      const expectedAmount = BigInt(Math.round(order.finalPrice * 100));
      if (expectedAmount !== ctx.amountBigInt) {
        throw new AmountMismatchError(ctx.orderId, expectedAmount, ctx.amountBigInt, ctx);
      }

      const feeRule = await this.feeRuleRepo.findActive();
      if (!feeRule) throw new WebhookValidationError('NO_FEE_RULE', ctx);
      ctx.feeRule = feeRule;

      // ── TX 1: Record attempt ───────────────────────────────
      ctx.step = 'TX_ATTEMPT';

      if (!ctx.attemptId) {
        const existingAttempt = await this.prisma.paymentAttempt.findFirst({
          where: { webhookEventId: ctx.webhookEventId },
          select: { id: true },
        });

        if (existingAttempt) {
          ctx.attemptId = existingAttempt.id;
        } else {
          await this.txRecordAttempt(ctx, obj);
        }
      }

      // ── TX 2: Payment + Escrow + Transaction Log ───────────
      if (ctx.success) {
        ctx.step = 'TX_PAYMENT';
        if (!ctx.paymentId) {
          const existingPayment = await this.prisma.payment.findUnique({
            where: { orderId: ctx.orderId },
            select: { id: true },
          });

          if (existingPayment) {
            await this.prisma.order.update({
              where: { id: ctx.orderId },
              data: { orderStatus: 'PAID' },
            });
            await this.prisma.webhookEvent.update({
              where: { id: ctx.webhookEventId },
              data: { status: 'PROCESSED', processedAt: new Date() },
            });

            ctx.paymentId = existingPayment.id;
          } else {
            await this.txCreatePayment(ctx, obj);
          }
        }
      }

      // ── TX 3: Side effects ─────────────────────────────────
      ctx.step = 'TX_EFFECTS';
      if (ctx.success && ctx.paymentId) {
        await this.txSideEffects(ctx);
      }

      return { status: 'processed' };
    } catch (e: any) {
      await this.handleWebhookError(e, ctx);
      throw e;
    }
  }

  async createPaymentIframe(orderId: string, userId: IDType): Promise<string> {
    const specialReference = `${orderId}_${Date.now().toString(36)}`;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { clientProfile: { include: { user: true } } },
    });
    if (!order) throw new AppError('order not found', 404);
    if (order.clientProfile.user.id !== userId)
      throw new AppError('user not authorized to pay for this order', 403);

    if (order.orderStatus !== 'PRICE_AGREED') throw new AppError('order not in ordered state', 400);

    const amountCents = Math.round(order.finalPrice * 100);

    const billingData = {
      first_name: order.clientProfile.user.firstName,
      last_name: order.clientProfile.user.lastName,
      email: 'ex@g.com',
      phone_number: order.clientProfile.user.phoneNumber,
    };

    await this.prisma.paymentIntention.create({
      data: {
        orderId,
        specialReference,
        amount: BigInt(amountCents),
      },
    });

    const iframeUrl = await this.paymentProvider.createPaymentIntention(
      { amountCents, orderId, specialReference },
      billingData,
      userId
    );

    return iframeUrl;
  }
}
