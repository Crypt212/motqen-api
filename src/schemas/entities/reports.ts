import { z } from 'src/libs/zod.js';
import { UUIDSchema, createFilterMetadata } from '../common.js';

export const ReportObjectSchema = z.object({
  id: UUIDSchema,
  reporterId: UUIDSchema,
  targetType: z.enum(['ORDER', 'CHAT_MESSAGE', 'WORKER_PROFILE', 'CLIENT_PROFILE']),
  targetId: z.string().nullable(),
  contextOrderId: UUIDSchema.nullable(),
  conversationId: UUIDSchema.nullable(),
  problemCategory: z.enum(['ORDER_ISSUE', 'WORKER_CONDUCT', 'CLIENT_CONDUCT', 'CHAT_MESSAGE', 'OTHER']),
  problemType: z.enum([
    'UNFINISHED_WORK',
    'PAYMENT_DISPUTE',
    'NO_SHOW',
    'PROPERTY_DAMAGE',
    'UNPROFESSIONAL_BEHAVIOR',
    'FRAUD',
    'PAYMENT_FRAUD',
    'UNREASONABLE_DEMANDS',
    'SPAM',
    'INAPPROPRIATE_CONTENT',
    'HARASSMENT',
    'OTHER',
  ]),
  description: z.string(),
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'CANCELLED']),
  resolvedBy: UUIDSchema.nullable(),
  retainUntil: z.date().nullable(),
  images: z.array(z.string().url()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ReportObjectCreateSchema = z.object({
  id: UUIDSchema,
  reporterId: UUIDSchema,
  targetType: z.enum(['ORDER', 'CHAT_MESSAGE', 'WORKER_PROFILE', 'CLIENT_PROFILE']),
  targetId: z.string().optional(),
  contextOrderId: UUIDSchema.optional(),
  conversationId: UUIDSchema.optional(),
  problemCategory: z.enum(['ORDER_ISSUE', 'WORKER_CONDUCT', 'CLIENT_CONDUCT', 'CHAT_MESSAGE', 'OTHER']),
  problemType: z.enum([
    'UNFINISHED_WORK',
    'PAYMENT_DISPUTE',
    'NO_SHOW',
    'PROPERTY_DAMAGE',
    'UNPROFESSIONAL_BEHAVIOR',
    'FRAUD',
    'PAYMENT_FRAUD',
    'UNREASONABLE_DEMANDS',
    'SPAM',
    'INAPPROPRIATE_CONTENT',
    'HARASSMENT',
    'OTHER',
  ]),
  description: z.string(),
  images: z.array(z.string().url()),
});

export const ReportFilterSchema = createFilterMetadata(
  {
    id: UUIDSchema,
    reporterId: UUIDSchema,
    contextOrderId: UUIDSchema,
    conversationId: UUIDSchema,
    targetType: z.enum(['ORDER', 'CHAT_MESSAGE', 'WORKER_PROFILE', 'CLIENT_PROFILE']),
    targetId: UUIDSchema,
    status: z.enum(['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'CANCELLED']),
    problemCategory: z.enum(['ORDER_ISSUE', 'WORKER_CONDUCT', 'CLIENT_CONDUCT', 'CHAT_MESSAGE', 'OTHER']),
    createdAt: z.coerce.date(),
  },
  {
    sortableFields: ['createdAt'],
  }
);

