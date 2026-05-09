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
    phone: z.string(),
  }),);

export const VerifyOTPResponseSchema = SuccessResponseSchema(z.object({
    accessToken: z.string().optional(),
    user: UserObjectSchema.optional(),
    isRegistered: z.boolean(),
    reviewStatus: z.string().optional(),
  }),);

export const RegisterResponseSchema = SuccessResponseSchema(z.object({
    accessToken: z.string(),
    user: UserObjectSchema,
  }),);

export const LoginResponseSchema = SuccessResponseSchema(z.object({
    accessToken: z.string(),
    user: UserObjectSchema,
  }),);

export const AccessTokenResponseSchema = SuccessResponseSchema(z.object({
    accessToken: z.string(),
  }),);

export const ReviewStatusResponseSchema = SuccessResponseSchema(z.object({
    reviewStatus: z.string(),
  }),);
