import { z } from 'zod';
import { RefundReasonCode } from '../../generated/prisma/client.js';

export const initiateRefundSchema = z.object({
  reason_code: z.nativeEnum(RefundReasonCode),
  idempotency_key: z.string().uuid(),
  notes: z.string().optional(),
});

export type RefundInput = z.infer<typeof initiateRefundSchema>;
