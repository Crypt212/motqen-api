import { IDType } from '../../repositories/interfaces/Repository.js';

export type WorkerBalance = {
  id: IDType;
  workerProfileId: IDType;
  totalEarned: bigint;
  withdrawn: bigint;
  pendingWithdraw: bigint;
  onHoldForDispute: bigint;
  deductedForDebts: bigint;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkerBalanceUpdateInput = {
  totalEarned?: bigint;
  withdrawn?: bigint;
  pendingWithdraw?: bigint;
  onHoldForDispute?: bigint;
  deductedForDebts?: bigint;
};

/**
 * Compute available-to-withdraw balance from a WorkerBalance record.
 * This is NOT a stored column — always derived from the four balance fields.
 */
export function computeAvailableToWithdraw(balance: WorkerBalance): bigint {
  return balance.totalEarned - balance.withdrawn - balance.pendingWithdraw - balance.onHoldForDispute - balance.deductedForDebts;
}
