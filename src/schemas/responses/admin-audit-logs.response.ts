import { z } from '../../libs/zod.js';
import { SuccessResponseSchema } from '../responses.js';

export const AdminAuditLogSchema = z.object({
  id: z.string().uuid(),
  actorAdminId: z.string().uuid().nullable(),
  actorUsername: z.string().nullable(),
  actorRole: z
    .enum(['SUPER_ADMIN', 'USER_MANAGEMENT', 'FINANCIAL_MONITOR', 'ISSUES_MANAGEMENT'])
    .nullable(),
  action: z.string(),
  category: z.enum([
    'AUTH',
    'ADMIN_MANAGEMENT',
    'USER_MANAGEMENT',
    'FINANCIAL',
    'ISSUES',
    'SUPPORT_CHAT',
  ]),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
  targetType: z.string().nullable(),
  targetId: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.date(),
});

export const AdminAuditLogsResponseSchema = SuccessResponseSchema(
  z.object({
    items: z.array(AdminAuditLogSchema),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  })
);

export const AdminAuditMetricsResponseSchema = SuccessResponseSchema(
  z.object({
    loginCount: z.number(),
    failedLoginCount: z.number(),
    criticalActionCount: z.number(),
    actionsByAdmin: z.array(
      z.object({
        actorAdminId: z.string().uuid().nullable(),
        actorUsername: z.string().nullable(),
        count: z.number(),
      })
    ),
    actionsByRole: z.array(
      z.object({
        actorRole: z.string().nullable(),
        count: z.number(),
      })
    ),
  })
);
