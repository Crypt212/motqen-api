import { z } from '../libs/zod.js';
import { UUIDSchema } from './common.js';

const FlaggedFilterSchema = z.enum([
  'availability',
  'availbilty',
  'nearest',
  'acceptsUrgentJobs',
  'acceptUrgentJobs',
  'highestRated',
  'highestrated',
  'heasetrated',
]);

export const ExploreSearchSchema = z.object({
  specializationId: UUIDSchema,
  subSpecializationId: UUIDSchema.optional().nullable(),
  page: z.coerce.number().int().min(1, 'page must be an integer greater than or equal to 1'),
  limit: z.coerce.number().int().min(1).max(50, 'limit must be an integer between 1 and 50'),
  highestRated: z.coerce.boolean().optional().nullable(),
  nearest: z.coerce.boolean().optional().nullable(),
  governmentId: UUIDSchema.optional().nullable(),
  acceptsUrgentJobs: z.coerce.boolean().optional().nullable(),
  // covers availability / availableNow / AvailableNow / AvailbleNow
  availability: z.coerce.boolean().optional().nullable(),
  availableNow: z.coerce.boolean().optional().nullable(),
  AvailableNow: z.coerce.boolean().optional().nullable(),
  AvailbleNow: z.coerce.boolean().optional().nullable(),
  flagged: z.union([FlaggedFilterSchema, z.array(FlaggedFilterSchema), z.string()]).optional(),
  flaged: z.union([FlaggedFilterSchema, z.array(FlaggedFilterSchema), z.string()]).optional(),
  Flaged: z.union([FlaggedFilterSchema, z.array(FlaggedFilterSchema), z.string()]).optional(),
});
export type ExploreSearchDTO = z.infer<typeof ExploreSearchSchema>;

export const ExploreWorkerIdParamsSchema = z.object({
  id: UUIDSchema,
});
export type ExploreWorkerIdParams = z.infer<typeof ExploreWorkerIdParamsSchema>;
