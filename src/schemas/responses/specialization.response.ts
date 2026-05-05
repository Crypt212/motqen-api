import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";


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

export const SpecializationListResponseSchema = SuccessResponseSchema(z.object({
    specializations: z.array(SpecializationObjectSchema),
    meta: PaginationMetaSchema,
  }),);

export const SpecializationResponseSchema = SuccessResponseSchema(z.object({
    specialization: SpecializationObjectSchema,
  }),);

export const SubSpecializationListResponseSchema = SuccessResponseSchema(z.object({
    subSpecializations: z.array(SubSpecializationObjectSchema),
    meta: PaginationMetaSchema,
  }),);

export const SubSpecializationResponseSchema = SuccessResponseSchema(z.object({
    subSpecialization: SubSpecializationObjectSchema,
  }),);

export const DeleteResponseSchema = SuccessResponseSchema(z.null(),);
