/**
 * @fileoverview Auth Zod schemas
 * Replaces: src/validators/auth.js
 * Place at: src/schemas/auth.schema.ts
 */

import { z } from 'zod';
import {
  EgyptianPhoneSchema,
  OTPCodeSchema,
  OTPMethodSchema,
  UserDataSchema,
  ClientProfileSchema,
  WorkerProfileSchema,
  createQuerySchema,
} from './common.js';

// ============================================
// Auth schemas
// ============================================

export const RequestOTPSchema = z.object({
  phoneNumber: EgyptianPhoneSchema,
  method: OTPMethodSchema,
});
export type RequestOTPDTO = z.infer<typeof RequestOTPSchema>;

export const VerifyOTPSchema = z.object({
  phoneNumber: EgyptianPhoneSchema,
  otp: OTPCodeSchema,
  method: OTPMethodSchema,
});
export type VerifyOTPDTO = z.infer<typeof VerifyOTPSchema>;

// Register schemas — token and deviceId come from headers,
// handled separately in middleware. These cover the body.
export const RegisterClientSchema = z.object({
  userData: UserDataSchema,
  clientProfile: ClientProfileSchema,
  // personal_image validated in multer middleware — not in body schema
});
export type RegisterClientDTO = z.infer<typeof RegisterClientSchema>;

export const RegisterWorkerSchema = z.object({
  userData: UserDataSchema,
  workerProfile: WorkerProfileSchema,
  // personal_image, id_image, personal_with_id_image — validated in multer middleware
});
export type RegisterWorkerDTO = z.infer<typeof RegisterWorkerSchema>;

// Login, logout, token refresh — body is empty.
// Token comes from Authorization header, deviceId from x-device-fingerprint.
// These are validated in auth middleware, not in a body schema.
// No body schema needed for: validateLogin, validateLogout,
// validateReviewStatus, validateGenerateAccessToken.

// ============================================
// Admin query schemas — replaces SESSIONS_QUERY_CONFIG / USERS_QUERY_CONFIG
// ============================================

export const SESSIONS_QUERY_CONFIG = {
  allowedFilterFields: ['userId', 'deviceId', 'isRevoked'],
  filterFieldTypes: {
    userId: { type: 'uuid' as const },
    deviceId: { type: 'string' as const, minLength: 1, maxLength: 255 },
    isRevoked: { type: 'boolean' as const },
  },
  allowedOrderByFields: ['createdAt', 'lastUsedAt', 'expiresAt'],
  allowedSearchFields: [],
};

export const USERS_QUERY_CONFIG = {
  allowedFilterFields: ['role', 'status', 'phoneNumber', 'governmentId', 'cityId'],
  filterFieldTypes: {
    role: { type: 'enum' as const, enumValues: ['USER', 'ADMIN', 'SUPER_ADMIN'] as [string, ...string[]] },
    status: { type: 'enum' as const, enumValues: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'] as [string, ...string[]] },
    phoneNumber: { type: 'string' as const, minLength: 10, maxLength: 15 },
    governmentId: { type: 'uuid' as const },
    cityId: { type: 'uuid' as const },
  },
  allowedOrderByFields: ['createdAt', 'updatedAt', 'firstName', 'lastName', 'phoneNumber'],
  allowedSearchFields: ['firstName', 'lastName', 'phoneNumber'],
};

export const SessionsQuerySchema = createQuerySchema(SESSIONS_QUERY_CONFIG);
export type SessionsQuery = z.infer<typeof SessionsQuerySchema>;

export const UsersQuerySchema = createQuerySchema(USERS_QUERY_CONFIG);
export type UsersQuery = z.infer<typeof UsersQuerySchema>;
