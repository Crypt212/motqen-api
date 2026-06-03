import { z } from 'zod';
import { UUIDSchema } from '../common.js';

import { SuccessResponseSchema } from "../responses.js";


export const NegotiationObjectSchema = z.object({
  id: UUIDSchema,
  orderId: UUIDSchema,
  proposalId: UUIDSchema,
  price: z.number(),
  direction: z.enum(['WORKER_TO_CLIENT', 'CLIENT_TO_WORKER']),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']),
  note: z.string().nullable(),
  startDate: z.date(),
  estimatedDurationHours: z.number(),
  hasOverlapWarning: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const NegotiationListResponseSchema = SuccessResponseSchema(z.array(NegotiationObjectSchema),);

export const NegotiationResponseSchema = SuccessResponseSchema(NegotiationObjectSchema,);

export const NegotiationOrderResponseSchema = SuccessResponseSchema(z.object({
    id: UUIDSchema,
    clientProfileId: UUIDSchema,
    workerProfileId: UUIDSchema,
    orderStatus: z.string(),
  }),);
