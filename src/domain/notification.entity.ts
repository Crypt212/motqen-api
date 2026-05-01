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
    | 'announcement';
  entityId: string;
  entityType:
    | 'order'
    | 'dispute'
    | 'payout'
    | 'withdraw'
    | 'admin_action'
    | 'government'
    | 'broadcast';
  actionType?: 'WARNING' | 'SUSPENDED' | 'BANNED';
  openOrdersCount?: string;
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

export interface NotificationCreateInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData;
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData;
}

export type NotificationEventContext =
  | { type: 'ORDER_ACCEPTED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'ORDER_CANCELLED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'ORDER_COMPLETED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'NEGOTIATION_OFFER'; ctx: { orderId: string; orderTitle: string; proposedAmount: number } }
  | { type: 'NEGOTIATION_ACCEPTED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'NEGOTIATION_REJECTED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'WORK_STARTED'; ctx: { orderId: string; orderTitle: string } }
  | { type: 'WORK_DONE'; ctx: { orderId: string } }
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
  | { type: 'ADMIN_ACTION'; ctx: { userId: string; actionType: 'WARNING' | 'SUSPENDED' | 'BANNED'; reason?: string } };
