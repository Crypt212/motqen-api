import { z } from '../libs/zod.js';
import { buildFilterSchema, UUIDSchema } from './common.js';
import { NameSchema, createQuerySchema } from './common.js';
import {
  SpecializationFilterDescriptor,
  SubSpecializationFilterDescriptor,
} from 'src/domain/specialization.entity.js';

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

export const SpecializationFilterSchema = buildFilterSchema(SpecializationFilterDescriptor);
export const SpecializationQuerySchema = createQuerySchema(SpecializationFilterSchema);
export type SpecializationQuery = z.infer<typeof SpecializationQuerySchema>;

export const SubSpecializationFilterSchema = buildFilterSchema(SubSpecializationFilterDescriptor);
export const SubSpecializationQuerySchema = createQuerySchema(SubSpecializationFilterSchema);
export type SubSpecializationQuery = z.infer<typeof SubSpecializationQuerySchema>;
