import { z } from '../../libs/zod.js';
import { UUIDSchema, EmptySchema } from '../common.js';
import { NameSchema, LongitudeSchema, LatitudeSchema, createQuerySchema } from '../common.js';
import { GovernmentFilterSchema, CityFilterSchema } from '../entities/government.js';

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

export const GovernmentQuerySchema = createQuerySchema(GovernmentFilterSchema);
export type GovernmentQuery = z.infer<typeof GovernmentQuerySchema>;

export const CityQuerySchema = createQuerySchema(CityFilterSchema);
export type CityQuery = z.infer<typeof CityQuerySchema>;

// 1. GetGovernments
export const GetGovernmentsRequestSchema = EmptySchema;
export type GetGovernmentsRequestDTO = z.infer<typeof GetGovernmentsRequestSchema>;
export const GetGovernmentsQuerySchema = GovernmentQuerySchema;
export type GetGovernmentsQueryDTO = z.infer<typeof GetGovernmentsQuerySchema>;
export const GetGovernmentsParamsSchema = EmptySchema;
export type GetGovernmentsParamsDTO = z.infer<typeof GetGovernmentsParamsSchema>;

// 2. GetGovernmentById
export const GetGovernmentByIdRequestSchema = EmptySchema;
export type GetGovernmentByIdRequestDTO = z.infer<typeof GetGovernmentByIdRequestSchema>;
export const GetGovernmentByIdQuerySchema = EmptySchema;
export type GetGovernmentByIdQueryDTO = z.infer<typeof GetGovernmentByIdQuerySchema>;
export const GetGovernmentByIdParamsSchema = GovernmentIdParamsSchema;
export type GetGovernmentByIdParamsDTO = z.infer<typeof GetGovernmentByIdParamsSchema>;

// 3. CreateGovernment
export const CreateGovernmentRequestSchema = CreateGovernmentSchema;
export type CreateGovernmentRequestDTO = z.infer<typeof CreateGovernmentRequestSchema>;
export const CreateGovernmentQuerySchema = EmptySchema;
export type CreateGovernmentQueryDTO = z.infer<typeof CreateGovernmentQuerySchema>;
export const CreateGovernmentParamsSchema = EmptySchema;
export type CreateGovernmentParamsDTO = z.infer<typeof CreateGovernmentParamsSchema>;

// 4. UpdateGovernment
export const UpdateGovernmentRequestSchema = UpdateGovernmentSchema;
export type UpdateGovernmentRequestDTO = z.infer<typeof UpdateGovernmentRequestSchema>;
export const UpdateGovernmentQuerySchema = EmptySchema;
export type UpdateGovernmentQueryDTO = z.infer<typeof UpdateGovernmentQuerySchema>;
export const UpdateGovernmentParamsSchema = GovernmentIdParamsSchema;
export type UpdateGovernmentParamsDTO = z.infer<typeof UpdateGovernmentParamsSchema>;

// 5. DeleteGovernment
export const DeleteGovernmentRequestSchema = EmptySchema;
export type DeleteGovernmentRequestDTO = z.infer<typeof DeleteGovernmentRequestSchema>;
export const DeleteGovernmentQuerySchema = EmptySchema;
export type DeleteGovernmentQueryDTO = z.infer<typeof DeleteGovernmentQuerySchema>;
export const DeleteGovernmentParamsSchema = GovernmentIdParamsSchema;
export type DeleteGovernmentParamsDTO = z.infer<typeof DeleteGovernmentParamsSchema>;

// 6. GetCitiesByGovernment
export const GetCitiesByGovernmentRequestSchema = EmptySchema;
export type GetCitiesByGovernmentRequestDTO = z.infer<typeof GetCitiesByGovernmentRequestSchema>;
export const GetCitiesByGovernmentQuerySchema = CityQuerySchema;
export type GetCitiesByGovernmentQueryDTO = z.infer<typeof GetCitiesByGovernmentQuerySchema>;
export const GetCitiesByGovernmentParamsSchema = GovernmentIdParamsSchema;
export type GetCitiesByGovernmentParamsDTO = z.infer<typeof GetCitiesByGovernmentParamsSchema>;

// 7. GetCityById
export const GetCityByIdRequestSchema = EmptySchema;
export type GetCityByIdRequestDTO = z.infer<typeof GetCityByIdRequestSchema>;
export const GetCityByIdQuerySchema = EmptySchema;
export type GetCityByIdQueryDTO = z.infer<typeof GetCityByIdQuerySchema>;
export const GetCityByIdParamsSchema = CityIdParamsSchema;
export type GetCityByIdParamsDTO = z.infer<typeof GetCityByIdParamsSchema>;

// 8. CreateCity
export const CreateCityRequestSchema = CreateCitySchema.omit({ governmentId: true });
export type CreateCityRequestDTO = z.infer<typeof CreateCityRequestSchema>;
export const CreateCityQuerySchema = EmptySchema;
export type CreateCityQueryDTO = z.infer<typeof CreateCityQuerySchema>;
export const CreateCityParamsSchema = GovernmentIdParamsSchema;
export type CreateCityParamsDTO = z.infer<typeof CreateCityParamsSchema>;

// 9. UpdateCity
export const UpdateCityRequestSchema = UpdateCitySchema.omit({ governmentId: true });
export type UpdateCityRequestDTO = z.infer<typeof UpdateCityRequestSchema>;
export const UpdateCityQuerySchema = EmptySchema;
export type UpdateCityQueryDTO = z.infer<typeof UpdateCityQuerySchema>;
export const UpdateCityParamsSchema = CityIdParamsSchema;
export type UpdateCityParamsDTO = z.infer<typeof UpdateCityParamsSchema>;

// 10. DeleteCity
export const DeleteCityRequestSchema = EmptySchema;
export type DeleteCityRequestDTO = z.infer<typeof DeleteCityRequestSchema>;
export const DeleteCityQuerySchema = EmptySchema;
export type DeleteCityQueryDTO = z.infer<typeof DeleteCityQuerySchema>;
export const DeleteCityParamsSchema = CityIdParamsSchema;
export type DeleteCityParamsDTO = z.infer<typeof DeleteCityParamsSchema>;
