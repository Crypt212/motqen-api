import { z } from 'src/libs/zod.js';
import { createFilterMetadata, EmptySchema, UUIDSchema } from "../common.js";

export const ClientProfileViewSchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ClientProfileFilterSchema = createFilterMetadata(
  {
  id: UUIDSchema,
  userId: UUIDSchema,

  updatedAt: z.date(),
  createdAt: z.date(),
  },
  {
    sortableFields: ['id', 'userId', 'updatedAt', 'createdAt'],  // TSort — the actual sortable fields
  }
);

export const ClientProfileCreateSchema = EmptySchema;
export const ClientProfileUpdateSchema = EmptySchema;
