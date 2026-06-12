import { z } from '../../libs/zod.js';
import { UUIDSchema, buildFilterSchema, createQuerySchema } from '../common.js';
import { $Enums } from '../../generated/prisma/client.js';
import { UserFilterDescriptor } from '../../domain/user.entity.js';

const Role = $Enums.Role;
const AccountStatus = $Enums.AccountStatus;

/**
 * Create a new platform user
 */
export const CreatePlatformUserSchema = z.object({
  firstName: z.string().trim().min(1),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1),
  phoneNumber: z.string().trim().min(1),
  role: z.enum(['CLIENT', 'WORKER'] as const),
  status: z.nativeEnum(AccountStatus).default(AccountStatus.ACTIVE),
  profileImageUrl: z.string().url().optional(),
  // Optional worker-specific data
  experienceYears: z.number().int().min(0).optional(),
  acceptsUrgentJobs: z.boolean().optional(),
  // Optional specializations for workers
  specializationIds: z.array(UUIDSchema).optional(),
  // Optional governments for workers
  governmentIds: z.array(UUIDSchema).optional(),
});

export type CreatePlatformUserDTO = z.infer<typeof CreatePlatformUserSchema>;

/**
 * Update user profile information
 */
export const UpdatePlatformUserSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1).optional(),
  profileImageUrl: z.string().url().optional(),
  // Worker profile updates
  experienceYears: z.number().int().min(0).optional(),
  acceptsUrgentJobs: z.boolean().optional(),
  // Profile specializations for workers
  specializationIds: z.array(UUIDSchema).optional(),
  // Working governments for workers
  governmentIds: z.array(UUIDSchema).optional(),
  // Main location
  mainLocationGovernmentId: z.string().optional(),
});

export type UpdatePlatformUserDTO = z.infer<typeof UpdatePlatformUserSchema>;

/**
 * Suspend user
 */
export const SuspendUserSchema = z.object({
  reason: z.string().trim().optional(),
});

export type SuspendUserDTO = z.infer<typeof SuspendUserSchema>;

/**
 * Ban user
 */
export const BanUserSchema = z.object({
  reason: z.string().trim().optional(),
});

export type BanUserDTO = z.infer<typeof BanUserSchema>;

/**
 * User status change (legacy)
 */
export const UpdateUserStatusSchema = z.object({
  status: z.nativeEnum(AccountStatus),
});

export type UpdateUserStatusDTO = z.infer<typeof UpdateUserStatusSchema>;

/**
 * Parameters for user endpoint
 */
export const AdminUserIdParamsSchema = z.object({
  userId: UUIDSchema,
});

/**
 * Parameters for activity endpoint with pagination
 */
export const UserActivityParamsSchema = z.object({
  userId: UUIDSchema,
});

export const UserActivityQuerySchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  type: z.enum(['ORDER', 'DISPUTE', 'REPORT', 'WITHDRAWAL', 'NOTIFICATION', 'MODERATION']).optional(),
});

/**
 * Filter schema with support for user type, verification status, government, specialization
 */
export const AdminUserExtendedFilterSchema = z.object({
  // Base user filters
  search: z.string().optional(), // Will search firstName, middleName, lastName, fullName, phoneNumber
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),

  // Account and status filters
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']).optional(),
  isOnline: z.boolean().optional(),

  // User type filters
  userType: z.enum(['CLIENT', 'WORKER']).optional(),

  // Worker-specific filters
  verificationStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  governmentId: UUIDSchema.optional(),
  specializationId: UUIDSchema.optional(),

  // Pagination
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),

  // Sorting
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'phoneNumber', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type AdminUserExtendedFilter = z.infer<typeof AdminUserExtendedFilterSchema>;

/**
 * Legacy filter schema using UserFilterDescriptor
 */
export const AdminUserFilterSchema = buildFilterSchema(UserFilterDescriptor);
export const AdminUserQuerySchema = createQuerySchema(AdminUserFilterSchema);
export type AdminUserQuery = z.infer<typeof AdminUserQuerySchema>;

/**
 * Working hours management
 */
export const DayOfWeek = z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);

export const CreateWorkingHoursSchema = z.object({
  day: DayOfWeek,
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
});

export type CreateWorkingHoursDTO = z.infer<typeof CreateWorkingHoursSchema>;

export const UpdateWorkingHoursSchema = CreateWorkingHoursSchema.partial();

export type UpdateWorkingHoursDTO = z.infer<typeof UpdateWorkingHoursSchema>;

export const WorkingHoursIdParamsSchema = z.object({
  userId: UUIDSchema,
  dayOfWeek: DayOfWeek,
});

/**
 * Occupied time slots management
 */
export const CreateOccupiedSlotSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().optional(),
});

export type CreateOccupiedSlotDTO = z.infer<typeof CreateOccupiedSlotSchema>;

export const UpdateOccupiedSlotSchema = CreateOccupiedSlotSchema.partial();

export type UpdateOccupiedSlotDTO = z.infer<typeof UpdateOccupiedSlotSchema>;

export const OccupiedSlotIdParamsSchema = z.object({
  userId: UUIDSchema,
  slotId: UUIDSchema,
});
