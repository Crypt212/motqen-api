import { z } from 'zod';
import { SuccessResponseSchema } from '../responses.js';
import { UUIDSchema } from '../common.js';

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

const ExploreSpecializationSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  nameAr: z.string().nullable().optional(),
});

const ExploreWorkingHoursSchema = z.object({
  daysOfWeek: z.array(z.string()),
  startTime: z.string(),
  endTime: z.string(),
});

const ExploreLocationSchema = z.object({
  id: UUIDSchema,
  address: z.string(),
  government: z.object({ name: z.string() }).nullable().optional(),
  city: z.object({ name: z.string() }).nullable().optional(),
});

const ExplorePortfolioSchema = z.object({
  id: z.string(),
  mainImage: z.string(),
});

export const ExploreWorkerDetailSchema = ExploreWorkerCardSchema.extend({
  bio: z.string().nullable().optional(),
  experienceYears: z.number(),
  isInTeam: z.boolean(),
  acceptsUrgentJobs: z.boolean(),
  badges: z.array(z.string()),
  specializations: z.array(ExploreSpecializationSchema),
  workingHours: ExploreWorkingHoursSchema.nullable().optional(),
  portfolio: ExplorePortfolioSchema.nullable().optional(),
  locations: z.array(ExploreLocationSchema),
});

const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  count: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

export const ExploreSearchResponseSchema = SuccessResponseSchema(
  z.object({
    workers: z.array(ExploreWorkerCardSchema),
    meta: PaginationMetaSchema,
  })
);

export const ExploreDetailResponseSchema = SuccessResponseSchema(
  z.object({
    worker: ExploreWorkerDetailSchema,
  })
);
