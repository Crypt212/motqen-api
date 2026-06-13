import { z } from '../../libs/zod.js';
import { UUIDSchema } from '../common.js';

export const ExploreSearchSchema = z.object({
  specializationId: UUIDSchema.optional(),
  subSpecializationId: UUIDSchema.optional(),
  governmentId: UUIDSchema.optional(),
  highestRated: z.preprocess(
    (val) => (val === 'true' || val === true ? true : false),
    z.boolean().optional().default(false)
  ),
  nearest: z.preprocess(
    (val) => (val === 'true' || val === true ? true : false),
    z.boolean().optional().default(false)
  ),
  availableNow: z.preprocess(
    (val) => (val === 'true' || val === true ? true : false),
    z.boolean().optional().default(false)
  ),
  acceptsUrgentJobs: z.preprocess(
    (val) => (val === 'true' || val === true ? true : false),
    z.boolean().optional().default(false)
  ),
  page: z.coerce
    .number()
    .int()
    .min(1, 'page must be an integer greater than or equal to 1')
    .optional()
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50, 'limit must be an integer between 1 and 50')
    .optional()
    .default(10),
  'location[longitude]': z.coerce.number().optional(),
  'location[latitude]': z.coerce.number().optional(),
});
export type ExploreSearchDTO = z.infer<typeof ExploreSearchSchema>;

export const ExploreWorkerIdParamsSchema = z.object({
  id: UUIDSchema,
});
export type ExploreWorkerIdParams = z.infer<typeof ExploreWorkerIdParamsSchema>;

export const OccupiedTimeSlotsQuerySchema = z.object({
  selectedDate: z
    .string()
    .transform((val) => new Date(val).toISOString().slice(0, 10))
    .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD')),
});
export type OccupiedTimeSlotsQueryDTO = z.infer<typeof OccupiedTimeSlotsQuerySchema>;

export type OccupiedTimeSlotDTO = {
  startDate: Date;
  endDate: Date;
};

import { EmptySchema } from '../common.js';

export const SearchWorkersRequestSchema = EmptySchema;
export type SearchWorkersRequestDTO = z.infer<typeof SearchWorkersRequestSchema>;
export const SearchWorkersQuerySchema = ExploreSearchSchema;
export type SearchWorkersQueryDTO = z.infer<typeof SearchWorkersQuerySchema>;
export const SearchWorkersParamsSchema = EmptySchema;
export type SearchWorkersParamsDTO = z.infer<typeof SearchWorkersParamsSchema>;

export const GetWorkerByIdRequestSchema = EmptySchema;
export type GetWorkerByIdRequestDTO = z.infer<typeof GetWorkerByIdRequestSchema>;
export const GetWorkerByIdQuerySchema = EmptySchema;
export type GetWorkerByIdQueryDTO = z.infer<typeof GetWorkerByIdQuerySchema>;
export const GetWorkerByIdParamsSchema = ExploreWorkerIdParamsSchema;
export type GetWorkerByIdParamsDTO = z.infer<typeof GetWorkerByIdParamsSchema>;

export const GetWorkerOccupiedTimeSlotsRequestSchema = EmptySchema;
export type GetWorkerOccupiedTimeSlotsRequestDTO = z.infer<typeof GetWorkerOccupiedTimeSlotsRequestSchema>;
export const GetWorkerOccupiedTimeSlotsQuerySchema = OccupiedTimeSlotsQuerySchema;
export type GetWorkerOccupiedTimeSlotsQueryDTO = z.infer<typeof GetWorkerOccupiedTimeSlotsQuerySchema>;
export const GetWorkerOccupiedTimeSlotsParamsSchema = ExploreWorkerIdParamsSchema;
export type GetWorkerOccupiedTimeSlotsParamsDTO = z.infer<typeof GetWorkerOccupiedTimeSlotsParamsSchema>;


export const GetWorkerWorkingHoursRequestSchema = EmptySchema;
export type GetWorkerWorkingHoursRequestDTO = z.infer<typeof GetWorkerWorkingHoursRequestSchema>;
export const GetWorkerWorkingHoursQuerySchema = EmptySchema;
export type GetWorkerWorkingHoursQueryDTO = z.infer<typeof GetWorkerWorkingHoursQuerySchema>;
export const GetWorkerWorkingHoursParamsSchema = z.object({
  id: UUIDSchema
});
export type GetWorkerWorkingHoursParamsDTO = z.infer<typeof GetWorkerWorkingHoursParamsSchema>;


