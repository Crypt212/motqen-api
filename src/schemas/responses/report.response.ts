import { z } from '../../libs/zod.js';
import { SuccessResponseSchema } from '../responses.js';

export const ReportObjectSchema = z.object({
  id: z.string().uuid(),
  reporterId: z.string().uuid(),
  targetType: z.enum(['ORDER', 'CHAT_MESSAGE', 'WORKER_PROFILE', 'CLIENT_PROFILE']),
  targetId: z.string(),
  contextOrderId: z.string().uuid().nullable().optional(),
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
  resolvedBy: z.string().uuid().nullable().optional(),
  retainUntil: z.date().nullable().optional(),
  images: z.array(z.string().url()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ReportResponseSchema = SuccessResponseSchema(
  z.object({
    report: ReportObjectSchema,
  }),
);

export const PaginatedReportsResponseSchema = SuccessResponseSchema(
  z.object({
    reports: z.array(ReportObjectSchema),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  }),
);
