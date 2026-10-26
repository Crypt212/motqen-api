import { logger } from '../libs/winston.js';
import prisma from '../libs/database.js';
import { NegotiationStatus, OrderStatus, ProposalStatus } from '../generated/prisma/enums.js';
import environment from '../configs/environment.js';

const paymentExpiryMs = environment.cron.order.paymentExpiryMs;
const expiryMs = environment.cron.order.expiryMs;

/**
 * turns the state of unpaid orders which has the state "PRICE_AGREED" and has passed the timeout period, back to "PENDING"
 */
async function freeAgreedUnpaidOrders(paymentExpiryMs: number): Promise<void> {

  // find all negotiations that have been accepted by both parties but have not been paid after the timeout period
  const negotiations = await prisma.negotiation.findMany({
    where: {
      updatedAt: { lt: new Date(Date.now() - paymentExpiryMs) },
      status: NegotiationStatus.ACCEPTED,
      order: { orderStatus: OrderStatus.PRICE_AGREED } // order still not paid
    }
  })
  const negotiationIds = negotiations.map(n => n.id);
  if (negotiationIds.length === 0) return;

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
  if (orderIds.length === 0) return;

  await prisma.$transaction([
    prisma.order.updateMany({ where: { id: { in: orderIds }, orderStatus: OrderStatus.PRICE_AGREED }, data: { orderStatus: OrderStatus.PENDING } }),
    prisma.negotiation.updateMany({ where: { id: { in: negotiationIds }, status: NegotiationStatus.ACCEPTED }, data: { status: NegotiationStatus.CANCELLED } }),
    prisma.proposal.updateMany({ where: { orderId: { in: orderIds } }, data: { status: ProposalStatus.NEGOTIATING } }),
    prisma.workerOccupiedTimeSlot.deleteMany({ where: { orderId: { in: orderIds } } }),
  ]);
}

/**
 * cancels unpaid orders for which start date has passed by the amount of expiryMs
 */
async function cancelExpiredUnpaidOrders(expiryMs: number): Promise<void> {
  const orders = await prisma.order.findMany({
    where: {
      startDate: { lt: new Date(Date.now() - expiryMs) },
      orderStatus: { in: [OrderStatus.PENDING, OrderStatus.PRICE_AGREED] }
    }
  });

  const orderIds = orders.map((o) => o.id);
  if (orderIds.length === 0) return;

  await prisma.$transaction([
    prisma.order.updateMany({ where: { id: { in: orderIds }, orderStatus: { in: [OrderStatus.PENDING, OrderStatus.PRICE_AGREED] } }, data: { orderStatus: OrderStatus.CANCELLED } }),
    prisma.proposal.updateMany({ where: { orderId: { in: orderIds } }, data: { status: ProposalStatus.DISMISSED } }),
    prisma.negotiation.updateMany({ where: { orderId: { in: orderIds }, status: NegotiationStatus.ACCEPTED }, data: { status: NegotiationStatus.CANCELLED } }),
    prisma.workerOccupiedTimeSlot.deleteMany({ where: { orderId: { in: orderIds } } }),
  ]);
}


async function main(): Promise<void> {
  logger.info('[order-timeout] Starting cron...');
  await freeAgreedUnpaidOrders(paymentExpiryMs);
  await cancelExpiredUnpaidOrders(expiryMs);
  setInterval(() => {
    Promise.all([
      freeAgreedUnpaidOrders(paymentExpiryMs),
      cancelExpiredUnpaidOrders(expiryMs),
    ]).catch((err: unknown) => {
      logger.error('[order-timeout] Background execution error', { error: err });
    });
  }, environment.cron.intervalMs);
}

main().catch((err) => {
  logger.error('[order-timeout] Fatal error', err);
  process.exit(1);
});
