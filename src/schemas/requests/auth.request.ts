import { z } from '../../libs/zod.js';
import {
  EgyptianPhoneSchema,
  OTPCodeSchema,
  OTPMethodSchema,
  UserDataSchema,
  WorkerProfileSchema,
  createQuerySchema,
  buildFilterSchema,
} from '../common.js';
import { SessionFilterDescriptor } from '../../domain/session.entity.js';
import { UserFilterDescriptor } from '../../domain/user.entity.js';

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

export const RegisterClientSchema = z.object({
  userData: parseJSON().pipe(UserDataSchema),
});
export type RegisterClientDTO = z.infer<typeof RegisterClientSchema>;

export const RegisterWorkerSchema = z.object({
  userData: parseJSON().pipe(UserDataSchema),
  workerProfile: parseJSON().pipe(WorkerProfileSchema),
});
export type RegisterWorkerDTO = z.infer<typeof RegisterWorkerSchema>;

export const SessionFilterSchema = buildFilterSchema(SessionFilterDescriptor);
export const SessionQuerySchema = createQuerySchema(SessionFilterSchema);
export type SessionQuery = z.infer<typeof SessionQuerySchema>;

export const UserFilterSchema = buildFilterSchema(UserFilterDescriptor);
export const UserQuerySchema = createQuerySchema(UserFilterSchema);
export type UserQuery = z.infer<typeof UserQuerySchema>;
