import { $Enums } from '../../generated/prisma/client.js';
import { IDType } from '../../repositories/interfaces/Repository.js';
import { AdminRole } from '../admin.entity.js';

export type EscrowHoldStatus = $Enums.EscrowHoldStatus;

export type EscrowHold = {
  id: IDType;
  orderId: IDType;
  paymentId: IDType;
  totalAmount: bigint;
  workerAmount: bigint;
  platformFee: bigint;
  feeRuleSnapshot: Record<string, unknown>;
  status: EscrowHoldStatus;
  escrowReleaseEligibleAt: Date | null;
  releasedAt: Date | null;
  idempotencyKey: IDType;
  assignedDepartment?: AdminRole | null;
  assignedAdminId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EscrowHoldCreateInput = {
  orderId: IDType;
  paymentId: IDType;
  totalAmount: bigint;
  workerAmount: bigint;
  platformFee: bigint;
  feeRuleSnapshot: Record<string, unknown>;
  idempotencyKey: IDType;
  escrowReleaseEligibleAt?: Date;
};
