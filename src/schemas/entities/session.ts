import { z } from 'src/libs/zod.js';
import { createFilterMetadata, UUIDSchema } from '../common.js';


export const SessionViewSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,

  token: z.string(),
  isRevoked: z.boolean(),
  revokedAt: z.date().nullable(),
  revokedBy: z.string().nullable(),
  deviceId: z.string(),
  fcmToken: z.string().nullable(),
  lastUsedAt: z.date(),
  expiresAt: z.date(),
  updatedAt: z.date(),
  createdAt: z.date(),
});

export const SessionCreateSchema = SessionViewSchema.omit({ id: true, createdAt: true, updatedAt: true, revokedAt: true, revokedBy: true });

export const SessionUpdateSchema = SessionCreateSchema.partial();

export const SessionFilterSchema = createFilterMetadata(
  {
    id: UUIDSchema,
    userId: UUIDSchema,
    deviceId: z.string(),
    token: z.string(),
  },
  {
    sortableFields: ['userId', 'id']
  }
);
