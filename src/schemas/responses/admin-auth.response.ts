import { z } from '../../libs/zod.js';
import { SuccessResponseSchema } from '../responses.js';
import { UUIDSchema } from '../common.js';

export const AdminObjectSchema = z.object({
  id: UUIDSchema,
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  profileImageUrl: z.string().url().nullable().optional(),
  role: z.enum(['SUPER_ADMIN', 'USER_MANAGEMENT', 'FINANCIAL_MONITOR', 'ISSUES_MANAGEMENT']),
  status: z.enum(['ACTIVE', 'DISABLED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AdminLoginResponseSchema = SuccessResponseSchema(
  z.object({
    admin: AdminObjectSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);

export const AdminAccessTokenResponseSchema = SuccessResponseSchema(
  z.object({
    accessToken: z.string(),
  })
);
