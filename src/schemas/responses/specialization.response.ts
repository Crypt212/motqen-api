import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";
import { PaginationResponseSchema } from '../common.js';
import { SpecializationViewSchema as SpecializationObjectSchema, SubSpecializationViewSchema as SubSpecializationObjectSchema } from '../entities/specialization.js';


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

export const GetSpecializationsResponseSchema = SpecializationListResponseSchema;
export type GetSpecializationsResponseDTO = z.infer<typeof GetSpecializationsResponseSchema>;

export const GetSpecializationByIdResponseSchema = SpecializationResponseSchema;
export type GetSpecializationByIdResponseDTO = z.infer<typeof GetSpecializationByIdResponseSchema>;

export const GetSubSpecializationsResponseSchema = SubSpecializationListResponseSchema;
export type GetSubSpecializationsResponseDTO = z.infer<typeof GetSubSpecializationsResponseSchema>;

export const CreateSpecializationResponseSchema = SpecializationResponseSchema;
export type CreateSpecializationResponseDTO = z.infer<typeof CreateSpecializationResponseSchema>;

export const UpdateSpecializationResponseSchema = SpecializationResponseSchema;
export type UpdateSpecializationResponseDTO = z.infer<typeof UpdateSpecializationResponseSchema>;

export const DeleteSpecializationResponseSchema = DeleteResponseSchema;
export type DeleteSpecializationResponseDTO = z.infer<typeof DeleteSpecializationResponseSchema>;

export const CreateSubSpecializationResponseSchema = SubSpecializationResponseSchema;
export type CreateSubSpecializationResponseDTO = z.infer<typeof CreateSubSpecializationResponseSchema>;

export const DeleteSubSpecializationResponseSchema = DeleteResponseSchema;
export type DeleteSubSpecializationResponseDTO = z.infer<typeof DeleteSubSpecializationResponseSchema>;
