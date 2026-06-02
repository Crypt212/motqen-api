import { z } from 'zod';

export const listEscrowHoldsQuerySchema = z.object({
  status: z.string().optional(),
  orderId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const escrowHoldIdParamsSchema = z.object({
  id: z.string().uuid(),
});
