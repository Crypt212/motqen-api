import type { NotificationType as _NotificationType, BroadcastTargetRole as _BroadcastTargetRole } from '../generated/prisma/enums.js';

export type NotificationType = _NotificationType;
export type BroadcastTargetRole = _BroadcastTargetRole;

export interface NotificationData {
  screen:
    | 'order_details'
    | 'negotiation'
    | 'payment'
    | 'wallet'
    | 'dispute_details'
    | 'profile'
    | 'open_orders'
    | 'home'
  entityId: string;
  entityType:
    | 'order'
    | 'dispute'
    | 'payout'
    | 'withdraw'
    | 'admin_action'
    | 'government'
    | 'broadcast'
    |'none';
  actionType?: 'WARNING' | 'SUSPENDED' | 'BANNED';
  openOrdersCount?: string;
  workerId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData;
  isSent: boolean;
  createdAt: Date;
}

export  type NotificationCreateInput = Omit<Notification, 'id' | 'createdAt'>;

export type NotificationPayload = Omit<Notification, 'id' | 'createdAt' | 'userId' | 'isSent'>;

export type NotificationEventContext =
  | { type: 'ORDER_ACCEPTED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'ORDER_CANCELLED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'ORDER_COMPLETED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'NEGOTIATION_OFFER'; ctx: { orderId: string; orderTitle: string; proposedAmount: number } }
  | { type: 'NEGOTIATION_ACCEPTED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'NEGOTIATION_REJECTED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'WORK_STARTED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'WORK_DONE'; ctx: { orderId: string; workerId: string } }
  | { type: 'PAYMENT_REQUIRED'; ctx: { orderId: string; orderTitle: string; amount: number } }
  | { type: 'PAYMENT_RECEIVED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'PAYOUT_COMPLETED'; ctx: { payoutId: string; amount: number } }
  | { type: 'DISPUTE_OPENED'; ctx: { disputeId: string; orderTitle: string } }
  | { type: 'DISPUTE_UPDATED'; ctx: { disputeId: string; updateMessage?: string } }
  | { type: 'DISPUTE_RESOLVED'; ctx: { disputeId: string; resolution?: string } }
  | { type: 'REFUND_PROCESSED'; ctx: { orderId: string; amount: number } }
  | { type: 'WITHDRAW_REQUESTED'; ctx: { withdrawId: string; amount: number } }
  | { type: 'WITHDRAW_APPROVED'; ctx: { withdrawId: string; amount: number } }
  | { type: 'WITHDRAW_REJECTED'; ctx: { withdrawId: string; rejectionReason?: string } }
  | { type: 'ADMIN_ACTION'; ctx: { userId: string; actionType: 'WARNING' | 'SUSPENDED' | 'BANNED'; reason?: string } }
  | { type: 'RATING'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'NEW_ORDER'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'ORDER_RATED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'NEW_PROPOSAL'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'NEW_MESSAGE'; ctx: { conversationId: string } }
  | { type: 'TEST_NOTIFICATION'; ctx: { message?: string } };