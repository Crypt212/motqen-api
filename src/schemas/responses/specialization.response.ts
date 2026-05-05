import { z } from 'zod';

const BaseSuccessResponse = z.object({
  status: z.literal('success'),
  message: z.string(),
});

const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const SpecializationObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  nameAr: z.string(),
  category: z.string(),
  ordersCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SubSpecializationObjectSchema = z.object({
  id: z.string().uuid(),
  mainSpecializationId: z.string().uuid(),
  name: z.string(),
  nameAr: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SpecializationListResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    specializations: z.array(SpecializationObjectSchema),
    meta: PaginationMetaSchema,
  }),
});

export const SpecializationResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    specialization: SpecializationObjectSchema,
  }),
});

export const SubSpecializationListResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    subSpecializations: z.array(SubSpecializationObjectSchema),
    meta: PaginationMetaSchema,
  }),
});

export const SubSpecializationResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    subSpecialization: SubSpecializationObjectSchema,
  }),
});

export const DeleteResponseSchema = BaseSuccessResponse.extend({
  data: z.null(),
});
