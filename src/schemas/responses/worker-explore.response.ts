import { z } from '../../libs/zod.js';
import { SuccessResponseSchema } from '../responses.js';
import { UUIDSchema, PaginationResponseSchema } from '../common.js';
import { SpecializationsTreeViewSchema as SpecializationsTreeSchema } from '../entities/specialization.js';
import {

GetWorkerWorkingHoursResponseSchema as DashboardGetWorkerWorkingHoursResponseSchema,
AddWorkerDaysWorkingHoursResponseSchema as DashboardAddWorkerDaysWorkingHoursResponseSchema,
} from "./dashboard.response.js";

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

export const ExploreSearchResponseSchema = SuccessResponseSchema(
  z.object({ meta: PaginationResponseSchema, workers: z.array(ExploreWorkerCardSchema) })
);
export type ExploreSearchResponseDTO = z.infer<typeof ExploreSearchResponseSchema>;

export const ExploreDetailResponseSchema = SuccessResponseSchema(
  z.object({
    worker: z.object({
      userInfo: z.object({
        id: UUIDSchema,
        isOnline: z.boolean(),
        profileImageUrl: z.string(),
        name: z.string()
      }),

      location: z.object({
        id: UUIDSchema,
        address: z.string(),
        addressNotes: z.string(),
        city: z.object({
          name: z.string(),
          id: UUIDSchema,
          nameAr: z.string(),
          long: z.number(),
          lat: z.number(),
        }),
        government: z.object({
          name: z.string(),
          id: UUIDSchema,
          nameAr: z.string(),
          long: z.number(),
          lat: z.number(),
        }),
      }),

      portfolio: z.object({
        id: z.string(),
        mainImage: z.string().nullable(),
      }).nullable(),
      workInfo: z.object({
        completedJobsCount: z.number(),
        ratingCount: z.number(),
        experienceYears: z.number(),
        isInTeam: z.boolean(),
        acceptsUrgentJobs: z.boolean(),
        rate: z.number(),
        bio: z.string().optional(),
      }),
    })
  })
);

export type ExploreDetailResponseDTO = z.infer<typeof ExploreDetailResponseSchema>;

const AreaInfoSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  nameAr: z.string(),
  long: z.number(),
  lat: z.number(),
});

export const ExploreWorkerSchema = z.object({
  userInfo: z.object({
    id: UUIDSchema,
    isOnline: z.boolean(),
    profileImageUrl: z.string().nullable(),
    name: z.string(),
  }),
  location: z
    .object({
      id: UUIDSchema,
      address: z.string(),
      addressNotes: z.string(),
      city: AreaInfoSchema,
      government: AreaInfoSchema,
    })
    .nullable(),
  specializationTree: SpecializationsTreeSchema,
  workInfo: z.object({
    experienceYears: z.number().nullable(),
    isInTeam: z.boolean().nullable(),
    acceptsUrgentJobs: z.boolean().nullable(),
    bio: z.string().nullable(),
  }),
});

export const ExploreWorkersResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ workers: z.array(ExploreWorkerSchema) })
);
export type ExploreWorkersResponseDTO = z.infer<typeof ExploreWorkersResponseSchema>;

export const ExploreWorkerDetailResponseSchema = SuccessResponseSchema(ExploreWorkerSchema);
export type ExploreWorkerDetailResponseDTO = z.infer<typeof ExploreWorkerDetailResponseSchema>;

export const OccupiedTimeSlotSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

export const OccupiedTimeSlotsResponseSchema = SuccessResponseSchema(
  z.object({ occupiedSlots: z.array(OccupiedTimeSlotSchema) })
);
export type OccupiedTimeSlotsResponseDTO = z.infer<typeof OccupiedTimeSlotsResponseSchema>;

export const SearchWorkersResponseSchema = ExploreSearchResponseSchema;
export type SearchWorkersResponseDTO = z.infer<typeof SearchWorkersResponseSchema>;

export const GetWorkerByIdResponseSchema = ExploreDetailResponseSchema;
export type GetWorkerByIdResponseDTO = z.infer<typeof GetWorkerByIdResponseSchema>;

export const GetWorkerOccupiedTimeSlotsResponseSchema = OccupiedTimeSlotsResponseSchema;
export type GetWorkerOccupiedTimeSlotsResponseDTO = z.infer<typeof GetWorkerOccupiedTimeSlotsResponseSchema>;

export const GetWorkerWorkingHoursResponseSchema = DashboardGetWorkerWorkingHoursResponseSchema;
export type GetWorkerWorkingHoursResponseDTO = z.infer<typeof GetWorkerWorkingHoursResponseSchema>;
