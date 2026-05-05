import { z } from 'zod';

const BaseSuccessResponse = z.object({
  status: z.literal('success'),
  message: z.string(),
});

export const UserObjectSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  middleName: z.string().nullable().optional(),
  lastName: z.string(),
  phoneNumber: z.string(),
  profileImageUrl: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ClientProfileObjectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WorkerProfileObjectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  experienceYears: z.number(),
  isInTeam: z.boolean(),
  acceptsUrgentJobs: z.boolean(),
  bio: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LocationObjectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  address: z.string(),
  addressNotes: z.string().nullable().optional(),
  governmentId: z.string().uuid(),
  cityId: z.string().uuid(),
  long: z.number(),
  lat: z.number(),
  isMain: z.boolean(),
});

export const DashboardUserResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    user: UserObjectSchema,
  }),
});

export const DashboardClientProfileResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    clientProfile: ClientProfileObjectSchema,
  }),
});

export const DashboardWorkerProfileResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    workerProfile: WorkerProfileObjectSchema,
  }),
});

export const DashboardLocationsResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    locations: z.array(LocationObjectSchema),
  }),
});

export const DashboardLocationResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    location: LocationObjectSchema,
  }),
});

export const DashboardGenericResponseSchema = BaseSuccessResponse.extend({
  data: z.any(),
});
