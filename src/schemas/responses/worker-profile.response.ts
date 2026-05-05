import { z } from 'zod';
import { SuccessResponseSchema } from '../responses.js';

const VerificationObjectSchema = z.object({
  id: z.string().uuid(),
  workerProfileId: z.string().uuid(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  reason: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const PortfolioImageObjectSchema = z.object({
  id: z.string().uuid(),
  portfolioId: z.string().uuid(),
  imageUrl: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const PortfolioObjectSchema = z.object({
  id: z.string().uuid(),
  workerProfileId: z.string().uuid(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  projectImages: z.array(PortfolioImageObjectSchema),
});

const BadgeObjectSchema = z.object({
  id: z.string().uuid(),
  workerProfileId: z.string().uuid(),
  badgeType: z.string(),
  createdAt: z.date(),
});

const WorkingHoursObjectSchema = z.object({
  id: z.string(),
  workerProfileId: z.string(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)),
  startTime: z.string(),
  endTime: z.string(),
});

const OccupiedTimeSlotObjectSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

export const WorkerVerificationResponseSchema = SuccessResponseSchema(
  z.object({ verification: VerificationObjectSchema })
);

export const WorkerPortfolioResponseSchema = SuccessResponseSchema(
  z.object({ portfolio: PortfolioObjectSchema })
);

export const WorkerBadgesResponseSchema = SuccessResponseSchema(
  z.object({ badges: z.array(BadgeObjectSchema) })
);

export const WorkerWorkingHoursResponseSchema = SuccessResponseSchema(
  z.object({ workingHours: WorkingHoursObjectSchema.nullable() })
);

export const WorkerStatsResponseSchema = SuccessResponseSchema(
  z.object({
    stats: z.object({
      rate: z.number(),
      completedJobsCount: z.number(),
      ratingCount: z.number(),
    }),
  })
);

export const WorkerOccupiedTimeSlotsResponseSchema = SuccessResponseSchema(
  z.object({ occupiedSlots: z.array(OccupiedTimeSlotObjectSchema) })
);

export const WorkerPortfolioImagesResponseSchema = SuccessResponseSchema(
  z.object({ images: z.array(PortfolioImageObjectSchema) })
);
