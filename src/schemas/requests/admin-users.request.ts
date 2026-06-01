import { z } from '../../libs/zod.js';
import { AdminRole } from '../../domain/admin.entity.js';

export const CreateAdminSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().trim().min(8),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  role: z.enum(['SUPER_ADMIN', 'USER_MANAGEMENT', 'FINANCIAL_MONITOR', 'ISSUES_MANAGEMENT']),
  profileImageUrl: z.string().url().optional(),
});

export type CreateAdminDTO = z.infer<typeof CreateAdminSchema>;

export const UpdateAdminSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  role: z
    .enum(['SUPER_ADMIN', 'USER_MANAGEMENT', 'FINANCIAL_MONITOR', 'ISSUES_MANAGEMENT'])
    .optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  profileImageUrl: z.string().url().optional(),
});

export type UpdateAdminDTO = z.infer<typeof UpdateAdminSchema>;
