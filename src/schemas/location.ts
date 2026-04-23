import { z } from '../libs/zod.js';
import {
  UUIDSchema,
  LatitudeSchema,
  LongitudeSchema,
  buildFilterSchema,
  createQuerySchema,
} from './common.js';
import { LocationFilterDescriptor } from '../domain/location.entity.js';

export const CreateLocationSchema = z.object({
  address: z.string().trim().min(1),
  addressNotes: z.string().trim().optional(),
  governmentId: UUIDSchema,
  cityId: UUIDSchema,
  lat: LatitudeSchema,
  long: LongitudeSchema,
  isHidden: z.boolean(),
  isMain: z.boolean(),
});

export type CreateLocationDTO = z.infer<typeof CreateLocationSchema>;

export const UpdateLocationSchema = CreateLocationSchema.partial();

export type UpdateLocationDTO = z.infer<typeof UpdateLocationSchema>;

export const LocationIdParamsSchema = z.object({
  locationId: UUIDSchema,
});

export const LocationFilterSchema = buildFilterSchema(LocationFilterDescriptor);

export const LocationQuerySchema = createQuerySchema(LocationFilterSchema);

export type LocationQuery = z.infer<typeof LocationQuerySchema>;
