import { z } from 'zod';
import { UUIDSchema } from '../common.js';

const BaseSuccessResponse = z.object({
  status: z.literal('success'),
  message: z.string(),
});

export const ExploreWorkerCardSchema = z.object({
  workerId: UUIDSchema,
  name: z.string(),
  profileImage: z.string().nullable(),
  rating: z.number(),
  ratingCount: z.number(),
  completedServices: z.number(),
  distance: z.number().optional(),
  isAvailableNow: z.boolean(),
});

export const ExploreWorkerDetailSchema = ExploreWorkerCardSchema.extend({
  bio: z.string().nullable().optional(),
  experienceYears: z.number(),
  isInTeam: z.boolean(),
  acceptsUrgentJobs: z.boolean(),
  badges: z.array(z.string()),
  specializations: z.array(z.any()), // Can be typed further if needed
  workingHours: z.any().nullable().optional(),
  portfolio: z.any().nullable().optional(),
  locations: z.array(z.any()),
});

export const ExploreSearchResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    workers: z.array(ExploreWorkerCardSchema),
    meta: z.any(),
  }),
});

export const ExploreDetailResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    worker: ExploreWorkerDetailSchema,
  }),
});
