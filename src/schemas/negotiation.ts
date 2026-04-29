import { z } from '../libs/zod.js';
import { UUIDSchema } from './common.js';

export const CreateNegotiationSchema = z.object({
  orderId: UUIDSchema,
  price: z.number().positive(),
  direction: z.enum(['WORKER_TO_CLIENT', 'CLIENT_TO_WORKER']),
  note: z.string().trim().max(500).optional(),
});

export type CreateNegotiationDTO = z.infer<typeof CreateNegotiationSchema>;

export const NegotiationIdParamsSchema = z.object({
  negotiationId: UUIDSchema,
});

export const OrderIdForNegotiationParamsSchema = z.object({
  orderId: UUIDSchema,
});
