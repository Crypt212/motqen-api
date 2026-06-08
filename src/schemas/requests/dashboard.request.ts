import { z } from '../../libs/zod.js';
import {
  UUIDSchema,
  UserDataOptionalSchema,
  LocationSchema,
  LocationOptionalSchema,
  ClientProfileSchema,
  ClientProfileOptionalSchema,
  WorkGovernmentsSchema,
  createQuerySchema,
  buildFilterSchema,
  SpecializationsTreeSchema,
} from '../common.js';
import { WorkerProfileFilterDescriptor } from '../../domain/workerProfile.entity.js';
import { ClientProfileFilterDescriptor } from '../../domain/clientProfile.entity.js';
import { DayOfWeekSchema, DaysWorkingHoursSchema } from './worker-profile.request.js';

export const UpdateUserSchema = UserDataOptionalSchema;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;

export const CreateClientProfileSchema = z.object({
  clientProfile: ClientProfileSchema,
});
export type CreateClientProfileDTO = z.infer<typeof CreateClientProfileSchema>;

export const UpdateClientProfileSchema = ClientProfileOptionalSchema;
export type UpdateClientProfileDTO = z.infer<typeof UpdateClientProfileSchema>;

const Time24HourSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format');

export const AddDaysWorkingHoursSchema = z.object({
  schedules: DaysWorkingHoursSchema
});
export const RemoveDaysWorkingHoursSchema = z.object({
  days: z.array(DayOfWeekSchema)
});

export type SetWorkingHoursDTO = z.infer<typeof AddDaysWorkingHoursSchema>;

export const AddLocationSchema = LocationSchema;
export type AddLocationDTO = z.infer<typeof AddLocationSchema>;

export const UpdateLocationSchema = LocationOptionalSchema;
export type UpdateLocationDTO = z.infer<typeof UpdateLocationSchema>;

export const AddWorkerGovernmentsSchema = z.object({
  workGovernments: WorkGovernmentsSchema,
});
export type AddWorkerGovernmentsDTO = z.infer<typeof AddWorkerGovernmentsSchema>;

export const DeleteWorkerGovernmentsSchema = z.object({
  workGovernments: WorkGovernmentsSchema.optional(),
});
export type DeleteWorkerGovernmentsDTO = z.infer<typeof DeleteWorkerGovernmentsSchema>;

export const DeleteWorkerGovernmentsQuerySchema = z.object({
  all: z.coerce.boolean().optional(),
});

export const GetWorkerVerificationSchema = z.object({
  id: UUIDSchema,
  workerProfileId: UUIDSchema,
  reason: z.string(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], `status must be one of: ${["PENDING", "APPROVED", "REJECTED"].join(', ')}`),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const AddWorkerSpecializationsSchema = z.object({
  specializationsTree: SpecializationsTreeSchema,
});
export type AddWorkerSpecializationsDTO = z.infer<typeof AddWorkerSpecializationsSchema>;

export const DeleteWorkerSpecializationsSchema = z.object({
  specializationsTree: SpecializationsTreeSchema.optional(),
  mainSpecializationIds: z.array(UUIDSchema).optional(),
});
export type DeleteWorkerSpecializationsDTO = z.infer<typeof DeleteWorkerSpecializationsSchema>;

export const DeleteWorkerSpecializationsQuerySchema = z.object({
  all: z.coerce.boolean().optional(),
});

export const WorkerGovernmentFilterSchema = buildFilterSchema({
  governmentId: { type: 'uuid' as const },
});
export const WorkerGovernmentQuerySchema = createQuerySchema(WorkerGovernmentFilterSchema);
export type WorkerGovernmentQuery = z.infer<typeof WorkerGovernmentQuerySchema>;

export const WorkerSpecializationFilterSchema = buildFilterSchema({
  specializationId: { type: 'uuid' as const },
  mainId: { type: 'uuid' as const },
});
export const WorkerSpecializationQuerySchema = createQuerySchema(WorkerSpecializationFilterSchema);
export type WorkerSpecializationQuery = z.infer<typeof WorkerSpecializationQuerySchema>;

export const ClientProfileFilterSchema = buildFilterSchema(ClientProfileFilterDescriptor);
export const ClientProfileQuerySchema = createQuerySchema(ClientProfileFilterSchema);
export type ClientProfileQuery = z.infer<typeof ClientProfileQuerySchema>;

export const WorkerProfileFilterSchema = buildFilterSchema(WorkerProfileFilterDescriptor);
export const WorkerProfileQuerySchema = createQuerySchema(WorkerProfileFilterSchema);
export type WorkerProfileQuery = z.infer<typeof WorkerProfileQuerySchema>;
