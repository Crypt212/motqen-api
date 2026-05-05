import { z } from 'zod';

const BaseSuccessResponse = z.object({
  status: z.literal('success'),
  message: z.string(),
});

export const GovernmentObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  nameAr: z.string(),
  long: z.number().nullable().optional(),
  lat: z.number().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CityObjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  nameAr: z.string(),
  governmentId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const GovernmentListResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    governments: z.array(GovernmentObjectSchema),
    meta: PaginationMetaSchema.optional(),
  }),
});

export const GovernmentResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    government: GovernmentObjectSchema,
  }),
});

export const CityListResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    cities: z.array(CityObjectSchema),
    meta: PaginationMetaSchema.optional(),
  }),
});

export const DeleteGovernmentResponseSchema = BaseSuccessResponse.extend({
  data: z.null(),
});
