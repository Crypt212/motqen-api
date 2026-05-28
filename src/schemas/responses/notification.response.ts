import { z } from '../../libs/zod.js';
import { UUIDSchema } from '../common.js';
import { SuccessResponseSchema } from '../responses.js';

const NotificationDataSchema = z.object({
  screen: z.enum([
    'order_details',
    'negotiation',
    'payment',
    'wallet',
    'dispute_details',
    'profile',
    'open_orders',
    'announcement',
  ]),
  entityId: z.string(),
  entityType: z.enum([
    'order',
    'dispute',
    'payout',
    'withdraw',
    'admin_action',
    'government',
    'broadcast',
  ]),
  actionType: z.enum(['WARNING', 'SUSPENDED', 'BANNED']).optional(),
  openOrdersCount: z.string().optional(),
});

const NotificationSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  type: z.enum([
    'ORDER_ACCEPTED',
    'ORDER_CANCELLED',
    'ORDER_COMPLETED',
    'NEGOTIATION_OFFER',
    'NEGOTIATION_ACCEPTED',
    'NEGOTIATION_REJECTED',
    'WORK_STARTED',
    'WORK_DONE',
    'PAYMENT_REQUIRED',
    'PAYMENT_RECEIVED',
    'PAYOUT_COMPLETED',
    'DISPUTE_OPENED',
    'DISPUTE_UPDATED',
    'DISPUTE_RESOLVED',
    'REFUND_PROCESSED',
    'WITHDRAW_REQUESTED',
    'WITHDRAW_APPROVED',
    'WITHDRAW_REJECTED',
    'ADMIN_ACTION',
  ]),
  title: z.string(),
  body: z.string(),
  data: NotificationDataSchema,
  isSent: z.boolean(),
  createdAt: z.string().datetime(),
});

export const NotificationsResponseSchema = SuccessResponseSchema(
  z.object({
    notifications: z.array(NotificationSchema),
    nextCursor: z.string().nullable(),
    unreadCount: z.number(),
  })
);

export const MarkAllReadResponseSchema = SuccessResponseSchema(
  z.object({
    success: z.boolean(),
  })
);
