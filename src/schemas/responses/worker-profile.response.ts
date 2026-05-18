import { z } from 'zod';
import { SuccessResponseSchema } from '../responses.js';
import { UUIDSchema } from '../common.js';
import { GovernmentObjectSchema } from './government.response.js';
import { DayOfWeekSchema } from '../requests/worker-profile.request.js';

const VerificationObjectSchema = z.object({
  id: UUIDSchema,
  workerProfileId: UUIDSchema,
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  reason: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const PortfolioImageObjectSchema = z.object({
  id: UUIDSchema,
  portfolioId: UUIDSchema,
  imageUrl: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const PortfolioObjectSchema = z.object({
  id: UUIDSchema,
  workerProfileId: UUIDSchema,
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  projectImages: z.array(PortfolioImageObjectSchema),
});

const BadgeObjectSchema = z.object({
  id: UUIDSchema,
  workerProfileId: UUIDSchema,
  badgeType: z.string(),
  createdAt: z.date(),
});

const DayWorkingHoursObjectSchema = z.object({
  day: DayOfWeekSchema,
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
  z.object({ workingHours: z.array(DayWorkingHoursObjectSchema) })
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

const PaginationMetaFields = {
  page: z.number().optional(),
  limit: z.number().optional(),
  total: z.number().optional(),
  totalPages: z.number().optional(),
  count: z.number().optional(),
  hasNext: z.boolean().optional(),
  hasPrev: z.boolean().optional(),
};

export const WorkerGovernmentsListResponseSchema = SuccessResponseSchema(
  z.object({
    governments: z.array(GovernmentObjectSchema),
    ...PaginationMetaFields,
  })
);

export const WorkerSpecializationsListResponseSchema = SuccessResponseSchema(
  z.object({
    specializationIds: z.array(UUIDSchema),
    ...PaginationMetaFields,
  })
);

const SubSpecializationObjectSchema = z.object({
  id: UUIDSchema,
  mainSpecializationId: UUIDSchema,
  name: z.string(),
  nameAr: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const SpecializationWithSubsSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  nameAr: z.string(),
  category: z.string(),
  ordersCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  subSpecializations: z.array(SubSpecializationObjectSchema),
});

export const WorkerSpecializationsTreeResponseSchema = SuccessResponseSchema(
  z.array(SpecializationWithSubsSchema)
);

