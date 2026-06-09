import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";

import { GovernmentObjectSchema } from './government.response.js';
import {
  OccupiedTimeSlotObjectSchema,
  PaginationResponseSchema,
  PortfolioObjectSchema,
  ProjectImageSchema,
  UserObjectSchema,
  LoggedInUserObjectSchema,
  UUIDSchema,
  SpecializationObjectSchema,
  SpecializationWithSubSpecializationsObjectSchema,
  ClientProfileObjectSchema,
  WorkerProfileObjectSchema,
} from '../common.js';
import { DaysWorkingHoursSchema } from '../requests/worker-profile.request.js';
import { LocationObjectSchema } from './location.response.js';

export const DashboardUserResponseSchema = SuccessResponseSchema(z.object({
  user: LoggedInUserObjectSchema,
}),);
export type DashboardUserResponseDTO = z.infer<typeof DashboardUserResponseSchema>;

export const DashboardUpdateUserResponseSchema = SuccessResponseSchema(z.object({
  user: UserObjectSchema,
}),);
export type DashboardUpdateUserResponseDTO = z.infer<typeof DashboardUpdateUserResponseSchema>;

export const DashboardClientProfileResponseSchema = SuccessResponseSchema(z.object({
  clientProfile: ClientProfileObjectSchema,
}),);
export type DashboardClientProfileResponseDTO = z.infer<typeof DashboardClientProfileResponseSchema>;

export const DashboardWorkerProfileResponseSchema = SuccessResponseSchema(z.object({
  workerProfile: WorkerProfileObjectSchema,
}),);
export type DashboardWorkerProfileResponseDTO = z.infer<typeof DashboardWorkerProfileResponseSchema>;

export const DashboardWorkerOrdersStatisticsResponseSchema = SuccessResponseSchema(z.object({
  ordersCounts: z.object({
    pending: z.number(),
    canceled: z.number(),
    completed: z.number(),
    today: z.number()
  })

}),);
export type DashboardWorkerOrdersStatisticsResponseDTO = z.infer<typeof DashboardWorkerOrdersStatisticsResponseSchema>;

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
