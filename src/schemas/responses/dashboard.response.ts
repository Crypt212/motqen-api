import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";
import { OccupiedTimeSlotObjectSchema, PaginationResponseSchema, PortfolioObjectSchema, ProjectImageSchema, UUIDSchema } from '../common.js';
import { GovernmentObjectSchema } from './government.response.js';
import { SpecializationObjectSchema, SpecializationWithSubSpecializationsObjectSchema } from '../common.js';
import { DaysWorkingHoursSchema } from '../requests/worker-profile.request.js';
import { LocationObjectSchema } from './location.response.js';


export const UserObjectSchema = z.object({
  id: UUIDSchema,
  firstName: z.string(),
  middleName: z.string().nullable().optional(),
  lastName: z.string(),
  phoneNumber: z.string(),
  profileImageUrl: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ClientProfileObjectSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WorkerOrdersStatisticsSchema = z.object({
  ordersCounts: z.object({
    cancelled: z.number(),
    completed: z.number(),
    pending: z.number(),
    today: z.number(),
  })
});

export const WorkerProfileObjectSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  experienceYears: z.number(),
  isInTeam: z.boolean(),
  acceptsUrgentJobs: z.boolean(),
  rate: z.number(),
  completedJobsCount: z.number(),
  ratingCount: z.number(),
  bio: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const DashboardUserResponseSchema = SuccessResponseSchema(z.object({
  user: UserObjectSchema,
}),);
export type DashboardUserResponseDTO = z.infer<typeof DashboardUserResponseSchema>;

export const DashboardClientProfileResponseSchema = SuccessResponseSchema(z.object({
  clientProfile: ClientProfileObjectSchema,
}),);
export type DashboardClientProfileResponseDTO = z.infer<typeof DashboardClientProfileResponseSchema>;

export const DashboardWorkerProfileResponseSchema = SuccessResponseSchema(z.object({
  workerProfile: WorkerProfileObjectSchema,
}),);
export type DashboardWorkerProfileResponseDTO = z.infer<typeof DashboardWorkerProfileResponseSchema>;

export const DashboardClientProfileWithTokensResponseSchema = SuccessResponseSchema(z.object({
  clientProfile: ClientProfileObjectSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
}),);
export type DashboardClientProfileWithTokensResponseDTO = z.infer<typeof DashboardClientProfileWithTokensResponseSchema>;

export const DashboardWorkerProfileWithTokensResponseSchema = SuccessResponseSchema(z.object({
  workerProfile: WorkerProfileObjectSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
}),);
export type DashboardWorkerProfileWithTokensResponseDTO = z.infer<typeof DashboardWorkerProfileWithTokensResponseSchema>;

export const DashboardLocationsResponseSchema = SuccessResponseSchema(z.object({
  locations: z.array(LocationObjectSchema),
}),);
export type DashboardLocationsResponseDTO = z.infer<typeof DashboardLocationsResponseSchema>;

export const DashboardLocationResponseSchema = SuccessResponseSchema(z.object({
  location: LocationObjectSchema,
}),);
export type DashboardLocationResponseDTO = z.infer<typeof DashboardLocationResponseSchema>;

export const UserResponseSchema = SuccessResponseSchema(
  z.object({
    user: UserObjectSchema
  })
);
export type UserResponseDTO = z.infer<typeof UserResponseSchema>;

export const WorkerProfileResponseSchema = SuccessResponseSchema(
  z.object({
    workerProfile: WorkerProfileObjectSchema,
  })
);
export type WorkerProfileResponseDTO = z.infer<typeof WorkerProfileResponseSchema>;

export const ClientProfileResponseSchema = SuccessResponseSchema(
  z.object({
    clientProfile: ClientProfileObjectSchema
  })
);
export type ClientProfileResponseDTO = z.infer<typeof ClientProfileResponseSchema>;

export const WorkGovernmentsResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ governments: z.array(GovernmentObjectSchema) })
);
export type WorkGovernmentsResponseDTO = z.infer<typeof WorkGovernmentsResponseSchema>;

export const SpecializationsWithSubSpecializationsResponseSchema = SuccessResponseSchema(
  z.array(SpecializationWithSubSpecializationsObjectSchema)
);
export type SpecializationsWithSubSpecializationsResponseDTO = z.infer<typeof SpecializationsWithSubSpecializationsResponseSchema>;

export const SpecializationsResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ specializations: z.array(SpecializationObjectSchema) }),
);
export type SpecializationsResponseDTO = z.infer<typeof SpecializationsResponseSchema>;

export const SpecializationIdsResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ specializationIds: z.array(UUIDSchema) }),
);
export type SpecializationIdsResponseDTO = z.infer<typeof SpecializationIdsResponseSchema>;

export const WorkingHoursResponseSchema = SuccessResponseSchema(
  z.object({
    workingHours: DaysWorkingHoursSchema
  })
);
export type WorkingHoursResponseDTO = z.infer<typeof WorkingHoursResponseSchema>;

export const PortfolioWithImagesResponseSchema = SuccessResponseSchema(z.object({
  portfolio: PortfolioObjectSchema.extend({ projectImages: z.array(ProjectImageSchema) })
}));

export type PortfolioWithImagesResponseDTO = z.infer<typeof PortfolioWithImagesResponseSchema>;

export const ImagesResponseSchema = SuccessResponseSchema(z.object({
  images: z.array(ProjectImageSchema)
}));

export type ImagesResponseDTO = z.infer<typeof ImagesResponseSchema>;

export const OccupiedTimeSlotsResponseSchema = SuccessResponseSchema(z.object({
  occupiedSlots: z.array(OccupiedTimeSlotObjectSchema)
}));

export type OccupiedTimeSlotsResponseDTO = z.infer<typeof OccupiedTimeSlotsResponseSchema>;
