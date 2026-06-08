import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";
import { PaginationResponseSchema, UUIDSchema } from '../common.js';


export const GovernmentObjectSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  nameAr: z.string(),
  long: z.number().nullable().optional(),
  lat: z.number().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CityObjectSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  nameAr: z.string(),
  governmentId: UUIDSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GovernmentListResponseSchema = SuccessResponseSchema(z.object({
    governments: z.array(GovernmentObjectSchema),
    meta: PaginationResponseSchema.optional(),
  }),);
export type GovernmentListResponseDTO = z.infer<typeof GovernmentListResponseSchema>;

export const GovernmentResponseSchema = SuccessResponseSchema(z.object({
    government: GovernmentObjectSchema,
  }),);
export type GovernmentResponseDTO = z.infer<typeof GovernmentResponseSchema>;

export const CityListResponseSchema = SuccessResponseSchema(z.object({
    cities: z.array(CityObjectSchema),
    meta: PaginationResponseSchema.optional(),
  }),);
export type CityListResponseDTO = z.infer<typeof CityListResponseSchema>;

export const DeleteGovernmentResponseSchema = SuccessResponseSchema(z.null(),);
export type DeleteGovernmentResponseDTO = z.infer<typeof DeleteGovernmentResponseSchema>;
