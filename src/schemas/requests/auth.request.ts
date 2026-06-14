import { z } from '../../libs/zod.js';
import { createQuerySchema, EgyptianPhoneSchema, OTPCodeSchema, OTPMethodSchema, EmptySchema } from '../common.js';
import { UserCreateSchema, UserFilterSchema } from '../entities/user.js';
import { WorkerProfileCreateSchema } from '../entities/workerProfile.js';
import { SessionFilterSchema } from '../entities/session.js';

export const RequestOTPRequestSchema = z.object({
  phoneNumber: EgyptianPhoneSchema,
  method: OTPMethodSchema,
});
export type RequestOTPRequestDTO = z.infer<typeof RequestOTPRequestSchema>;

export const VerifyOTPRequestSchema = z.object({
  phoneNumber: EgyptianPhoneSchema,
  otp: OTPCodeSchema,
  method: OTPMethodSchema,
});
export type VerifyOTPRequestDTO = z.infer<typeof VerifyOTPRequestSchema>;

export const RegisterClientRequestSchema = z.object({
  userData: UserCreateSchema,
});
export type RegisterClientRequestDTO = z.infer<typeof RegisterClientRequestSchema>;

export const RegisterWorkerRequestSchema = z.object({
  userData: UserCreateSchema,
  workerProfile: WorkerProfileCreateSchema,
});
export type RegisterWorkerRequestDTO = z.infer<typeof RegisterWorkerRequestSchema>;

export const UpdateFcmTokenRequestSchema = z.object({
  fcmToken: z.string().min(1),
});
export type UpdateFcmTokenRequestDTO = z.infer<typeof UpdateFcmTokenRequestSchema>;

export const SessionQuerySchema = createQuerySchema(SessionFilterSchema);
export type SessionQuery = z.infer<typeof SessionQuerySchema>;

export const UserQuerySchema = createQuerySchema(UserFilterSchema);
export type UserQuery = z.infer<typeof UserQuerySchema>;

export const RequestOTPQuerySchema = EmptySchema;
export type RequestOTPQueryDTO = z.infer<typeof RequestOTPQuerySchema>;
export const RequestOTPParamsSchema = EmptySchema;
export type RequestOTPParamsDTO = z.infer<typeof RequestOTPParamsSchema>;

export const VerifyOTPQuerySchema = EmptySchema;
export type VerifyOTPQueryDTO = z.infer<typeof VerifyOTPQuerySchema>;
export const VerifyOTPParamsSchema = EmptySchema;
export type VerifyOTPParamsDTO = z.infer<typeof VerifyOTPParamsSchema>;

export const RegisterClientQuerySchema = EmptySchema;
export type RegisterClientQueryDTO = z.infer<typeof RegisterClientQuerySchema>;
export const RegisterClientParamsSchema = EmptySchema;
export type RegisterClientParamsDTO = z.infer<typeof RegisterClientParamsSchema>;

export const RegisterWorkerQuerySchema = EmptySchema;
export type RegisterWorkerQueryDTO = z.infer<typeof RegisterWorkerQuerySchema>;
export const RegisterWorkerParamsSchema = EmptySchema;
export type RegisterWorkerParamsDTO = z.infer<typeof RegisterWorkerParamsSchema>;

export const LoginRequestSchema = EmptySchema;
export type LoginRequestDTO = z.infer<typeof LoginRequestSchema>;
export const LoginQuerySchema = EmptySchema;
export type LoginQueryDTO = z.infer<typeof LoginQuerySchema>;
export const LoginParamsSchema = EmptySchema;
export type LoginParamsDTO = z.infer<typeof LoginParamsSchema>;

export const LogoutRequestSchema = EmptySchema;
export type LogoutRequestDTO = z.infer<typeof LogoutRequestSchema>;
export const LogoutQuerySchema = EmptySchema;
export type LogoutQueryDTO = z.infer<typeof LogoutQuerySchema>;
export const LogoutParamsSchema = EmptySchema;
export type LogoutParamsDTO = z.infer<typeof LogoutParamsSchema>;

export const GenerateAccessTokenRequestSchema = EmptySchema;
export type GenerateAccessTokenRequestDTO = z.infer<typeof GenerateAccessTokenRequestSchema>;
export const GenerateAccessTokenQuerySchema = EmptySchema;
export type GenerateAccessTokenQueryDTO = z.infer<typeof GenerateAccessTokenQuerySchema>;
export const GenerateAccessTokenParamsSchema = EmptySchema;
export type GenerateAccessTokenParamsDTO = z.infer<typeof GenerateAccessTokenParamsSchema>;

export const ReviewStatusRequestSchema = EmptySchema;
export type ReviewStatusRequestDTO = z.infer<typeof ReviewStatusRequestSchema>;
export const ReviewStatusQuerySchema = EmptySchema;
export type ReviewStatusQueryDTO = z.infer<typeof ReviewStatusQuerySchema>;
export const ReviewStatusParamsSchema = EmptySchema;
export type ReviewStatusParamsDTO = z.infer<typeof ReviewStatusParamsSchema>;

export const UpdateFcmTokenQuerySchema = EmptySchema;
export type UpdateFcmTokenQueryDTO = z.infer<typeof UpdateFcmTokenQuerySchema>;
export const UpdateFcmTokenParamsSchema = EmptySchema;
export type UpdateFcmTokenParamsDTO = z.infer<typeof UpdateFcmTokenParamsSchema>;
