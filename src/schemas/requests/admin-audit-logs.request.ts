import { z } from '../../libs/zod.js';

export const AdminAuditSeveritySchema = z.enum(['INFO', 'WARNING', 'CRITICAL']);

export const AdminAuditLogQuerySchema = z
  .object({
    action: z.string().trim().min(1).max(100).optional(),
    severity: AdminAuditSeveritySchema.optional(),
    actorId: z.string().uuid().optional(),
    targetType: z.string().trim().min(1).max(100).optional(),
    targetId: z.string().trim().min(1).max(255).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .refine(
    (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
    {
      message: 'startDate must be before or equal to endDate',
      path: ['startDate'],
    }
  );

export const AdminAuditMetricsQuerySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
    {
      message: 'startDate must be before or equal to endDate',
      path: ['startDate'],
    }
  );
