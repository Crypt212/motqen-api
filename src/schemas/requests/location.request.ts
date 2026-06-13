import { z } from '../../libs/zod.js';
import {
  UUIDSchema,
  LatitudeSchema,
  LongitudeSchema,
  createQuerySchema,
  EmptySchema,
} from '../common.js';
import { LocationFilterSchema } from '../entities/location.js';

export const CreateLocationSchema = z.object({
  address: z.string().trim().min(1),
  addressNotes: z.string().trim().optional(),
  governmentId: UUIDSchema,
  cityId: UUIDSchema,
  lat: LatitudeSchema,
  long: LongitudeSchema,
  isHidden: z.boolean().optional(),
});

export type CreateLocationDTO = z.infer<typeof CreateLocationSchema>;

export const UpdateLocationSchema = CreateLocationSchema.partial();

export type UpdateLocationDTO = z.infer<typeof UpdateLocationSchema>;

export const LocationIdParamsSchema = z.object({
  locationId: UUIDSchema,
});

export const LocationQuerySchema = createQuerySchema(LocationFilterSchema);

export type LocationQuery = z.infer<typeof LocationQuerySchema>;

// 1. GetLocations
export const GetLocationsRequestSchema = EmptySchema;
export type GetLocationsRequestDTO = z.infer<typeof GetLocationsRequestSchema>;
export const GetLocationsQuerySchema = LocationQuerySchema;
export type GetLocationsQueryDTO = z.infer<typeof GetLocationsQuerySchema>;
export const GetLocationsParamsSchema = EmptySchema;
export type GetLocationsParamsDTO = z.infer<typeof GetLocationsParamsSchema>;

// 2. CreateLocation
export const CreateLocationRequestSchema = CreateLocationSchema;
export type CreateLocationRequestDTO = z.infer<typeof CreateLocationRequestSchema>;
export const CreateLocationQuerySchema = EmptySchema;
export type CreateLocationQueryDTO = z.infer<typeof CreateLocationQuerySchema>;
export const CreateLocationParamsSchema = EmptySchema;
export type CreateLocationParamsDTO = z.infer<typeof CreateLocationParamsSchema>;

// 3. GetMainLocation
export const GetMainLocationRequestSchema = EmptySchema;
export type GetMainLocationRequestDTO = z.infer<typeof GetMainLocationRequestSchema>;
export const GetMainLocationQuerySchema = EmptySchema;
export type GetMainLocationQueryDTO = z.infer<typeof GetMainLocationQuerySchema>;
export const GetMainLocationParamsSchema = EmptySchema;
export type GetMainLocationParamsDTO = z.infer<typeof GetMainLocationParamsSchema>;

// 4. UpdateMainLocation
export const UpdateMainLocationRequestSchema = UpdateLocationSchema;
export type UpdateMainLocationRequestDTO = z.infer<typeof UpdateMainLocationRequestSchema>;
export const UpdateMainLocationQuerySchema = EmptySchema;
export type UpdateMainLocationQueryDTO = z.infer<typeof UpdateMainLocationQuerySchema>;
export const UpdateMainLocationParamsSchema = EmptySchema;
export type UpdateMainLocationParamsDTO = z.infer<typeof UpdateMainLocationParamsSchema>;

// 5. UpdateLocation
export const UpdateLocationRequestSchema = UpdateLocationSchema;
export type UpdateLocationRequestDTO = z.infer<typeof UpdateLocationRequestSchema>;
export const UpdateLocationQuerySchema = EmptySchema;
export type UpdateLocationQueryDTO = z.infer<typeof UpdateLocationQuerySchema>;
export const UpdateLocationParamsSchema = LocationIdParamsSchema;
export type UpdateLocationParamsDTO = z.infer<typeof UpdateLocationParamsSchema>;

// 6. SetMainLocation
export const SetMainLocationRequestSchema = EmptySchema;
export type SetMainLocationRequestDTO = z.infer<typeof SetMainLocationRequestSchema>;
export const SetMainLocationQuerySchema = EmptySchema;
export type SetMainLocationQueryDTO = z.infer<typeof SetMainLocationQuerySchema>;
export const SetMainLocationParamsSchema = LocationIdParamsSchema;
export type SetMainLocationParamsDTO = z.infer<typeof SetMainLocationParamsSchema>;

// 7. GetLocationById
export const GetLocationByIdRequestSchema = EmptySchema;
export type GetLocationByIdRequestDTO = z.infer<typeof GetLocationByIdRequestSchema>;
export const GetLocationByIdQuerySchema = EmptySchema;
export type GetLocationByIdQueryDTO = z.infer<typeof GetLocationByIdQuerySchema>;
export const GetLocationByIdParamsSchema = LocationIdParamsSchema;
export type GetLocationByIdParamsDTO = z.infer<typeof GetLocationByIdParamsSchema>;

// 8. DeleteLocation
export const DeleteLocationRequestSchema = EmptySchema;
export type DeleteLocationRequestDTO = z.infer<typeof DeleteLocationRequestSchema>;
export const DeleteLocationQuerySchema = EmptySchema;
export type DeleteLocationQueryDTO = z.infer<typeof DeleteLocationQuerySchema>;
export const DeleteLocationParamsSchema = LocationIdParamsSchema;
export type DeleteLocationParamsDTO = z.infer<typeof DeleteLocationParamsSchema>;
