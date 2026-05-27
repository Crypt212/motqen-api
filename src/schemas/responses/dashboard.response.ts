import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";
import { UUIDSchema } from '../common.js';


export const UserObjectSchema = z.object({
  id: UUIDSchema,
  firstName: z.string(),
  middleName: z.string().nullable().optional(),
  lastName: z.string(),
  phoneNumber: z.string(),
  profileImageUrl: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ClientProfileObjectSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const WorkerOrdersStatisticsSchema = z.object({
  ordersCounts: z.object({
    cancelled: z.number(),
    completed: z.number(),
    pending: z.number(),
    today: z.number(),
  })
});

export const WorkerProfileObjectSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  experienceYears: z.number(),
  isInTeam: z.boolean(),
  acceptsUrgentJobs: z.boolean(),
  rate: z.number(),
  completedJobsCount: z.number(),
  ratingCount: z.number(),
  bio: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LocationObjectSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  address: z.string(),
  addressNotes: z.string().nullable().optional(),
  governmentId: UUIDSchema,
  cityId: UUIDSchema,
  long: z.number(),
  lat: z.number(),
  isMain: z.boolean(),
});

export const DashboardUserResponseSchema = SuccessResponseSchema(z.object({
  user: UserObjectSchema,
}),);

export const DashboardClientProfileResponseSchema = SuccessResponseSchema(z.object({
  clientProfile: ClientProfileObjectSchema,
}),);

export const DashboardWorkerProfileResponseSchema = SuccessResponseSchema(z.object({
  workerProfile: WorkerProfileObjectSchema,
}),);

export const DashboardLocationsResponseSchema = SuccessResponseSchema(z.object({
  locations: z.array(LocationObjectSchema),
}),);

export const DashboardLocationResponseSchema = SuccessResponseSchema(z.object({
  location: LocationObjectSchema,
}),);
