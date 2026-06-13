import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";

import {
  OccupiedTimeSlotViewSchema,
  PaginationResponseSchema,
  UUIDSchema,
} from '../common.js';
import { DaysWorkingHoursSchema } from '../entities/workingHours.js';
import { UserWithWorkerAndClientProfileIdsViewSchema, UserViewSchema } from '../entities/user.js';
import { ClientProfileViewSchema } from '../entities/clientProfile.js';
import { WorkerVerificationViewSchema, WorkerProfileViewSchema, WorkerPortfolioWithImagesViewSchema, WorkerPortfolioProjectImageViewSchema } from '../entities/workerProfile.js';
import { SpecializationViewSchema, SpecializationWithSubSpecializationsViewSchema } from '../entities/specialization.js';
import { LocationViewSchema } from '../entities/location.js';
import { GovernmentViewSchema } from '../entities/government.js';

export const GetUserResponseSchema = SuccessResponseSchema(z.object({
  user: UserWithWorkerAndClientProfileIdsViewSchema,
}),);
export type GetUserResponseDTO = z.infer<typeof GetUserResponseSchema>;

export const UpdateUserResponseSchema = SuccessResponseSchema(z.object({
  user: UserViewSchema,
}),);
export type UpdateUserResponseDTO = z.infer<typeof UpdateUserResponseSchema>;

export const GetClientProfileResponseSchema = SuccessResponseSchema(z.object({
  clientProfile: ClientProfileViewSchema,
}),);
export type GetClientProfileResponseDTO = z.infer<typeof GetClientProfileResponseSchema>;

export const GetWorkerProfileResponseSchema = SuccessResponseSchema(z.object({
  workerProfile: WorkerProfileViewSchema,
}),);
export type GetWorkerProfileResponseDTO = z.infer<typeof GetWorkerProfileResponseSchema>;

export const UpdateWorkerProfileResponseSchema = SuccessResponseSchema(z.object({
  workerProfile: WorkerProfileViewSchema,
}),);
export type UpdateWorkerProfileResponseDTO = z.infer<typeof UpdateWorkerProfileResponseSchema>;

export const GetWorkerOrdersStatisticsResponseSchema = SuccessResponseSchema(z.object({
  ordersCounts: z.object({
    pending: z.number(),
    canceled: z.number(),
    completed: z.number(),
    today: z.number()
  })

}),);
export type GetWorkerOrdersStatisticsResponseDTO = z.infer<typeof GetWorkerOrdersStatisticsResponseSchema>;

export const CreateClientProfileResponseSchema = SuccessResponseSchema(z.object({
  clientProfile: ClientProfileViewSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
}),);
export type CreateClientProfileResponseDTO = z.infer<typeof CreateClientProfileResponseSchema>;

export const CreateWorkerProfileResponseSchema = SuccessResponseSchema(z.object({
  workerProfile: WorkerProfileViewSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
}),);
export type CreateWorkerProfileResponseDTO = z.infer<typeof CreateWorkerProfileResponseSchema>;

export const GetUserLocationsResponseSchema = SuccessResponseSchema(z.object({
  locations: z.array(LocationViewSchema),
}),);
export type GetUserLocationsResponseDTO = z.infer<typeof GetUserLocationsResponseSchema>;

export const AddUserLocationResponseSchema = SuccessResponseSchema(z.object({
  location: LocationViewSchema,
}),);
export type AddUserLocationResponseDTO = z.infer<typeof AddUserLocationResponseSchema>;

export const UpdateUserLocationResponseSchema = SuccessResponseSchema(z.object({
  location: LocationViewSchema,
}),);
export type UpdateUserLocationResponseDTO = z.infer<typeof UpdateUserLocationResponseSchema>;

export const GetVerificationResponseSchema = SuccessResponseSchema(z.object({
  verification: WorkerVerificationViewSchema
}));
export type GetVerificationResponseDTO = z.infer<typeof GetVerificationResponseSchema>;

export const ResubmitVerificationResponseSchema = SuccessResponseSchema(z.object({
  verification: WorkerVerificationViewSchema
}));
export type ResubmitVerificationResponseDTO = z.infer<typeof ResubmitVerificationResponseSchema>;

export const GetWorkerGovernmentsResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ governments: z.array(GovernmentViewSchema) })
);
export type GetWorkerGovernmentsResponseDTO = z.infer<typeof GetWorkerGovernmentsResponseSchema>;

