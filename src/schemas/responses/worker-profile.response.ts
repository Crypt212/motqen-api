import { z } from 'zod';

const BaseSuccessResponse = z.object({
  status: z.literal('success'),
  message: z.string(),
});

export const WorkerProfileResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    profile: z.any(),
  }),
});

export const WorkerVerificationResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    verification: z.any(),
  }),
});

export const WorkerPortfolioResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    portfolio: z.any(),
  }),
});

export const WorkerBadgesResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    badges: z.array(z.any()),
  }),
});

export const WorkerWorkingHoursResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    workingHours: z.any(),
  }),
});

export const WorkerGovernmentsResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    governments: z.array(z.any()),
  }),
});

export const WorkerSpecializationsTreeResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    specializationsTree: z.array(z.any()),
  }),
});

export const WorkerOccupiedTimeSlotsResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    occupiedSlots: z.array(z.any()),
  }),
});

export const WorkerStatsResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    stats: z.object({
      rate: z.number(),
      completedJobsCount: z.number(),
      ratingCount: z.number(),
    }),
  }),
});
