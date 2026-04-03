import { z } from '../libs/zod.js';
import { UUIDSchema } from './common.js';

const parseStringList = (value: unknown): unknown => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => String(item).split(','))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return undefined;
};

const parseOptionalUUID = (value: unknown): unknown => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return value;
};

const FlagedFilterSchema = z.enum(['availbilty', 'nearest', 'acceptUrgentJobs', 'heasetrated']);

export const ExploreSearchSchema = z.object({
  specializationId: UUIDSchema,
  subSpecializationId: z.preprocess(parseOptionalUUID, UUIDSchema.optional()),
  governments: z.preprocess(parseStringList, z.array(UUIDSchema).optional()),
  flaged: z.preprocess(parseStringList, z.array(FlagedFilterSchema).optional().default([])),
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
});
export type ExploreSearchDTO = z.infer<typeof ExploreSearchSchema>;

export const ExploreWorkerIdParamsSchema = z.object({
  id: UUIDSchema,
});
export type ExploreWorkerIdParams = z.infer<typeof ExploreWorkerIdParamsSchema>;
