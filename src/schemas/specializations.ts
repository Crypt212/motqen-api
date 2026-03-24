import { z } from 'zod';
import { UUIDSchema } from './common.js';
import { NameSchema, createQuerySchema } from './common.js';

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

export const CategorySchema = z.enum(CATEGORIES, { message: `category must be one of: ${CATEGORIES.join(', ')}` });


const SPECIALIZATION_QUERY_CONFIG = {
  allowedFilterFields: ['name', 'nameAr', 'category'],
  filterFieldTypes: {
    name: { type: 'string' as const, minLength: 2, maxLength: 100 },
    nameAr: { type: 'string' as const, minLength: 2, maxLength: 100 },
    category: { type: 'enum' as const, enumValues: [...CATEGORIES] as [string, ...string[]] },
  },
  allowedOrderByFields: ['name', 'nameAr', 'category', 'createdAt', 'updatedAt'],
  allowedSearchFields: ['name', 'nameAr', 'category'],
};

const SUB_SPECIALIZATION_QUERY_CONFIG = {
  allowedFilterFields: ['name', 'nameAr', 'mainSpecializationId'],
  filterFieldTypes: {
    name: { type: 'string' as const, minLength: 2, maxLength: 100 },
    nameAr: { type: 'string' as const, minLength: 2, maxLength: 100 },
    mainSpecializationId: { type: 'uuid' as const },
  },
  allowedOrderByFields: ['name', 'nameAr', 'createdAt', 'updatedAt'],
  allowedSearchFields: ['name', 'nameAr'],
};

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

export const SpecializationQuerySchema = createQuerySchema(SPECIALIZATION_QUERY_CONFIG);
export type SpecializationQuery = z.infer<typeof SpecializationQuerySchema>;

export const SubSpecializationQuerySchema = createQuerySchema(SUB_SPECIALIZATION_QUERY_CONFIG);
export type SubSpecializationQuery = z.infer<typeof SubSpecializationQuerySchema>;
