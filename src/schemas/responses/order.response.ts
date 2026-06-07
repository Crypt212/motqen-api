import { z } from '../../libs/zod.js';

import { SuccessResponseSchema } from "../responses.js";
import { UUIDSchema } from '../common.js';
import { SubSpecializationObjectSchema } from './specialization.response.js';

export const ClientSummarySchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  firstName: z.string(),
  lastName: z.string(),
  profileImageUrl: z.string().nullable().optional(),
  rating: z.number().optional().nullable(),
});

export const OrderObjectSchema = z.object({
  id: UUIDSchema,
  title: z.string(),
  description: z.string(),
  clientUserId: UUIDSchema,
  workerUserId: UUIDSchema.nullable(),
  locationId: UUIDSchema,
  subSpecialization: SubSpecializationObjectSchema,
  orderStatus: z.enum(['PENDING', 'WORKER_SELECTED', 'TIME_SPECIFIED', 'PRICE_AGREED', 'PAID', 'COMPLETED', 'CANCELLED']),
  workStatus: z.enum(['PENDING', 'WAITING_FOR_WORK', 'STARTED', 'DONE']),
  initialPrice: z.number().nullable(),
  finalPrice: z.number().nullable(),
  startDate: z.coerce.date().nullable(),
  estimatedDurationHours: z.number().nullable(),
  isUrgent: z.boolean(),
  rate: z.number().nullable(),
  comment: z.string().nullable(),
  workStartedAt: z.coerce.date().nullable(),
  workFinishedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  images: z.array(z.string()),
  orderMode: z.enum(['DIRECT', 'GLOBAL']),

});

export const OrderListResponseSchema = SuccessResponseSchema(z.object({
    orders: z.array(OrderObjectSchema),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  }),);

export const OrderResponseSchema = SuccessResponseSchema(OrderObjectSchema,);
