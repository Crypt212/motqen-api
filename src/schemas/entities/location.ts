import { z } from 'src/libs/zod.js';
import { UUIDSchema, createFilterMetadata } from "../common.js";
import { LatitudeSchema, LongitudeSchema } from '../common.js';
import { CityViewSchema, GovernmentViewSchema } from './government.js';

export const LocationMainCreateSchema = z.object({
  address: z.string().trim().min(1, 'address is required'),
  governmentId: UUIDSchema,
  cityId: UUIDSchema,
  addressNotes: z.string().trim().optional(),
  long: LongitudeSchema,
  lat: LatitudeSchema,
});

export const LocationCreateSchema = LocationMainCreateSchema.extend({ isMain: z.boolean() });
export const LocationUpdateSchema = LocationCreateSchema.partial();

export const LocationViewSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  address: z.string().trim().min(1, 'address is required'),
  government: GovernmentViewSchema,
  city: CityViewSchema,
  isMain: z.boolean(),
  addressNotes: z.string().trim().optional(),
  long: LongitudeSchema,
  lat: LatitudeSchema,

  isHidden: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LocationFilterSchema = createFilterMetadata(
  {
    id: UUIDSchema,
    userId: UUIDSchema,
    isMain: z.coerce.boolean(),
    isHidden: z.coerce.boolean(),
  },
  {
    sortableFields: ['id', 'userId', 'isMain', 'isHidden'],
  }
);
