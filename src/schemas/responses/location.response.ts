import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";
import { UUIDSchema } from '../common.js';
import { CityObjectSchema, GovernmentObjectSchema } from './government.response.js';


export const LocationObjectSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  address: z.string(),
  addressNotes: z.string().nullable().optional(),
  government: GovernmentObjectSchema,
  city: CityObjectSchema,
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
export type LocationListResponseDTO = z.infer<typeof LocationListResponseSchema>;

export const LocationResponseSchema = SuccessResponseSchema(z.object({
    location: LocationObjectSchema,
  }),);
export type LocationResponseDTO = z.infer<typeof LocationResponseSchema>;
