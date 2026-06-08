import { z } from '../../libs/zod.js';
import { SuccessResponseSchema } from '../responses.js';
import { UUIDSchema } from '../common.js';
import { GovernmentObjectSchema } from './government.response.js';
import { SpecializationObjectSchema } from './specialization.response.js';

/**
 * Base User Information
 */
export const UserBasicInfoSchema = z.object({
  id: UUIDSchema,
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  profileImageUrl: z.string().url().nullable().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']),
  isOnline: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Worker-specific information for listing
 */
export const WorkerListingInfoSchema = z.object({
  workerProfileId: UUIDSchema,
  rate: z.number().nullable().optional(),
  ratingCount: z.number().nullable().optional(),
  completedJobsCount: z.number().nullable().optional(),
  verificationStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).nullable().optional(),
  experienceYears: z.number().nullable().optional(),
  acceptsUrgentJobs: z.boolean().nullable().optional(),
});

/**
 * Client-specific information for listing
 */
export const ClientListingInfoSchema = z.object({
  clientProfileId: UUIDSchema,
});

/**
 * User Listing Item (merged with role-specific info)
 */
export const UserListingItemSchema = UserBasicInfoSchema.extend({
  userType: z.enum(['CLIENT', 'WORKER']),
  workerProfile: WorkerListingInfoSchema.nullable().optional(),
  clientProfile: ClientListingInfoSchema.nullable().optional(),
});

/**
 * Users Listing Response
 */
export const AdminUsersListingResponseSchema = SuccessResponseSchema(
  z.object({
    users: z.array(UserListingItemSchema),
    pagination: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      total: z.number(),
      totalPages: z.number().optional(),
      hasNext: z.boolean().optional(),
      hasPrev: z.boolean().optional(),
    }).optional(),
  })
);

/**
 * Verification Information
 */
export const VerificationInfoSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  idWithPersonalImageUrl: z.string().url().nullable().optional(),
  idDocumentUrl: z.string().url().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  rejectionNote: z.string().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

/**
 * Portfolio Information
 */
export const PortfolioImageSchema = z.object({
  id: UUIDSchema,
  imageUrl: z.string().url(),
  createdAt: z.date(),
});

export const PortfolioSchema = z.object({
  id: UUIDSchema,
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  projectImages: z.array(PortfolioImageSchema),
});

/**
 * Badge Information
 */
export const BadgeSchema = z.object({
  id: UUIDSchema,
  badgeType: z.string(),
  createdAt: z.date(),
});

/**
 * Location Information
 */
export const LocationInfoSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  government: GovernmentObjectSchema,
  city: z.string().nullable().optional(),
  isMain: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Financial Snapshot (for workers)
 */
export const FinancialSnapshotSchema = z.object({
  balance: z.number(),
  pendingWithdraw: z.number(),
  totalEarned: z.number(),
  withdrawn: z.number(),
});

/**
 * Active Session Information
 */
export const ActiveSessionSchema = z.object({
  id: UUIDSchema,
  deviceId: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  lastUsedAt: z.date().nullable().optional(),
  expiresAt: z.date(),
});

/**
 * Worker Profile Details
 */
export const WorkerProfileDetailsSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  experienceYears: z.number(),
  isInTeam: z.boolean(),
  acceptsUrgentJobs: z.boolean(),
  rate: z.number().nullable().optional(),
  ratingCount: z.number().nullable().optional(),
  completedJobsCount: z.number(),
  bio: z.string().nullable().optional(),
  portfolio: PortfolioSchema.nullable().optional(),
  badges: z.array(BadgeSchema),
  specializations: z.array(SpecializationObjectSchema),
  workingGovernments: z.array(GovernmentObjectSchema),
  verification: VerificationInfoSchema.nullable().optional(),
  financialSnapshot: FinancialSnapshotSchema.nullable().optional(),
});

/**
 * Client Profile Details
 */
export const ClientProfileDetailsSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
});

/**
 * Complete User Details Response
 */
export const AdminUserDetailResponseSchema = SuccessResponseSchema(
  z.object({
    user: UserBasicInfoSchema,
    userType: z.enum(['CLIENT', 'WORKER']),
    locations: z.array(LocationInfoSchema),
    mainLocation: LocationInfoSchema.nullable().optional(),
    workerProfile: WorkerProfileDetailsSchema.nullable().optional(),
    clientProfile: ClientProfileDetailsSchema.nullable().optional(),
    activeSessions: z.array(ActiveSessionSchema).optional(),
  })
);

/**
 * User Created Response
 */
export const UserCreatedResponseSchema = SuccessResponseSchema(
  z.object({
    user: UserBasicInfoSchema.extend({
      userType: z.enum(['CLIENT', 'WORKER']),
    }),
  })
);

/**
 * User Updated Response
 */
export const UserUpdatedResponseSchema = SuccessResponseSchema(
  z.object({
    user: UserBasicInfoSchema,
  })
);

/**
 * User Status Change Response
 */
export const UserStatusChangeResponseSchema = SuccessResponseSchema(
  z.object({
    user: UserBasicInfoSchema,
    action: z.enum(['SUSPENDED', 'BANNED', 'ACTIVATED']),
  })
);

/**
 * User Activity Items
 */
export const UserActivitySchema = z.object({
  type: z.enum(['ORDER', 'DISPUTE', 'REPORT', 'WITHDRAWAL', 'NOTIFICATION', 'MODERATION']),
  id: UUIDSchema,
  description: z.string(),
  status: z.string().optional(),
  createdAt: z.date(),
});

/**
 * User Activity Response
 */
export const UserActivityResponseSchema = SuccessResponseSchema(
  z.object({
    activities: z.array(UserActivitySchema),
    pagination: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      total: z.number(),
      totalPages: z.number().optional(),
      hasNext: z.boolean().optional(),
      hasPrev: z.boolean().optional(),
    }).optional(),
  })
);

/**
 * Day Working Hours
 */
export const DayWorkingHoursSchema = z.object({
  id: UUIDSchema.nullable().optional(),
  workerProfileId: UUIDSchema,
  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startTime: z.string(), // HH:mm format
  endTime: z.string(), // HH:mm format
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Working Hours List Response
 */
export const WorkingHoursListResponseSchema = SuccessResponseSchema(
  z.object({
    workingHours: z.array(DayWorkingHoursSchema),
  })
);

/**
 * Occupied Time Slot
 */
export const OccupiedTimeSlotSchema = z.object({
  id: UUIDSchema.nullable().optional(),
  workerProfileId: UUIDSchema,
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Occupied Slots List Response
 */
export const OccupiedSlotsListResponseSchema = SuccessResponseSchema(
  z.object({
    occupiedSlots: z.array(OccupiedTimeSlotSchema),
    pagination: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      total: z.number(),
      totalPages: z.number().optional(),
      hasNext: z.boolean().optional(),
      hasPrev: z.boolean().optional(),
    }).optional(),
  })
);
