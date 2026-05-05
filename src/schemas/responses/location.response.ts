import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";


export const LocationObjectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  address: z.string(),
  addressNotes: z.string().nullable().optional(),
  governmentId: z.string().uuid(),
  cityId: z.string().uuid(),
  long: z.number(),
  lat: z.number(),
  isMain: z.boolean(),
  isHidden: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const LocationListResponseSchema = SuccessResponseSchema(z.object({
    locations: z.array(LocationObjectSchema),
    meta: PaginationMetaSchema.optional(),
  }),);

export const LocationResponseSchema = SuccessResponseSchema(z.object({
    location: LocationObjectSchema,
  }),);
