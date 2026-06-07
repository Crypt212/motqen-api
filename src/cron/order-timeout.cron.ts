import { logger } from '../libs/winston.js';
import prisma from '../libs/database.js';
import { NegotiationStatus, OrderStatus, ProposalStatus } from 'src/generated/prisma/enums.js';
import environment from 'src/configs/environment.js';

const payingPeriodSeconds = environment.cron.order.paymentExpiryIntervalHours;
const expirationTimeoutSeconds = environment.cron.order.expiryIntervalHours;

/**
 * turns the state of unpaid orders which has the state "PRICE_AGREED" and has passed the timeout period, back to "PENDING" (if order mode is "DIRECT") or "OPEN" (if order mode is "GLOBAL")
 */
async function freeAgreedUnpaidOrders(timeoutSeconds: number): Promise<void> {

  // find all negotiations that have been accepted by both parties but have not been paid after the timeout period
  const negotiations = await prisma.negotiation.findMany({
    where: {
      updatedAt: { lt: new Date(Date.now() - timeoutSeconds * 1000) },
      status: NegotiationStatus.ACCEPTED,
      order: { orderStatus: OrderStatus.PRICE_AGREED } // order still not paid
    }
  })
  const negotiationIds = negotiations.map(n => n.id);

  const orders = await prisma.order.findMany({
    where: {
      negotiations: {
        some: {
          id: { in: negotiationIds }
        }
      }
    }
  });

  const orderIds = orders.map((o) => o.id);

  await prisma.order.updateMany({ where: { id: { in: orderIds } }, data: { orderStatus: OrderStatus.PENDING }, });
  await prisma.negotiation.updateMany({ where: { id: { in: negotiationIds }, status: NegotiationStatus.ACCEPTED }, data: { status: NegotiationStatus.REJECTED } });
  await prisma.proposal.updateMany({ where: { orderId: { in: orderIds } }, data: { status: ProposalStatus.NEGOTIATING } });
  await prisma.workerOccupiedTimeSlot.deleteMany({ where: { orderId: { in: orderIds } } });
}

/**
 * cancels unpaid orders for which start date has passed by the amount of timeoutSeconds
 */
async function cancelExpiredUnpaidOrders(expirationTimeoutSeconds: number): Promise<void> {
  const orders = await prisma.order.findMany({
    where: {
      startDate: { lt: new Date(Date.now() - expirationTimeoutSeconds * 1000) },
      orderStatus: { in: [OrderStatus.PENDING, OrderStatus.PRICE_AGREED] }
    }
  });

  const orderIds = orders.map((o) => o.id);

  await prisma.order.updateMany({ where: { id: { in: orderIds } }, data: { orderStatus: OrderStatus.CANCELLED }, });
  await prisma.proposal.updateMany({ where: { orderId: { in: orderIds } }, data: { status: ProposalStatus.DISMISSED } });
  await prisma.negotiation.updateMany({ where: { orderId: { in: orderIds }, status: NegotiationStatus.ACCEPTED }, data: { status: NegotiationStatus.REJECTED } });
  await prisma.workerOccupiedTimeSlot.deleteMany({ where: { orderId: { in: orderIds } } });
}

// ─── Entry point ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  logger.info('[order-timeout] Starting cron...');
  await freeAgreedUnpaidOrders(payingPeriodSeconds);
  await cancelExpiredUnpaidOrders(expirationTimeoutSeconds);
  setInterval(() => {
    Promise.all([
      freeAgreedUnpaidOrders(payingPeriodSeconds),
      cancelExpiredUnpaidOrders(expirationTimeoutSeconds),
    ]).catch((err: unknown) => {
      logger.error('[order-timeout] Background execution error', { error: err });
    });
  }, environment.cron.intervalSeconds);
}

main().catch((err) => {
  logger.error('[order-timeout] Fatal error', err);
  process.exit(1);
});
