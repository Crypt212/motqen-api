import { z } from 'zod';
import { PayoutMethodType } from '../../generated/prisma/client.js';

export const payoutMethodSchema = z.object({
  method_type: z.nativeEnum(PayoutMethodType),
  account_name: z.string().min(2),
  account_number: z.string().min(1),
  bank_name: z.string().optional(),
});

export const withdrawRequestSchema = z.object({
  amount: z.number().int().positive(),
  payout_method_id: z.string().uuid(),
  idempotency_key: z.string().uuid(),
});

export type PayoutMethodInput = z.infer<typeof payoutMethodSchema>;
export type WithdrawRequestInput = z.infer<typeof withdrawRequestSchema>;
