import { $Enums } from '../../generated/prisma/client.js';

export type RefundReasonCode = $Enums.RefundReasonCode;

export type Refund = {
  id: string;
  orderId: string;
  escrowHoldId: string;
  amount: bigint;
  reasonCode: RefundReasonCode;
  refundType: string;
  originalPaymentReference: string;
  externalRefundReference: string | null;
  initiatedBy: string;
  idempotencyKey: string;
  notes: string | null;
  createdAt: Date;
};

export type RefundCreateInput = Omit<Refund, 'id' | 'createdAt'>;
