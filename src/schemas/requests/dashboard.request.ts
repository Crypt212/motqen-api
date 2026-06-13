import { z } from '../../libs/zod.js';
import { createQuerySchema, DayOfWeekSchema, UUIDSchema, EmptySchema, EmptyObjectDTO } from '../common.js';
import { UserUpdateSchema } from '../entities/user.js';
import { ClientProfileCreateSchema, ClientProfileFilterSchema, ClientProfileUpdateSchema } from '../entities/clientProfile.js';
import { WorkerProfileCreateSchema, WorkerProfileUpdateSchema, WorkerProfileFilterSchema, WorkGovernmentIdsCreateSchema, WorkGovernmentIdsDeleteSchema } from '../entities/workerProfile.js';
import { SpecializationsTreeCreateSchema, SpecializationsTreeDeleteSchema } from '../entities/specialization.js';
import { LocationCreateSchema, LocationUpdateSchema } from '../entities/location.js';
import { DaysWorkingHoursSchema } from '../entities/workingHours.js';
import { GovernmentFilterSchema } from '../entities/government.js';

export const UpdateUserRequestSchema = UserUpdateSchema;
export type UpdateUserRequestDTO = z.infer<typeof UpdateUserRequestSchema>;

export const CreateClientProfileRequestSchema = z.object({
  clientProfile: ClientProfileCreateSchema,
});
export type CreateClientProfileRequestDTO = z.infer<typeof CreateClientProfileRequestSchema>;

export const GetWorkerWorkingHoursParamsSchema = EmptySchema;
export type GetWorkerWorkingHoursParamsDTO = z.infer<typeof GetWorkerWorkingHoursParamsSchema>;

export const AddWorkerDaysWorkingHoursRequestSchema = z.object({
  schedules: DaysWorkingHoursSchema
});
export type AddWorkerDaysWorkingHoursRequestDTO = z.infer<typeof AddWorkerDaysWorkingHoursRequestSchema>;

export const UpdateClientProfileRequestSchema = ClientProfileUpdateSchema;
export type UpdateClientProfileRequestDTO = z.infer<typeof UpdateClientProfileRequestSchema>;

export const CreateWorkerProfileRequestSchema = z.object({
  workerProfile: WorkerProfileCreateSchema,
});
export type CreateWorkerProfileRequestDTO = z.infer<typeof CreateWorkerProfileRequestSchema>;

export const UpdateWorkerProfileRequestSchema = WorkerProfileUpdateSchema
export type UpdateWorkerProfileRequestDTO = z.infer<typeof UpdateWorkerProfileRequestSchema>;

export const DeletePortfolioImageParamsSchema = z.object({
  imageId: UUIDSchema
});
export type DeletePortfolioImageParamsDTO = z.infer<typeof DeletePortfolioImageParamsSchema>;

export const GetOccupiedTimeSlotsQuerySchema = z.object({
  selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format'),
});
export type GetOccupiedTimeSlotsQueryDTO = z.infer<typeof GetOccupiedTimeSlotsQuerySchema>;

export const RemoveWorkerWorkingDaysRequestSchema = z.object({
  days: z.array(DayOfWeekSchema)
});
export type RemoveWorkerWorkingDaysRequestDTO = z.infer<typeof RemoveWorkerWorkingDaysRequestSchema>;

export const AddUserLocationRequestSchema = LocationCreateSchema;
export type AddUserLocationRequestDTO = z.infer<typeof AddUserLocationRequestSchema>;

export const UpdateUserLocationRequestSchema = LocationUpdateSchema;
export type UpdateUserLocationRequestDTO = z.infer<typeof UpdateUserLocationRequestSchema>;

export const UpdateUserLocationParamsSchema = z.object({
  locationId: UUIDSchema
});
export type UpdateUserLocationParamsDTO = z.infer<typeof UpdateUserLocationParamsSchema>;

export const DeleteUserLocationParamsSchema = z.object({
  locationId: UUIDSchema
});
export type DeleteUserLocationParamsDTO = z.infer<typeof DeleteUserLocationParamsSchema>;

export const AddWorkerGovernmentsRequestSchema = z.object({
  workGovernments: WorkGovernmentIdsCreateSchema,
});
export type AddWorkerGovernmentsRequestDTO = z.infer<typeof AddWorkerGovernmentsRequestSchema>;

export const DeleteWorkerGovernmentsRequestSchema = z.object({
  workGovernments: WorkGovernmentIdsDeleteSchema,
});
export type DeleteWorkerGovernmentsRequestDTO = z.infer<typeof DeleteWorkerGovernmentsRequestSchema>;

