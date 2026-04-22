/**
 * @fileoverview Dashboard Zod schemas
 */

import { z } from '../libs/zod.js';
import {
  UUIDSchema,
  UserDataOptionalSchema,
  LocationSchema,
  LocationOptionalSchema,
  ClientProfileSchema,
  ClientProfileOptionalSchema,
  WorkerProfileSchema,
  WorkerProfileOptionalSchema,
  SpecializationsTreeSchema,
  WorkGovernmentsSchema,
  createQuerySchema,
  buildFilterSchema,
} from './common.js';
import { WorkerProfileFilterDescriptor } from '../domain/workerProfile.entity.js';
import { ClientProfileFilterDescriptor } from '../domain/clientProfile.entity.js';

// ============================================
// User schemas
// ============================================

// GET /user — no body
// UPDATE /user
export const UpdateUserSchema = UserDataOptionalSchema;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;

// ============================================
// Client profile schemas
// ============================================

// GET, DELETE — no body
export const CreateClientProfileSchema = ClientProfileSchema;
export type CreateClientProfileDTO = z.infer<typeof CreateClientProfileSchema>;

export const UpdateClientProfileSchema = ClientProfileOptionalSchema;
export type UpdateClientProfileDTO = z.infer<typeof UpdateClientProfileSchema>;
// ============================================
// Worker profile schemas
// ============================================

// GET, DELETE — no body
export const CreateWorkerProfileSchema = WorkerProfileSchema;
export type CreateWorkerProfileDTO = z.infer<typeof CreateWorkerProfileSchema>;

export const UpdateWorkerProfileSchema = WorkerProfileOptionalSchema;
export type UpdateWorkerProfileDTO = z.infer<typeof UpdateWorkerProfileSchema>;

// ============================================
// Working hours schemas
// ============================================

const Time24HourSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format');

const DaysOfWeekSchema = z.array(z.number().int().min(0).max(6)).min(1).max(7);

export const WorkingHoursSchema = z
  .object({
    daysOfWeek: DaysOfWeekSchema,
    startTime: Time24HourSchema,
    endTime: Time24HourSchema,
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });
export type WorkingHoursDTO = z.infer<typeof WorkingHoursSchema>;

export const UpdateWorkingHoursSchema = z
  .object({
    daysOfWeek: DaysOfWeekSchema.optional(),
    startTime: Time24HourSchema.optional(),
    endTime: Time24HourSchema.optional(),
  })
  .refine((data) => !data.startTime || !data.endTime || data.endTime > data.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });
export type UpdateWorkingHoursDTO = z.infer<typeof UpdateWorkingHoursSchema>;

export const SetWorkingHoursSchema = z
  .object({
    daysOfWeek: z.array(z.number().int().min(0).max(6)).max(7).default([]),
    startTime: Time24HourSchema.optional(),
    endTime: Time24HourSchema.optional(),
  })
  .refine(
    (data) => {
      // Only strictly require times if there are active days
      if (data.daysOfWeek.length > 0) {
        return !!data.startTime && !!data.endTime && data.endTime > data.startTime;
      }
      return true;
    },
    {
      message:
        'startTime and endTime are required and endTime must be after startTime if daysOfWeek is not empty',
      path: ['endTime'],
    }
  );
export type SetWorkingHoursDTO = z.infer<typeof SetWorkingHoursSchema>;

// ============================================
// Location schemas
// ============================================

export const AddLocationSchema = LocationSchema;
export type AddLocationDTO = z.infer<typeof AddLocationSchema>;

export const UpdateLocationSchema = LocationOptionalSchema;
export type UpdateLocationDTO = z.infer<typeof UpdateLocationSchema>;

// ============================================
// Worker governments schemas
// ============================================

export const AddWorkerGovernmentsSchema = z.object({
  workGovernments: WorkGovernmentsSchema,
});
export type AddWorkerGovernmentsDTO = z.infer<typeof AddWorkerGovernmentsSchema>;

export const DeleteWorkerGovernmentsSchema = z.object({
  workGovernments: WorkGovernmentsSchema.optional(),
});
export type DeleteWorkerGovernmentsDTO = z.infer<typeof DeleteWorkerGovernmentsSchema>;

// Params
export const DeleteWorkerGovernmentsQuerySchema = z.object({
  all: z.coerce.boolean().optional(),
});

// ============================================
// Worker specializations schemas
// ============================================

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

// ============================================
// Query schemas
// ============================================

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
