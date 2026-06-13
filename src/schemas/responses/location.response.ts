import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";
import { LocationViewSchema } from '../entities/location.js';


export const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const LocationListResponseSchema = SuccessResponseSchema(z.object({
    locations: z.array(LocationViewSchema),
    meta: PaginationMetaSchema.optional(),
  }),);
export type LocationListResponseDTO = z.infer<typeof LocationListResponseSchema>;

export const LocationResponseSchema = SuccessResponseSchema(z.object({
    location: LocationViewSchema,
  }),);
export type LocationResponseDTO = z.infer<typeof LocationResponseSchema>;

export const GetLocationsResponseSchema = LocationListResponseSchema;
export type GetLocationsResponseDTO = z.infer<typeof GetLocationsResponseSchema>;

export const CreateLocationResponseSchema = LocationResponseSchema;
export type CreateLocationResponseDTO = z.infer<typeof CreateLocationResponseSchema>;

export const GetMainLocationResponseSchema = LocationResponseSchema;
export type GetMainLocationResponseDTO = z.infer<typeof GetMainLocationResponseSchema>;

export const UpdateMainLocationResponseSchema = LocationResponseSchema;
export type UpdateMainLocationResponseDTO = z.infer<typeof UpdateMainLocationResponseSchema>;

export const UpdateLocationResponseSchema = LocationResponseSchema;
export type UpdateLocationResponseDTO = z.infer<typeof UpdateLocationResponseSchema>;

export const SetMainLocationResponseSchema = LocationResponseSchema;
export type SetMainLocationResponseDTO = z.infer<typeof SetMainLocationResponseSchema>;

export const GetLocationByIdResponseSchema = LocationResponseSchema;
export type GetLocationByIdResponseDTO = z.infer<typeof GetLocationByIdResponseSchema>;

export const DeleteLocationResponseSchema = SuccessResponseSchema(z.null(),);
export type DeleteLocationResponseDTO = z.infer<typeof DeleteLocationResponseSchema>;
