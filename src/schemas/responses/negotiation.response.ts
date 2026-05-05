import { z } from 'zod';
import { UUIDSchema } from '../common.js';

const BaseSuccessResponse = z.object({
  status: z.literal('success'),
  message: z.string(),
});

export const NegotiationObjectSchema = z.object({
  id: UUIDSchema,
  orderId: UUIDSchema,
  price: z.number(),
  direction: z.enum(['WORKER_TO_CLIENT', 'CLIENT_TO_WORKER']),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']),
  note: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const NegotiationListResponseSchema = BaseSuccessResponse.extend({
  data: z.array(NegotiationObjectSchema),
});

export const NegotiationResponseSchema = BaseSuccessResponse.extend({
  data: NegotiationObjectSchema,
});

export const NegotiationOrderResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    id: z.string().uuid(),
    clientProfileId: z.string().uuid(),
    workerProfileId: z.string().uuid(),
    orderStatus: z.string(),
  }),
});
