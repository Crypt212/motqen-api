/**
 * @fileoverview Dashboard Zod schemas
 * Replaces: src/validators/dashboard.js
 * Place at: src/schemas/dashboard.schema.ts
 */

import { z } from 'zod';
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
} from './common.js';

// ============================================
// Query configs
// ============================================

export const WORKER_GOVERNMENTS_QUERY_CONFIG = {
  allowedFilterFields: ['governmentId'],
  filterFieldTypes: { governmentId: { type: 'uuid' as const } },
  allowedOrderByFields: ['createdAt'],
  allowedSearchFields: [],
};

export const WORKER_SPECIALIZATIONS_QUERY_CONFIG = {
  allowedFilterFields: ['specializationId', 'mainId'],
  filterFieldTypes: {
    specializationId: { type: 'uuid' as const },
    mainId: { type: 'uuid' as const },
  },
  allowedOrderByFields: ['createdAt'],
  allowedSearchFields: [],
};

export const CLIENT_PROFILES_QUERY_CONFIG = {
  allowedFilterFields: ['userId', 'address'],
  filterFieldTypes: {
    userId: { type: 'uuid' as const },
    address: { type: 'string' as const, minLength: 2, maxLength: 500 },
  },
  allowedOrderByFields: ['createdAt', 'updatedAt', 'address'],
  allowedSearchFields: ['address'],
};

export const WORKER_PROFILES_QUERY_CONFIG = {
  allowedFilterFields: ['userId', 'experienceYears', 'isInTeam', 'acceptsUrgentJobs'],
  filterFieldTypes: {
    userId: { type: 'uuid' as const },
    experienceYears: { type: 'number' as const, min: 0, max: 50 },
    isInTeam: { type: 'boolean' as const },
    acceptsUrgentJobs: { type: 'boolean' as const },
  },
  allowedOrderByFields: ['createdAt', 'updatedAt', 'experienceYears'],
  allowedSearchFields: [],
};

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
export const DeleteWorkerGovernmentsParamsSchema = z.object({
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

export const DeleteWorkerSpecializationsParamsSchema = z.object({
  all: z.coerce.boolean().optional(),
  allSub: z.coerce.boolean().optional(),
});

// ============================================
// Query schemas
// ============================================

export const WorkerGovernmentsQuerySchema = createQuerySchema(WORKER_GOVERNMENTS_QUERY_CONFIG);
export type WorkerGovernmentsQuery = z.infer<typeof WorkerGovernmentsQuerySchema>;

export const WorkerSpecializationsQuerySchema = createQuerySchema(WORKER_SPECIALIZATIONS_QUERY_CONFIG);
export type WorkerSpecializationsQuery = z.infer<typeof WorkerSpecializationsQuerySchema>;

export const ClientProfilesQuerySchema = createQuerySchema(CLIENT_PROFILES_QUERY_CONFIG);
export type ClientProfilesQuery = z.infer<typeof ClientProfilesQuerySchema>;

export const WorkerProfilesQuerySchema = createQuerySchema(WORKER_PROFILES_QUERY_CONFIG);
export type WorkerProfilesQuery = z.infer<typeof WorkerProfilesQuerySchema>;
