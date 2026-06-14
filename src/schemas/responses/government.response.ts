import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";
import { PaginationResponseSchema } from '../common.js';
import { CityViewSchema, GovernmentViewSchema } from '../entities/government.js';


export const GovernmentListResponseSchema = SuccessResponseSchema(z.object({
    governments: z.array(GovernmentViewSchema),
    meta: PaginationResponseSchema.optional(),
  }),);
export type GovernmentListResponseDTO = z.infer<typeof GovernmentListResponseSchema>;

export const GovernmentResponseSchema = SuccessResponseSchema(z.object({
    government: GovernmentViewSchema,
  }),);
export type GovernmentResponseDTO = z.infer<typeof GovernmentResponseSchema>;

export const CityListResponseSchema = SuccessResponseSchema(z.object({
    cities: z.array(CityViewSchema),
    meta: PaginationResponseSchema.optional(),
  }),);
export type CityListResponseDTO = z.infer<typeof CityListResponseSchema>;

export const DeleteGovernmentResponseSchema = SuccessResponseSchema(z.null(),);
export type DeleteGovernmentResponseDTO = z.infer<typeof DeleteGovernmentResponseSchema>;

export const GetGovernmentsResponseSchema = GovernmentListResponseSchema;
export type GetGovernmentsResponseDTO = z.infer<typeof GetGovernmentsResponseSchema>;

export const GetGovernmentByIdResponseSchema = GovernmentResponseSchema;
export type GetGovernmentByIdResponseDTO = z.infer<typeof GetGovernmentByIdResponseSchema>;

export const CreateGovernmentResponseSchema = GovernmentResponseSchema;
export type CreateGovernmentResponseDTO = z.infer<typeof CreateGovernmentResponseSchema>;

export const UpdateGovernmentResponseSchema = GovernmentResponseSchema;
export type UpdateGovernmentResponseDTO = z.infer<typeof UpdateGovernmentResponseSchema>;

export const GetCitiesByGovernmentResponseSchema = CityListResponseSchema;
export type GetCitiesByGovernmentResponseDTO = z.infer<typeof GetCitiesByGovernmentResponseSchema>;

export const CityResponseSchema = SuccessResponseSchema(z.object({
    city: CityViewSchema,
  }),);
export type CityResponseDTO = z.infer<typeof CityResponseSchema>;

export const GetCityByIdResponseSchema = CityResponseSchema;
export type GetCityByIdResponseDTO = z.infer<typeof GetCityByIdResponseSchema>;

export const CreateCityResponseSchema = CityResponseSchema;
export type CreateCityResponseDTO = z.infer<typeof CreateCityResponseSchema>;

export const UpdateCityResponseSchema = CityResponseSchema;
export type UpdateCityResponseDTO = z.infer<typeof UpdateCityResponseSchema>;

export const DeleteCityResponseSchema = SuccessResponseSchema(z.null(),);
export type DeleteCityResponseDTO = z.infer<typeof DeleteCityResponseSchema>;
