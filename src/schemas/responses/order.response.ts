import { z } from '../../libs/zod.js';

import { SuccessResponseSchema } from "../responses.js";
import { UUIDSchema } from '../common.js';

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
  workerUserId: UUIDSchema.nullable().optional(),
  locationId: UUIDSchema,
  subSpecialization: z.object({
    id: UUIDSchema,
    nameAr: z.string(),
    nameEn: z.string(),
    specializationId: UUIDSchema,
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
  orderStatus: z.enum(['PENDING', 'OPEN', 'WORKER_SELECTED', 'TIME_SPECIFIED', 'PRICE_AGREED', 'PAID', 'COMPLETED', 'CANCELLED']),
  workStatus: z.enum(['PENDING', 'WAITING_FOR_WORK', 'STARTED', 'DONE']),
  finalPrice: z.number().nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  isUrgent: z.boolean(),
  rate: z.number().nullable().optional(),
  comment: z.string().nullable().optional(),
  workStartedAt: z.coerce.date().nullable().optional(),
  workFinishedAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  orderMode: z.enum(['DIRECT', 'GLOBAL']),
  clientSummary: ClientSummarySchema.optional().nullable(),
  images: z.array(z.string()).optional(),
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
