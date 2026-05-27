import { $Enums } from '../../generated/prisma/client.js';

export type PayoutMethodType = $Enums.PayoutMethodType;
export type WithdrawRequestStatus = $Enums.WithdrawRequestStatus;
export type PayoutExecutionStatus = $Enums.PayoutExecutionStatus;

export type PayoutMethod = {
  id: string;
  workerProfileId: string;
  methodType: PayoutMethodType;
  accountName: string;
  accountNumber: string;
  bankName: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PayoutMethodCreateInput = Omit<PayoutMethod, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>&{methodType:PayoutMethodType};

export type WithdrawRequest = {
  id: string;
  workerProfileId: string;
  workerBalanceId: string;
  payoutMethodId: string;
  amount: bigint;
  status: WithdrawRequestStatus;
  payoutMethodSnapshot: Record<string, unknown>;
  idempotencyKey: string;
  adminNotes: string | null;
  processedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type WithdrawRequestCreateInput = Omit<WithdrawRequest, 'id' | 'status' | 'adminNotes' | 'processedBy' | 'createdAt' | 'updatedAt'>;

export type PayoutExecution = {
  id: string;
  withdrawRequestId: string;
  amount: bigint;
  status: PayoutExecutionStatus;
  externalReferenceId: string | null;
  proofOfPaymentUrl: string | null;
  providerResponseCode: string | null;
  providerResponseMessage: string | null;
  idempotencyKey: string;
  executedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PayoutExecutionCreateInput = Omit<PayoutExecution, 'id' | 'status' | 'externalReferenceId' | 'proofOfPaymentUrl' | 'providerResponseCode' | 'providerResponseMessage' | 'executedAt' | 'createdAt' | 'updatedAt'>;
