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
