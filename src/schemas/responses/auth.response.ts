import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";
import { UUIDSchema } from '../common.js';


export const UserObjectSchema = z.object({
  id: UUIDSchema,
  phone: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  role: z.enum(['CLIENT', 'WORKER', 'ADMIN', 'SUPER_ADMIN']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED', 'PENDING']),
  isOnline: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RequestOTPResponseSchema = SuccessResponseSchema(z.object({
    phoneNumber: z.string().describe("e.g. '+201234567890'"),
    method: z.string().describe("e.g. 'SMS'"),
    cooldown: z.number().int().describe('Seconds before next request allowed'),
  }),);

export const VerifyOTPResponseSchema = SuccessResponseSchema(z.object({
    tokenType: z.enum(['login', 'register']),
    token: z.string().describe("e.g. 'eyJhbGciOiJI...'"),
    isWorker: z.boolean().optional(),
    isWorkerSignedUp: z.boolean().optional(),
  }),);

export const RegisterResponseSchema = SuccessResponseSchema(z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: UserObjectSchema,
  }),);

export const LoginResponseSchema = SuccessResponseSchema(z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: UserObjectSchema,
  }),);

export const AccessTokenResponseSchema = SuccessResponseSchema(z.object({
    accessToken: z.string(),
  }),);

export const ReviewStatusResponseSchema = SuccessResponseSchema(z.object({
    reviewStatus: z.string(),
  }),);

export const RegisterClientResponseSchema = SuccessResponseSchema(
  z.object({
    user: UserObjectSchema,
    clientProfile: z.any().describe('ClientProfile object'),
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);

export const RegisterWorkerResponseSchema = SuccessResponseSchema(
  z.object({
    user: UserObjectSchema,
    workerProfile: z.any().describe('WorkerProfile object'),
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);
