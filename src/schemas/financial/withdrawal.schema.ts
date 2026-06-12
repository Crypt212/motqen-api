import { z } from 'zod';
import { PayoutMethodType as PrismaPayoutMethodType, WithdrawRequestStatus as PrismaWithdrawRequestStatus } from '../../generated/prisma/client.js';
import type { PayoutMethodType, WithdrawRequestStatus } from '../../domain/financial/withdrawal.entity.js';

export const payoutMethodSchema = z.object({
  methodType: z.enum(Object.values(PrismaPayoutMethodType) as [string, ...string[]]),
  accountName: z.string().min(2),
  accountNumber: z.string().min(1),
  bankName: z.string().optional(),
});

// All fields optional for updates
export const updatePayoutMethodSchema = payoutMethodSchema.partial();

export const withdrawRequestSchema = z.object({
  amount: z.number().int().positive(),
  payout_method_id: z.string().uuid(),
  idempotency_key: z.string(),
});

export const workerEarningsBalanceSchema = z.object({
  total_earned: z.string(),
  withdrawn: z.string(),
  pending_withdraw: z.string(),
  on_hold_for_dispute: z.string(),
  available_to_withdraw: z.string(),
});

export const payoutMethodResponseSchema = z.object({
  id: z.string().uuid(),
  workerProfileId: z.string().uuid(),
  methodType: z.enum(Object.values(PrismaPayoutMethodType) as [string, ...string[]]),
  accountName: z.string(),
  accountNumber: z.string(),
  bankName: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const payoutMethodListResponseSchema = z.array(payoutMethodResponseSchema);

export const withdrawRequestResponseSchema = z.object({
  id: z.string().uuid(),
  workerProfileId: z.string().uuid(),
  workerBalanceId: z.string().uuid(),
  payoutMethodId: z.string().uuid(),
  amount: z.string(),
  status: z.enum(Object.values(PrismaWithdrawRequestStatus) as [string, ...string[]]),
  payoutMethodSnapshot: z.record(z.string(), z.any()),
  idempotencyKey: z.string(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const withdrawRequestListResponseSchema = z.array(withdrawRequestResponseSchema);

export type PayoutMethodInput = z.infer<typeof payoutMethodSchema>;
export type UpdatePayoutMethodInput = z.infer<typeof updatePayoutMethodSchema>;
export type WithdrawRequestInput = z.infer<typeof withdrawRequestSchema>;

export interface ListWithdrawRequestsFilter {
  workerProfileId?: string;
  status?: WithdrawRequestStatus;
  payoutMethodType?: PayoutMethodType;
  createdFrom?: Date;
  createdTo?: Date;
  workerName?: string;
  phoneNumber?: string;
}

export interface ListWithdrawRequestsOptions {
  filter: ListWithdrawRequestsFilter;
  cursor?: string; // last seen ID
  limit?: number;  // default 20
  sort?: {
    sortBy: 'createdAt' | 'amount';
    sortOrder: 'asc' | 'desc';
  };
}

export interface CursorPaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
}

export const idParamsSchema = z.object({ id: z.string().uuid() });
export const rejectWithdrawRequestBodySchema = z.object({ notes: z.string().optional() });
export const completePayoutBodySchema = z.object({
  proof_of_payment_url: z.string().url(),
  external_reference_id: z.string().min(1),
});
export const failPayoutBodySchema = z.object({ reason: z.string().optional() });
export const listDebtsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const listWithdrawRequestsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  cursor: z.string().uuid().optional(),
  sortBy: z.enum(['amount', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.enum(Object.values(PrismaWithdrawRequestStatus) as [string, ...string[]]).optional(),
  payoutMethodType: z.enum(Object.values(PrismaPayoutMethodType) as [string, ...string[]]).optional(),
  workerProfileId: z.string().uuid().optional(),
});
