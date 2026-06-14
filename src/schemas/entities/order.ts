import { z } from 'src/libs/zod.js';
import { UUIDSchema, createFilterMetadata } from '../common.js';
import { SubSpecializationViewSchema } from './specialization.js';

export const OrderObjectViewSchema = z.object({
  id: UUIDSchema,
  title: z.string(),
  description: z.string(),
  clientUserId: UUIDSchema,
  workerUserId: UUIDSchema.nullable(),
  locationId: UUIDSchema,
  subSpecialization: SubSpecializationViewSchema,
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

export const OrderObjectCreateSchema = z.object({
  title: z.string(),
  description: z.string(),
  clientUserId: UUIDSchema,
  workerUserId: UUIDSchema.optional(),
  locationId: UUIDSchema,
  subSpecialization: SubSpecializationViewSchema,
  initialPrice: z.number(),
  startDate: z.coerce.date(),
  estimatedDurationHours: z.number(),
  isUrgent: z.boolean(),
  images: z.array(z.string()),
  orderMode: z.enum(['DIRECT', 'GLOBAL']),
});

export const OrderFilterSchema = createFilterMetadata(
  {
    id: UUIDSchema,
    clientUserId: UUIDSchema,
    workerUserId: UUIDSchema,
    rate: z.coerce.number(),
    orderStatus: z.enum(['PENDING', 'PRICE_AGREED', 'PAID', 'COMPLETED', 'CANCELLED']),
    orderMode: z.enum(['DIRECT', 'GLOBAL']),
    isUrgent: z.coerce.boolean(),
    createdAt: z.coerce.date(),
  },
  {
    sortableFields: ['createdAt'],
  }
);

