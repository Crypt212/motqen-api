import { OrderStatus, WorkStatus } from '../generated/prisma/client.js';

const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.TIME_SPECIFIED, OrderStatus.PRICE_AGREED, OrderStatus.CANCELLED],
  TIME_SPECIFIED: [OrderStatus.PRICE_AGREED, OrderStatus.CANCELLED],
  PRICE_AGREED: [OrderStatus.PAID, OrderStatus.CANCELLED],
  PAID: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

const WORK_TRANSITIONS: Record<WorkStatus, WorkStatus[]> = {
  PENDING: [WorkStatus.WAITING_FOR_WORK],
  WAITING_FOR_WORK: [WorkStatus.STARTED],
  STARTED: [WorkStatus.DONE],
  DONE: [],
};

export function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus): boolean {
  return ORDER_TRANSITIONS[current]?.includes(next) ?? false;
}

export function canTransitionWorkStatus(current: WorkStatus, next: WorkStatus): boolean {
  return WORK_TRANSITIONS[current]?.includes(next) ?? false;
}
