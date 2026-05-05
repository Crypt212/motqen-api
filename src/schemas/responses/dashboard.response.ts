import { z } from 'zod';

import { SuccessResponseSchema } from "../responses.js";


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
