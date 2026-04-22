import { z } from '../libs/zod.js';
import { UUIDSchema } from './common.js';

export const ExploreSearchSchema = z.object({
  specializationId: UUIDSchema,
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
  selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD'),
});
export type OccupiedTimeSlotsQueryDTO = z.infer<typeof OccupiedTimeSlotsQuerySchema>;

export type OccupiedTimeSlotDTO = {
  startDate: Date;
  endDate: Date;
};
