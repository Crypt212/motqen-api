import { z } from '../../libs/zod.js';

import { SuccessResponseSchema } from "../responses.js";
import { UUIDSchema } from '../common.js';


export const UserObjectSchema = z.object({
  id: UUIDSchema,
  phoneNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']),
  isOnline: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RequestOTPResponseSchema = SuccessResponseSchema(z.object({
  phoneNumber: z.string().describe("e.g. '+201234567890'"),
  method: z.string().describe("e.g. 'SMS'"),
  cooldown: z.number().int().describe('Seconds before next request allowed'),
}),);

export type RequestOTPResponseDTO = z.infer<typeof RequestOTPResponseSchema>;

export const VerifyOTPResponseSchema = SuccessResponseSchema(z.object({
  tokenType: z.enum(['login', 'register']),
  token: z.string().describe("e.g. 'eyJhbGciOiJI...'"),
  isWorker: z.boolean().optional(),
  isWorkerSignedUp: z.boolean().optional(),
}),);
export type VerifyOTPResponseDTO = z.infer<typeof VerifyOTPResponseSchema>;

export const RegisterResponseSchema = SuccessResponseSchema(z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserObjectSchema,
}),);
export type RegisterResponseDTO = z.infer<typeof RegisterResponseSchema>;

export const LoginResponseSchema = SuccessResponseSchema(z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserObjectSchema,
}),);
export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>;

export const AccessTokenResponseSchema = SuccessResponseSchema(z.object({
  accessToken: z.string(),
}),);
export type AccessTokenResponseDTO = z.infer<typeof AccessTokenResponseSchema>;

export const ReviewStatusResponseSchema = SuccessResponseSchema(z.object({
  reason: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED'], `status must be one of: ${['PENDING', 'APPROVED', 'REJECTED'].join(', ')}`).optional(),
}),);
export type ReviewStatusResponseDTO = z.infer<typeof ReviewStatusResponseSchema>;

export const RegisterClientResponseSchema = SuccessResponseSchema(
  z.object({
    user: UserObjectSchema,
    clientProfile: z.any().describe('ClientProfile object'),
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);
export type RegisterClientResponseDTO = z.infer<typeof RegisterClientResponseSchema>;

export const RegisterWorkerResponseSchema = SuccessResponseSchema(
  z.object({
    user: UserObjectSchema,
    workerProfile: z.any().describe('WorkerProfile object'),
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);
export type RegisterWorkerResponseDTO = z.infer<typeof RegisterWorkerResponseSchema>;
