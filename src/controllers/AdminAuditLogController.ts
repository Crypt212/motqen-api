import SuccessResponse from '../responses/successResponse.js';
import { adminAuditLogService } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { AdminRole } from '../domain/admin.entity.js';

const asDate = (value: unknown): Date | undefined => (value instanceof Date ? value : undefined);

export const listAdminAuditLogs = asyncHandler(async (req, res) => {
  const {
    action,
    severity,
    actorId,
    targetType,
    targetId,
    startDate,
    endDate,
    page,
    limit,
  } = req.query;

  const result = await adminAuditLogService.search({
    role: req.adminState?.role as AdminRole,
    filter: {
      action: action as string | undefined,
      severity: severity as any,
      actorId: actorId as string | undefined,
      targetType: targetType as string | undefined,
      targetId: targetId as string | undefined,
      startDate: asDate(startDate),
      endDate: asDate(endDate),
    },
    pagination: {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    },
  });

  new SuccessResponse('Admin audit logs retrieved', result).send(res);
});

export const getAdminAuditMetrics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await adminAuditLogService.metrics({
    role: req.adminState?.role as AdminRole,
    startDate: asDate(startDate),
    endDate: asDate(endDate),
  });

  new SuccessResponse('Admin audit metrics retrieved', result).send(res);
});
