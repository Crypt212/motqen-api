import { z } from '../../libs/zod.js';

import { SuccessResponseSchema, MessageOnlyResponseSchema } from "../responses.js";
import {
} from '../common.js';
import { UserViewSchema } from '../entities/user.js';
import { ClientProfileViewSchema } from '../entities/clientProfile.js';
import { WorkerProfileViewSchema } from '../entities/workerProfile.js';


export const RequestOTPResponseSchema = SuccessResponseSchema(z.object({
  phoneNumber: z.string().describe("e.g. '+201234567890'"),
  method: z.string().describe("e.g. 'SMS'"),
  cooldown: z.number().int().describe('Seconds before next request allowed'),
}),);

export type RequestOTPResponseDTO = z.infer<typeof RequestOTPResponseSchema>;

export const VerifyOTPResponseSchema = SuccessResponseSchema(z.object({
  tokenType: z.enum(['login', 'register']),
  token: z.string().describe("e.g. 'eyJhbGciOiJI...'"),
  isWorker: z.boolean(),
  isWorkerSignedUp: z.boolean(),
}),);
export type VerifyOTPResponseDTO = z.infer<typeof VerifyOTPResponseSchema>;

export const LoginResponseSchema = SuccessResponseSchema(z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserViewSchema,
}),);
export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>;

export const AccessTokenResponseSchema = SuccessResponseSchema(z.object({
  accessToken: z.string(),
}),);
export type AccessTokenResponseDTO = z.infer<typeof AccessTokenResponseSchema>;

export const ReviewStatusResponseSchema = SuccessResponseSchema(z.object({
  reason: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED'], `status must be one of: ${['PENDING', 'APPROVED', 'REJECTED'].join(', ')}`),
}),);
export type ReviewStatusResponseDTO = z.infer<typeof ReviewStatusResponseSchema>;

export const RegisterClientResponseSchema = SuccessResponseSchema(
  z.object({
    user: UserViewSchema,
    clientProfile: ClientProfileViewSchema.describe('ClientProfile object'),
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);
export type RegisterClientResponseDTO = z.infer<typeof RegisterClientResponseSchema>;

export const RegisterWorkerResponseSchema = SuccessResponseSchema(
  z.object({
    user: UserViewSchema,
    workerProfile: WorkerProfileViewSchema.describe('WorkerProfile object'),
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);
export type RegisterWorkerResponseDTO = z.infer<typeof RegisterWorkerResponseSchema>;

export const LogoutResponseSchema = MessageOnlyResponseSchema;
export type LogoutResponseDTO = z.infer<typeof LogoutResponseSchema>;

export const GenerateAccessTokenResponseSchema = AccessTokenResponseSchema;
export type GenerateAccessTokenResponseDTO = z.infer<typeof GenerateAccessTokenResponseSchema>;

export const UpdateFcmTokenResponseSchema = MessageOnlyResponseSchema;
export type UpdateFcmTokenResponseDTO = z.infer<typeof UpdateFcmTokenResponseSchema>;
