import { z } from 'zod';
import { SuccessResponseSchema } from '../responses.js';
import { UUIDSchema, DayOfWeekSchema, OccupiedTimeSlotViewSchema as OccupiedTimeSlotObjectSchema } from '../common.js';
import { GovernmentViewSchema as GovernmentObjectSchema } from '../entities/government.js';
import { WorkerVerificationViewSchema as VerificationObjectSchema, WorkerPortfolioViewSchema as PortfolioObjectSchema, WorkerBadgeViewSchema as BadgeObjectSchema, WorkerPortfolioProjectImageViewSchema as PortfolioImageObjectSchema } from '../entities/workerProfile.js';
import { DaysWorkingHoursSchema } from '../entities/workingHours.js';
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
  z.object({ workingHours: DaysWorkingHoursSchema })
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