export const GetWorkerSpecializationsTreeResponseSchema = SuccessResponseSchema(
  z.array(SpecializationWithSubSpecializationsViewSchema)
);
export type GetWorkerSpecializationsTreeResponseDTO = z.infer<typeof GetWorkerSpecializationsTreeResponseSchema>;

export const GetWorkerSpecializationsResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ specializationIds: z.array(UUIDSchema) }),
);
export type GetWorkerSpecializationsResponseDTO = z.infer<typeof GetWorkerSpecializationsResponseSchema>;

export const SpecializationsResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ specializations: z.array(SpecializationViewSchema) }),
);
export type SpecializationsResponseDTO = z.infer<typeof SpecializationsResponseSchema>;

export const GetWorkerWorkingHoursResponseSchema = SuccessResponseSchema(
  z.object({
    workingHours: DaysWorkingHoursSchema
  })
);
export type GetWorkerWorkingHoursResponseDTO = z.infer<typeof GetWorkerWorkingHoursResponseSchema>;

export const AddWorkerDaysWorkingHoursResponseSchema = SuccessResponseSchema(
  z.object({
    workingHours: DaysWorkingHoursSchema
  })
);
export type AddWorkerDaysWorkingHoursResponseDTO = z.infer<typeof AddWorkerDaysWorkingHoursResponseSchema>;

export const CreatePortfolioResponseSchema = SuccessResponseSchema(z.object({
  portfolio: WorkerPortfolioWithImagesViewSchema
}));
export type CreatePortfolioResponseDTO = z.infer<typeof CreatePortfolioResponseSchema>;

export const GetPortfolioResponseSchema = SuccessResponseSchema(z.object({
  portfolio: WorkerPortfolioWithImagesViewSchema
}));
export type GetPortfolioResponseDTO = z.infer<typeof GetPortfolioResponseSchema>;

export const UpdatePortfolioResponseSchema = SuccessResponseSchema(z.object({
  portfolio: WorkerPortfolioWithImagesViewSchema
}));
export type UpdatePortfolioResponseDTO = z.infer<typeof UpdatePortfolioResponseSchema>;

export const AddPortfolioImagesResponseSchema = SuccessResponseSchema(z.object({
  images: z.array(WorkerPortfolioProjectImageViewSchema)
}));

export type AddPortfolioImagesResponseDTO = z.infer<typeof AddPortfolioImagesResponseSchema>;

export const GetWorkerOccupiedTimeSlotsResponseSchema = SuccessResponseSchema(z.object({
  occupiedSlots: z.array(OccupiedTimeSlotViewSchema)
}));

export type GetWorkerOccupiedTimeSlotsResponseDTO = z.infer<typeof GetWorkerOccupiedTimeSlotsResponseSchema>;

export const RemoveWorkerWorkingDaysResponseSchema = SuccessResponseSchema(z.any());

export type RemoveWorkerWorkingDaysResponseDTO = z.infer<typeof RemoveWorkerWorkingDaysResponseSchema>;

export const AddWorkerGovernmentsResponseSchema = SuccessResponseSchema(z.any());

export type AddWorkerGovernmentsResponseDTO = z.infer<typeof AddWorkerGovernmentsResponseSchema>;

export const DeleteWorkerGovernmentsResponseSchema = SuccessResponseSchema(z.any());

export type DeleteWorkerGovernmentsResponseDTO = z.infer<typeof DeleteWorkerGovernmentsResponseSchema>;

export const AddWorkerSpecializationsResponseSchema = SuccessResponseSchema(z.any());

export type AddWorkerSpecializationsResponseDTO = z.infer<typeof AddWorkerSpecializationsResponseSchema>;

export const DeleteWorkerSpecializationsResponseSchema = SuccessResponseSchema(z.any());

export type DeleteWorkerSpecializationsResponseDTO = z.infer<typeof DeleteWorkerSpecializationsResponseSchema>;

export const DeleteUserLocationResponseSchema = SuccessResponseSchema(z.any());

export type DeleteUserLocationResponseDTO = z.infer<typeof DeleteUserLocationResponseSchema>;

export const DeletePortfolioImageResponseSchema = SuccessResponseSchema(z.any());

export type DeletePortfolioImageResponseDTO = z.infer<typeof DeletePortfolioImageResponseSchema>;
