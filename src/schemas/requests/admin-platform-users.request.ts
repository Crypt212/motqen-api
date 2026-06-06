import { z } from '../../libs/zod.js';
import { UUIDSchema, buildFilterSchema, createQuerySchema } from '../common.js';
import { $Enums } from '../../generated/prisma/client.js';
import { UserFilterDescriptor } from '../../domain/user.entity.js';

const AccountStatus = $Enums.AccountStatus;

export const CreatePlatformUserSchema = z.object({
  firstName: z.string().trim().min(1),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1),
  phoneNumber: z.string().trim().min(1),
  role: z.enum(['CLIENT', 'WORKER']),
  status: z.nativeEnum(AccountStatus).default(AccountStatus.ACTIVE),
  profileImageUrl: z.string().url().optional(),
});

export type CreatePlatformUserDTO = z.infer<typeof CreatePlatformUserSchema>;

export const UpdateUserStatusSchema = z.object({
  status: z.nativeEnum(AccountStatus),
});

export type UpdateUserStatusDTO = z.infer<typeof UpdateUserStatusSchema>;

export const AdminUserIdParamsSchema = z.object({
  userId: UUIDSchema,
});

export const AdminUserFilterSchema = buildFilterSchema(UserFilterDescriptor);
export const AdminUserQuerySchema = createQuerySchema(AdminUserFilterSchema);
export type AdminUserQuery = z.infer<typeof AdminUserQuerySchema>;
