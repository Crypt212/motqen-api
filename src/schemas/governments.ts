import { z } from 'zod';
import { UUIDSchema } from './common.js';
import { NameSchema, LongitudeSchema, LatitudeSchema, createQuerySchema } from './common.js';

// ============================================
// Query configs
// ============================================

export const GOVERNMENT_QUERY_CONFIG = {
  allowedFilterFields: ['id', 'name', 'nameAr'],
  filterFieldTypes: {
    id: { type: 'uuid' as const },
    name: { type: 'string' as const, minLength: 2, maxLength: 100 },
    nameAr: { type: 'string' as const, minLength: 2, maxLength: 100 },
  },
  allowedOrderByFields: ['createdAt', 'id', 'name', 'nameAr'],
  allowedSearchFields: ['id', 'name', 'nameAr'],
};

export const CITY_QUERY_CONFIG = {
  allowedFilterFields: ['id', 'governmentId', 'name', 'nameAr'],
  filterFieldTypes: {
    id: { type: 'uuid' as const },
    name: { type: 'string' as const, minLength: 2, maxLength: 100 },
    nameAr: { type: 'string' as const, minLength: 2, maxLength: 100 },
    governmentId: { type: 'uuid' as const },
  },
  allowedOrderByFields: ['createdAt', 'governmentId', 'id', 'name', 'nameAr'],
  allowedSearchFields: ['id', 'governmentId', 'name', 'nameAr'],
};

// ============================================
// Government schemas
// ============================================

export const CreateGovernmentSchema = z.object({
  name: NameSchema('name'),
  nameAr: NameSchema('nameAr'),
  long: LongitudeSchema,
  lat: LatitudeSchema,
});
export type CreateGovernmentDTO = z.infer<typeof CreateGovernmentSchema>;

export const UpdateGovernmentSchema = CreateGovernmentSchema.partial();
export type UpdateGovernmentDTO = z.infer<typeof UpdateGovernmentSchema>;

export const GovernmentIdParamsSchema = z.object({ governmentId: UUIDSchema });

// ============================================
// City schemas
// ============================================

export const CreateCitySchema = z.object({
  name: NameSchema('name'),
  nameAr: NameSchema('nameAr'),
  long: LongitudeSchema,
  lat: LatitudeSchema,
  governmentId: UUIDSchema,
});
export type CreateCityDTO = z.infer<typeof CreateCitySchema>;

export const UpdateCitySchema = CreateCitySchema.partial();
export type UpdateCityDTO = z.infer<typeof UpdateCitySchema>;

export const CityIdParamsSchema = z.object({ cityId: UUIDSchema });

// ============================================
// Query schemas
// ============================================

export const GovernmentQuerySchema = createQuerySchema(GOVERNMENT_QUERY_CONFIG);
export type GovernmentQuery = z.infer<typeof GovernmentQuerySchema>;

export const CityQuerySchema = createQuerySchema(CITY_QUERY_CONFIG);
export type CityQuery = z.infer<typeof CityQuerySchema>;


