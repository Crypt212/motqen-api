import { $Enums } from '../../generated/prisma/client.js';

export type WorkerDebtStatus = $Enums.WorkerDebtStatus;

export type WorkerDebt = {
  id: string;
  workerProfileId: string;
  refundId: string;
  originalAmount: bigint;
  outstandingAmount: bigint;
  status: WorkerDebtStatus;
  settledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkerDebtCreateInput = Omit<WorkerDebt, 'id' | 'status' | 'settledAt' | 'createdAt' | 'updatedAt'>;
