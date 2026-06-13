import { z } from 'src/libs/zod.js';
import { createFilterMetadata, UUIDSchema } from '../common.js';
import { LocationMainCreateSchema } from './location.js';

export const UserViewSchema = z.object({
  id: UUIDSchema,
  phoneNumber: z.string(),
  firstName: z.string(),
  middleName: z.string().nullable(),
  lastName: z.string(),
  profileImageUrl: z.string().nullable(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']),
  lastNotificationReadAt: z.date().nullable(),
  isOnline: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserFilterSchema = createFilterMetadata(
  {
  id: UUIDSchema,
  phoneNumber: z.string(),
  },
  {
    sortableFields: ['id', 'phoneNumber'],
  }
);

export const UserUpdateSchema = z.object({
  firstName: z.string(),
  middleName: z.string(),
  lastName: z.string(),
  profileImageUrl: z.string().nullable(),
}).partial();

export const UserWithWorkerAndClientProfileIdsViewSchema = UserViewSchema.extend({
  workerProfileId: UUIDSchema.nullable(),
  clientProfileId: UUIDSchema.nullable(),
});

export const UserCreateSchema = z.object({
  firstName: z.string().trim().min(1, 'firstName is required'),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, 'lastName is required'),
  location: LocationMainCreateSchema,
});
