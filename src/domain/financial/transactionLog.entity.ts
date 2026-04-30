import { IDType } from '../../repositories/interfaces/Repository.js';

export type TransactionLogType = 'CREDIT' | 'DEBIT';

export type TransactionLog = {
  id: IDType;
  userId: string;
  amount: bigint;
  type: TransactionLogType;
  referenceId: string;
  referenceType: string;
  description: string | null;
  createdAt: Date;
};

export type TransactionLogCreateInput = {
  userId: string;
  amount: bigint;
  type: TransactionLogType;
  referenceId: string;
  referenceType: string;
  description?: string;
};
