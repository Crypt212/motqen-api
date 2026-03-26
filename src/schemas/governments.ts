import { z } from '../libs/zod.js';
import { buildFilterSchema, UUIDSchema } from './common.js';
import { NameSchema, LongitudeSchema, LatitudeSchema, createQuerySchema } from './common.js';
import { CityFilterDescriptor, GovernmentFilterDescriptor } from 'src/domain/government.entity.js';

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

export const GovernmentFilterSchema = buildFilterSchema(GovernmentFilterDescriptor);

export const GovernmentQuerySchema = createQuerySchema(GovernmentFilterSchema);
export type GovernmentQuery = z.infer<typeof GovernmentQuerySchema>;

export const CityFilterSchema = buildFilterSchema(CityFilterDescriptor);

export const CityQuerySchema = createQuerySchema(CityFilterSchema);
export type CityQuery = z.infer<typeof CityQuerySchema>;
