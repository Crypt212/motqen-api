/**
 * @fileoverview Dashboard Zod schemas
 */

import { z } from '../libs/zod.js';
import {
  UUIDSchema,
  UserDataOptionalSchema,
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
// Worker profile schemas
// ============================================

// GET, DELETE — no body
export const CreateWorkerProfileSchema = WorkerProfileSchema;
export type CreateWorkerProfileDTO = z.infer<typeof CreateWorkerProfileSchema>;

export const UpdateWorkerProfileSchema = WorkerProfileOptionalSchema;
export type UpdateWorkerProfileDTO = z.infer<typeof UpdateWorkerProfileSchema>;

// ============================================
// Client profile schemas
// ============================================

// GET, DELETE — no body
export const CreateClientProfileSchema = ClientProfileSchema;
export type CreateClientProfileDTO = z.infer<typeof CreateClientProfileSchema>;

export const UpdateClientProfileSchema = ClientProfileOptionalSchema;
export type UpdateClientProfileDTO = z.infer<typeof UpdateClientProfileSchema>;

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
