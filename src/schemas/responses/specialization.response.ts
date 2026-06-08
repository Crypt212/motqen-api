import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";
import { SpecializationObjectSchema, SubSpecializationObjectSchema, PaginationResponseSchema } from '../common.js';


export const SpecializationListResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ specializations: z.array(SpecializationObjectSchema) })
);
export type SpecializationListResponseDTO = z.infer<typeof SpecializationListResponseSchema>;

export const SpecializationResponseSchema = SuccessResponseSchema(z.object({
    specialization: SpecializationObjectSchema,
  }));
export type SpecializationResponseDTO = z.infer<typeof SpecializationResponseSchema>;

export const SubSpecializationListResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ subSpecializations: z.array(SubSpecializationObjectSchema) })
);
export type SubSpecializationListResponseDTO = z.infer<typeof SubSpecializationListResponseSchema>;

export const SubSpecializationResponseSchema = SuccessResponseSchema(z.object({
    subSpecialization: SubSpecializationObjectSchema,
  }));
export type SubSpecializationResponseDTO = z.infer<typeof SubSpecializationResponseSchema>;

export const DeleteResponseSchema = SuccessResponseSchema(z.null());
export type DeleteResponseDTO = z.infer<typeof DeleteResponseSchema>;
