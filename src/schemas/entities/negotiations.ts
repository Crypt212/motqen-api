import { z } from 'src/libs/zod.js';
import { UUIDSchema } from '../common.js';

export const NegotiationViewSchema = z.object({
  id: UUIDSchema,
  orderId: UUIDSchema,
  proposalId: UUIDSchema,
  price: z.number(),
  direction: z.enum(['WORKER_TO_CLIENT', 'CLIENT_TO_WORKER']),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED']),
  note: z.string().nullable(),
  startDate: z.date(),
  estimatedDurationHours: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const NegotiationWithOverlapWarningViewSchema = NegotiationViewSchema.extend({
  hasOverlapWarning: z.boolean().optional(),
});

export const LatestNegotiationSnapshotSchema = z.object({
  id: UUIDSchema,
  price: z.number(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
  startDate: z.date(),
  estimatedDurationHours: z.number(),
  direction: z.enum(['WORKER_TO_CLIENT', 'CLIENT_TO_WORKER']),
  createdAt: z.date(),
});

