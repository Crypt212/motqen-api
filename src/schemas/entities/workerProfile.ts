import { z } from 'src/libs/zod.js';
import { createFilterMetadata, URLSchema, UUIDSchema } from "../common.js";
import { SpecializationsTreeCreateSchema } from './specialization.js';

export const WorkGovernmentIdsDeleteSchema = z
  .array(UUIDSchema)
  .min(1, 'workGovernments must contain at least one government ID');

export const WorkGovernmentIdsCreateSchema = z
  .array(UUIDSchema)
  .min(1, 'workGovernments must contain at least one government ID');

export const WorkGovernmentIdsViewSchema = z
  .array(UUIDSchema)
  .min(1, 'workGovernments must contain at least one government ID');

export const WorkerProfileViewSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  experienceYears: z.number(),
  isInTeam: z.boolean(),
  acceptsUrgentJobs: z.boolean(),
  rate: z.number(),
  ratingCount: z.number(),
  completedJobsCount: z.number(),
  bio: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WorkerProfileFilterSchema = createFilterMetadata(
  {
    id: UUIDSchema,
    userId: UUIDSchema,
    rate: z.number(),
    experienceYears: z.number(),
    acceptsUrgentJobs: z.boolean(),
  },
  {
    sortableFields: ['id', 'userId', 'rate', 'experienceYears', 'acceptsUrgentJobs'],  // TSort — the actual sortable fields
  }
);

export const WorkerProfileUpdateSchema = z.object({
  experienceYears: z.number({ message: 'experienceYears must be a number' }).int().min(0).optional(),
  isInTeam: z.boolean({ message: 'isInTeam must be a boolean' }).optional(),
  acceptsUrgentJobs: z.boolean({ message: 'acceptsUrgentJobs must be a boolean' }).optional(),
  bio: z.string().optional(),
});

export const WorkerProfileCreateSchema = z.object({
  specializationsTree: SpecializationsTreeCreateSchema,
  workGovernmentIds: WorkGovernmentIdsCreateSchema,
  experienceYears: z.number({ message: 'experienceYears must be a number' }).int().min(0),
  isInTeam: z.boolean({ message: 'isInTeam must be a boolean' }),
  acceptsUrgentJobs: z.boolean({ message: 'acceptsUrgentJobs must be a boolean' }),
  bio: z.string().optional(),
});

export const WorkerSummaryViewSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  firstName: z.string(),
  lastName: z.string(),
  profileImageUrl: z.string().nullable(),
  experienceYears: z.number(),
  rate: z.number(),
  ratingCount: z.number(),
  completedJobsCount: z.number(),
});


export const WorkerOrdersStatisticsViewSchema = z.object({
  ordersCounts: z.object({
    cancelled: z.number(),
    completed: z.number(),
    pending: z.number(),
    today: z.number(),
  })
});

export const WorkerPortfolioProjectImageViewSchema = z.object({
  id: UUIDSchema,
  portfolioId: UUIDSchema,
  imageUrl: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WorkerPortfolioViewSchema = z.object({
  id: UUIDSchema,
  workerProfileId: UUIDSchema,
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WorkerPortfolioWithImagesViewSchema = WorkerPortfolioViewSchema.extend({

  projectImages: z.array(WorkerPortfolioProjectImageViewSchema),
});

export const WorkerBadgeViewSchema = z.object({
  id: UUIDSchema,
  workerProfileId: UUIDSchema,
  badgeType: z.string(),
  createdAt: z.date(),
});

export const WorkerVerificationViewSchema = z.object({

  id: UUIDSchema,
  workerProfileId: UUIDSchema,

  idWithPersonalImageUrl: z.string(),
  idDocumentUrl: z.string(),
  reason: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED'], `status must be one of: ${['PENDING', 'APPROVED', 'REJECTED'].join(', ')}`),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WorkerVerificationCreateSchema = z.object({
  idWithPersonalImageUrl: URLSchema,
  idDocumentUrl: URLSchema,
});
