import { z } from 'zod';

const BaseSuccessResponse = z.object({
  status: z.literal('success'),
  message: z.string(),
});

export const UserObjectSchema = z.object({
  id: z.string().uuid(),
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

export const RequestOTPResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    phone: z.string(),
  }),
});

export const VerifyOTPResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    accessToken: z.string().optional(),
    user: UserObjectSchema.optional(),
    isRegistered: z.boolean(),
    reviewStatus: z.string().optional(),
  }),
});

export const RegisterResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    accessToken: z.string(),
    user: UserObjectSchema,
  }),
});

export const LoginResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    accessToken: z.string(),
    user: UserObjectSchema,
  }),
});

export const AccessTokenResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    accessToken: z.string(),
  }),
});

export const ReviewStatusResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    reviewStatus: z.string(),
  }),
});
