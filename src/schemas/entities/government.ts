import { z } from 'src/libs/zod.js';
import { createFilterMetadata, UUIDSchema } from "../common.js";
import { LatitudeSchema, LongitudeSchema } from '../common.js';

export const GovernmentViewSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  nameAr: z.string(),
  long: LongitudeSchema.optional(),
  lat: LatitudeSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GovernmentFilterSchema = createFilterMetadata(
  {

    id: UUIDSchema,
    name: z.string().min(2, 'name must be at least 2 characters').max(100, 'name must be at most 100 characters'),
    nameAr: z.string().min(2, 'name must be at least 2 characters').max(100, 'name must be at most 100 characters'),
    long: LongitudeSchema,
    lat: LatitudeSchema,
  },
  {
    sortableFields: ['name', 'nameAr', 'long', 'lat'],  // TSort — the actual sortable fields
  }
);

export const CityViewSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  nameAr: z.string(),
  governmentId: UUIDSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CityFilterSchema = createFilterMetadata(
  {
  id: UUIDSchema,
  governmentId: UUIDSchema,
  name: z.string(),
  nameAr: z.string(),
  long: z.number(),
  lat: z.number(),
  },
  {
    sortableFields: ['name', 'nameAr', 'long', 'lat', 'governmentId'],  // TSort — the actual sortable fields
  }
);
