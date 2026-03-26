/**
 * @fileoverview Auth Zod schemas
 */

import { z } from '../libs/zod.js';
import {
  EgyptianPhoneSchema,
  OTPCodeSchema,
  OTPMethodSchema,
  UserDataSchema,
  ClientProfileSchema,
  WorkerProfileSchema,
  createQuerySchema,
  buildFilterSchema,
} from './common.js';
import { SessionFilterDescriptor } from '../domain/session.entity.js';
import { UserFilterDescriptor } from '../domain/user.entity.js';

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

export function parseJSON() {
  return z
    .string()
    .trim()
    .transform((val: string) => JSON.parse(val));
}

// Register schemas — token and deviceId come from headers,
// handled separately in middleware. These cover the body.
export const RegisterClientSchema = z.object({
  userData: parseJSON().pipe(UserDataSchema),
  clientProfile: parseJSON().pipe(ClientProfileSchema),
  // personal_image validated in multer middleware — not in body schema
});
export type RegisterClientDTO = z.infer<typeof RegisterClientSchema>;

export const RegisterWorkerSchema = z.object({
  userData: parseJSON().pipe(UserDataSchema),
  workerProfile: parseJSON().pipe(WorkerProfileSchema),
  // personal_image, id_image, personal_with_id_image — validated in multer middleware
});
export type RegisterWorkerDTO = z.infer<typeof RegisterWorkerSchema>;

// Login, logout, token refresh — body is empty.
// Token comes from Authorization header, deviceId from x-device-fingerprint.
// These are validated in auth middleware, not in a body schema.
// No body schema needed for: validateLogin, validateLogout,
// validateReviewStatus, validateGenerateAccessToken.

export const SessionFilterSchema = buildFilterSchema(SessionFilterDescriptor);
export const SessionQuerySchema = createQuerySchema(SessionFilterSchema);
export type SessionQuery = z.infer<typeof SessionQuerySchema>;

export const UserFilterSchema = buildFilterSchema(UserFilterDescriptor);
export const UserQuerySchema = createQuerySchema(UserFilterSchema);
export type UserQuery = z.infer<typeof UserQuerySchema>;
