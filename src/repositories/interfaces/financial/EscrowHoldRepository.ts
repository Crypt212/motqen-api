import { Prisma } from '../../../generated/prisma/client.js';
import { EscrowHold } from '../../../domain/financial/escrow.entity.js';

export type TransactionClient = Prisma.TransactionClient;

export default interface IEscrowHoldRepository {
  create(data: {
    orderId: string;
    paymentId: string;
    totalAmount: bigint;
    workerAmount: bigint;
    platformFee: bigint;
    feeRuleSnapshot: Record<string, unknown>;
    idempotencyKey: string;
  }, tx?: TransactionClient): Promise<EscrowHold>;
  findById(id: string, tx?: TransactionClient): Promise<EscrowHold | null>;
  findByOrderId(orderId: string): Promise<EscrowHold | null>;
  updateStatus(id: string, status: EscrowHold['status'], tx?: TransactionClient): Promise<EscrowHold>;
  findEligibleForRelease(limit: number): Promise<EscrowHold[]>;
  lockForUpdate(id: string, tx: TransactionClient): Promise<EscrowHold | null>;
}
