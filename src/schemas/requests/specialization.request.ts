import { z } from '../../libs/zod.js';
import { UUIDSchema, createQuerySchema, NameSchema } from '../common.js';
import { SpecializationFilterSchema, SubSpecializationFilterSchema } from '../entities/specialization.js';

const CATEGORIES = [
  'ELECTRICITY',
  'PLUMBING',
  'AC',
  'CARPENTRY',
  'GENERALMAINTENANCE',
  'PAINTING',
  'CONSTRUCTION',
  'CLEANING',
  'INSTALLATION',
  'FURNITURETRANSPORT',
  'DRILLING',
  'ELECTRICALAPPLIANCES',
  'DEFAULTCATEGORY',
] as const;

export const CategorySchema = z.enum(CATEGORIES, {
  message: `category must be one of: ${CATEGORIES.join(', ')}`,
});

// ============================================
// Specialization schemas
// ============================================

export const CreateSpecializationSchema = z.object({
  name: NameSchema('name'),
  nameAr: NameSchema('nameAr'),
  category: CategorySchema,
});
export type CreateSpecializationDTO = z.infer<typeof CreateSpecializationSchema>;

export const UpdateSpecializationSchema = CreateSpecializationSchema.partial();
export type UpdateSpecializationDTO = z.infer<typeof UpdateSpecializationSchema>;

export const SpecializationIdParamsSchema = z.object({ specializationId: UUIDSchema });
export const SubSpecializationIdParamsSchema = z.object({ subSpecializationId: UUIDSchema });

// ============================================
// Sub-specialization schemas
// ============================================

export const CreateSubSpecializationSchema = z.object({
  name: NameSchema('name'),
  nameAr: NameSchema('nameAr'),
});
export type CreateSubSpecializationDTO = z.infer<typeof CreateSubSpecializationSchema>;

export const UpdateSubSpecializationSchema = CreateSubSpecializationSchema.partial();
export type UpdateSubSpecializationDTO = z.infer<typeof UpdateSubSpecializationSchema>;

// ============================================
// Query schemas
// ============================================

export const SpecializationQuerySchema = createQuerySchema(SpecializationFilterSchema);
export type SpecializationQuery = z.infer<typeof SpecializationQuerySchema>;

export const SubSpecializationQuerySchema = createQuerySchema(SubSpecializationFilterSchema);
export type SubSpecializationQuery = z.infer<typeof SubSpecializationQuerySchema>;

import { EmptySchema } from '../common.js';

export const GetSpecializationsRequestSchema = EmptySchema;
export type GetSpecializationsRequestDTO = z.infer<typeof GetSpecializationsRequestSchema>;
export const GetSpecializationsQuerySchema = SpecializationQuerySchema;
export type GetSpecializationsQueryDTO = z.infer<typeof GetSpecializationsQuerySchema>;
export const GetSpecializationsParamsSchema = EmptySchema;
export type GetSpecializationsParamsDTO = z.infer<typeof GetSpecializationsParamsSchema>;

export const GetSpecializationByIdRequestSchema = EmptySchema;
export type GetSpecializationByIdRequestDTO = z.infer<typeof GetSpecializationByIdRequestSchema>;
export const GetSpecializationByIdQuerySchema = EmptySchema;
export type GetSpecializationByIdQueryDTO = z.infer<typeof GetSpecializationByIdQuerySchema>;
export const GetSpecializationByIdParamsSchema = SpecializationIdParamsSchema;
export type GetSpecializationByIdParamsDTO = z.infer<typeof GetSpecializationByIdParamsSchema>;

export const GetSubSpecializationsRequestSchema = EmptySchema;
export type GetSubSpecializationsRequestDTO = z.infer<typeof GetSubSpecializationsRequestSchema>;
export const GetSubSpecializationsQuerySchema = SubSpecializationQuerySchema;
export type GetSubSpecializationsQueryDTO = z.infer<typeof GetSubSpecializationsQuerySchema>;
export const GetSubSpecializationsParamsSchema = SpecializationIdParamsSchema;
export type GetSubSpecializationsParamsDTO = z.infer<typeof GetSubSpecializationsParamsSchema>;

export const CreateSpecializationRequestSchema = CreateSpecializationSchema;
export type CreateSpecializationRequestDTO = z.infer<typeof CreateSpecializationRequestSchema>;
export const CreateSpecializationQuerySchema = EmptySchema;
export type CreateSpecializationQueryDTO = z.infer<typeof CreateSpecializationQuerySchema>;
export const CreateSpecializationParamsSchema = EmptySchema;
export type CreateSpecializationParamsDTO = z.infer<typeof CreateSpecializationParamsSchema>;

export const UpdateSpecializationRequestSchema = UpdateSpecializationSchema;
export type UpdateSpecializationRequestDTO = z.infer<typeof UpdateSpecializationRequestSchema>;
export const UpdateSpecializationQuerySchema = EmptySchema;
export type UpdateSpecializationQueryDTO = z.infer<typeof UpdateSpecializationQuerySchema>;
export const UpdateSpecializationParamsSchema = SpecializationIdParamsSchema;
export type UpdateSpecializationParamsDTO = z.infer<typeof UpdateSpecializationParamsSchema>;

export const DeleteSpecializationRequestSchema = EmptySchema;
export type DeleteSpecializationRequestDTO = z.infer<typeof DeleteSpecializationRequestSchema>;
export const DeleteSpecializationQuerySchema = EmptySchema;
export type DeleteSpecializationQueryDTO = z.infer<typeof DeleteSpecializationQuerySchema>;
export const DeleteSpecializationParamsSchema = SpecializationIdParamsSchema;
export type DeleteSpecializationParamsDTO = z.infer<typeof DeleteSpecializationParamsSchema>;

export const CreateSubSpecializationRequestSchema = CreateSubSpecializationSchema;
export type CreateSubSpecializationRequestDTO = z.infer<typeof CreateSubSpecializationRequestSchema>;
export const CreateSubSpecializationQuerySchema = EmptySchema;
export type CreateSubSpecializationQueryDTO = z.infer<typeof CreateSubSpecializationQuerySchema>;
export const CreateSubSpecializationParamsSchema = SpecializationIdParamsSchema;
export type CreateSubSpecializationParamsDTO = z.infer<typeof CreateSubSpecializationParamsSchema>;

export const DeleteSubSpecializationRequestSchema = EmptySchema;
export type DeleteSubSpecializationRequestDTO = z.infer<typeof DeleteSubSpecializationRequestSchema>;
export const DeleteSubSpecializationQuerySchema = EmptySchema;
export type DeleteSubSpecializationQueryDTO = z.infer<typeof DeleteSubSpecializationQuerySchema>;
export const DeleteSubSpecializationParamsSchema = SpecializationIdParamsSchema.merge(SubSpecializationIdParamsSchema);
export type DeleteSubSpecializationParamsDTO = z.infer<typeof DeleteSubSpecializationParamsSchema>;
