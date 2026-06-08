import { $Enums } from '../../generated/prisma/client.js';
import { AdminRole } from '../admin.entity.js';

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
  assignedDepartment?: AdminRole | null;
  assignedAdminId?: string | null;
  createdAt: Date;
};

export type RefundCreateInput = Omit<Refund, 'id' | 'createdAt'>;