export const DeleteWorkerGovernmentsQuerySchema = z.object({
  all: z.coerce.boolean().optional(),
});
export type DeleteWorkerGovernmentsQueryDTO = z.infer<typeof DeleteWorkerGovernmentsQuerySchema>;

export const GetWorkerVerificationSchema = z.object({
  id: UUIDSchema,
  workerProfileId: UUIDSchema,
  reason: z.string(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], `status must be one of: ${["PENDING", "APPROVED", "REJECTED"].join(', ')}`),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const AddWorkerSpecializationsRequestSchema = z.object({
  specializationsTree: SpecializationsTreeCreateSchema,
});
export type AddWorkerSpecializationsRequestDTO = z.infer<typeof AddWorkerSpecializationsRequestSchema>;

export const DeleteWorkerSpecializationsRequestSchema = z.object({
  specializationsTree: SpecializationsTreeDeleteSchema.optional(),
  mainSpecializationIds: z.array(UUIDSchema).optional(),
});
export type DeleteWorkerSpecializationsRequestDTO = z.infer<typeof DeleteWorkerSpecializationsRequestSchema>;

export const DeleteWorkerSpecializationsQuerySchema = z.object({
  all: z.coerce.boolean().optional(),
});
export type DeleteWorkerSpecializationsQueryDTO = z.infer<typeof DeleteWorkerSpecializationsQuerySchema>;

export const CreatePortfolioRequestSchema = z.object({
  description: z.string().optional(),
});

export type CreatePortfolioRequestDTO = z.infer<typeof CreatePortfolioRequestSchema>;

export const UpdatePortfolioRequestSchema = z.object({
  description: z.string().optional(),
});

export type UpdatePortfolioRequestDTO = z.infer<typeof UpdatePortfolioRequestSchema>;

  export const GetWorkerSpecializationsTreeQuerySchema = createQuerySchema(WorkerProfileFilterSchema);
export type GetWorkerSpecializationsTreeQueryDTO = z.infer<typeof GetWorkerSpecializationsTreeQuerySchema>;
export const GetWorkerSpecializationsTreeParamsSchema = z.object({
  id: UUIDSchema,
});
export type GetWorkerSpecializationsTreeParamsDTO = z.infer<typeof GetWorkerSpecializationsTreeParamsSchema>;

export const GetWorkerSpecializationsQuerySchema = createQuerySchema(WorkerProfileFilterSchema);
export type GetWorkerSpecializationsQueryDTO = z.infer<typeof GetWorkerSpecializationsQuerySchema>;

export const ClientProfileQuerySchema = createQuerySchema(ClientProfileFilterSchema);
export type ClientProfileQuery = z.infer<typeof ClientProfileQuerySchema>;

export const WorkerProfileQuerySchema = createQuerySchema(WorkerProfileFilterSchema);
export type WorkerProfileQuery = z.infer<typeof WorkerProfileQuerySchema>;

// getUser Schemas
export const GetUserRequestSchema = EmptySchema;
export type GetUserRequestDTO = EmptyObjectDTO;

export const GetUserQuerySchema = EmptySchema;
export type GetUserQueryDTO = EmptyObjectDTO;

export const GetUserParamsSchema = EmptySchema;
export type GetUserParamsDTO = EmptyObjectDTO;

// updateUser Schemas
export const UpdateUserQuerySchema = EmptySchema;
export type UpdateUserQueryDTO = EmptyObjectDTO;

export const UpdateUserParamsSchema = EmptySchema;
export type UpdateUserParamsDTO = EmptyObjectDTO;

// createWorkerProfile Schemas
export const CreateWorkerProfileQuerySchema = EmptySchema;
export type CreateWorkerProfileQueryDTO = EmptyObjectDTO;

export const CreateWorkerProfileParamsSchema = EmptySchema;
export type CreateWorkerProfileParamsDTO = EmptyObjectDTO;

// getVerification Schemas
export const GetVerificationRequestSchema = EmptySchema;
export type GetVerificationRequestDTO = EmptyObjectDTO;

export const GetVerificationQuerySchema = EmptySchema;
export type GetVerificationQueryDTO = EmptyObjectDTO;

export const GetVerificationParamsSchema = EmptySchema;
export type GetVerificationParamsDTO = EmptyObjectDTO;

// resubmitVerification Schemas
export const ResubmitVerificationRequestSchema = EmptySchema;
export type ResubmitVerificationRequestDTO = EmptyObjectDTO;

export const ResubmitVerificationQuerySchema = EmptySchema;
export type ResubmitVerificationQueryDTO = EmptyObjectDTO;

export const ResubmitVerificationParamsSchema = EmptySchema;
export type ResubmitVerificationParamsDTO = EmptyObjectDTO;

// createPortfolio Schemas
export const CreatePortfolioQuerySchema = EmptySchema;
export type CreatePortfolioQueryDTO = EmptyObjectDTO;

export const CreatePortfolioParamsSchema = EmptySchema;
export type CreatePortfolioParamsDTO = EmptyObjectDTO;

// getPortfolio Schemas
export const GetPortfolioRequestSchema = EmptySchema;
export type GetPortfolioRequestDTO = EmptyObjectDTO;

export const GetPortfolioQuerySchema = EmptySchema;
export type GetPortfolioQueryDTO = EmptyObjectDTO;

export const GetPortfolioParamsSchema = EmptySchema;
export type GetPortfolioParamsDTO = EmptyObjectDTO;

// updatePortfolio Schemas
export const UpdatePortfolioQuerySchema = EmptySchema;
export type UpdatePortfolioQueryDTO = EmptyObjectDTO;

export const UpdatePortfolioParamsSchema = EmptySchema;
export type UpdatePortfolioParamsDTO = EmptyObjectDTO;

// addPortfolioImages Schemas
export const AddPortfolioImagesRequestSchema = EmptySchema;
export type AddPortfolioImagesRequestDTO = EmptyObjectDTO;

export const AddPortfolioImagesQuerySchema = EmptySchema;
export type AddPortfolioImagesQueryDTO = EmptyObjectDTO;

export const AddPortfolioImagesParamsSchema = EmptySchema;
export type AddPortfolioImagesParamsDTO = EmptyObjectDTO;

// deletePortfolioImage Schemas
export const DeletePortfolioImageRequestSchema = EmptySchema;
export type DeletePortfolioImageRequestDTO = EmptyObjectDTO;

export const DeletePortfolioImageQuerySchema = EmptySchema;
export type DeletePortfolioImageQueryDTO = EmptyObjectDTO;

// getWorkerOccupiedTimeSlots Schemas
export const GetWorkerOccupiedTimeSlotsRequestSchema = EmptySchema;
export type GetWorkerOccupiedTimeSlotsRequestDTO = EmptyObjectDTO;

export const GetWorkerOccupiedTimeSlotsQuerySchema = GetOccupiedTimeSlotsQuerySchema;
export type GetWorkerOccupiedTimeSlotsQueryDTO = GetOccupiedTimeSlotsQueryDTO;

export const GetWorkerOccupiedTimeSlotsParamsSchema = EmptySchema;
export type GetWorkerOccupiedTimeSlotsParamsDTO = EmptyObjectDTO;

// getWorkerProfile Schemas
export const GetWorkerProfileRequestSchema = EmptySchema;
export type GetWorkerProfileRequestDTO = EmptyObjectDTO;

export const GetWorkerProfileQuerySchema = EmptySchema;
export type GetWorkerProfileQueryDTO = EmptyObjectDTO;

export const GetWorkerProfileParamsSchema = EmptySchema;
export type GetWorkerProfileParamsDTO = EmptyObjectDTO;

// getWorkerOrdersStatistics Schemas
export const GetWorkerOrdersStatisticsRequestSchema = EmptySchema;
export type GetWorkerOrdersStatisticsRequestDTO = EmptyObjectDTO;

export const GetWorkerOrdersStatisticsQuerySchema = EmptySchema;
export type GetWorkerOrdersStatisticsQueryDTO = EmptyObjectDTO;

export const GetWorkerOrdersStatisticsParamsSchema = EmptySchema;
export type GetWorkerOrdersStatisticsParamsDTO = EmptyObjectDTO;

// getWorkerWorkingHours Schemas
export const GetWorkerWorkingHoursRequestSchema = EmptySchema;
export type GetWorkerWorkingHoursRequestDTO = EmptyObjectDTO;

export const GetWorkerWorkingHoursQuerySchema = EmptySchema;
export type GetWorkerWorkingHoursQueryDTO = EmptyObjectDTO;

// addWorkerDaysWorkingHours Schemas
export const AddWorkerDaysWorkingHoursQuerySchema = EmptySchema;
export type AddWorkerDaysWorkingHoursQueryDTO = EmptyObjectDTO;

export const AddWorkerDaysWorkingHoursParamsSchema = EmptySchema;
export type AddWorkerDaysWorkingHoursParamsDTO = EmptyObjectDTO;

// removeWorkerWorkingDays Schemas
export const RemoveWorkerWorkingDaysQuerySchema = EmptySchema;
export type RemoveWorkerWorkingDaysQueryDTO = EmptyObjectDTO;

export const RemoveWorkerWorkingDaysParamsSchema = EmptySchema;
export type RemoveWorkerWorkingDaysParamsDTO = EmptyObjectDTO;

// updateWorkerProfile Schemas
export const UpdateWorkerProfileQuerySchema = EmptySchema;
export type UpdateWorkerProfileQueryDTO = EmptyObjectDTO;

export const UpdateWorkerProfileParamsSchema = EmptySchema;
export type UpdateWorkerProfileParamsDTO = EmptyObjectDTO;

// getWorkerGovernments Schemas
export const GetWorkerGovernmentsRequestSchema = EmptySchema;
export type GetWorkerGovernmentsRequestDTO = EmptyObjectDTO;

export const GetWorkerGovernmentFilterSchema = GovernmentFilterSchema;
export const GetWorkerGovernmentsQuerySchema = createQuerySchema(GetWorkerGovernmentFilterSchema);
export type GetWorkerGovernmentsQueryDTO = z.infer<typeof GetWorkerGovernmentsQuerySchema>;

export const GetWorkerGovernmentsParamsSchema = EmptySchema;
export type GetWorkerGovernmentsParamsDTO = EmptyObjectDTO;

// addWorkerGovernments Schemas
export const AddWorkerGovernmentsQuerySchema = EmptySchema;
export type AddWorkerGovernmentsQueryDTO = EmptyObjectDTO;

export const AddWorkerGovernmentsParamsSchema = EmptySchema;
export type AddWorkerGovernmentsParamsDTO = EmptyObjectDTO;

// deleteWorkerGovernments Schemas
export const DeleteWorkerGovernmentsParamsSchema = EmptySchema;
export type DeleteWorkerGovernmentsParamsDTO = EmptyObjectDTO;

// getWorkerSpecializationsTree Schemas
export const GetWorkerSpecializationsTreeRequestSchema = EmptySchema;
export type GetWorkerSpecializationsTreeRequestDTO = EmptyObjectDTO;

// getWorkerSpecializations Schemas
export const GetWorkerSpecializationsRequestSchema = z.object({
  specializationIds: z.array(UUIDSchema).optional(),
});
export type GetWorkerSpecializationsRequestDTO = z.infer<typeof GetWorkerSpecializationsRequestSchema>;

export const GetWorkerSpecializationsParamsSchema = EmptySchema;
export type GetWorkerSpecializationsParamsDTO = EmptyObjectDTO;

// addWorkerSpecializations Schemas
export const AddWorkerSpecializationsQuerySchema = EmptySchema;
export type AddWorkerSpecializationsQueryDTO = EmptyObjectDTO;

export const AddWorkerSpecializationsParamsSchema = EmptySchema;
export type AddWorkerSpecializationsParamsDTO = EmptyObjectDTO;

// deleteWorkerSpecializations Schemas
export const DeleteWorkerSpecializationsParamsSchema = EmptySchema;
export type DeleteWorkerSpecializationsParamsDTO = EmptyObjectDTO;

// createClientProfile Schemas
export const CreateClientProfileQuerySchema = EmptySchema;
export type CreateClientProfileQueryDTO = EmptyObjectDTO;

export const CreateClientProfileParamsSchema = EmptySchema;
export type CreateClientProfileParamsDTO = EmptyObjectDTO;

// getClientProfile Schemas
export const GetClientProfileRequestSchema = EmptySchema;
export type GetClientProfileRequestDTO = EmptyObjectDTO;

export const GetClientProfileQuerySchema = EmptySchema;
export type GetClientProfileQueryDTO = EmptyObjectDTO;

export const GetClientProfileParamsSchema = EmptySchema;
export type GetClientProfileParamsDTO = EmptyObjectDTO;

// getUserLocations Schemas
export const GetUserLocationsRequestSchema = EmptySchema;
export type GetUserLocationsRequestDTO = EmptyObjectDTO;

export const GetUserLocationsQuerySchema = EmptySchema;
export type GetUserLocationsQueryDTO = EmptyObjectDTO;

export const GetUserLocationsParamsSchema = EmptySchema;
export type GetUserLocationsParamsDTO = EmptyObjectDTO;

// addUserLocation Schemas
export const AddUserLocationQuerySchema = EmptySchema;
export type AddUserLocationQueryDTO = EmptyObjectDTO;

export const AddUserLocationParamsSchema = EmptySchema;
export type AddUserLocationParamsDTO = EmptyObjectDTO;

// updateUserLocation Schemas
export const UpdateUserLocationQuerySchema = EmptySchema;
export type UpdateUserLocationQueryDTO = EmptyObjectDTO;

// deleteUserLocation Schemas
export const DeleteUserLocationRequestSchema = EmptySchema;
export type DeleteUserLocationRequestDTO = EmptyObjectDTO;

export const DeleteUserLocationQuerySchema = EmptySchema;
export type DeleteUserLocationQueryDTO = EmptyObjectDTO;
