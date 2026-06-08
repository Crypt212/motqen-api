import { asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import AppError from '../errors/AppError.js';
import { adminAuditLogService, adminCasesService } from '../state.js';
import { AdminRole } from '../domain/admin.entity.js';
import { CaseType } from '../domain/adminCase.entity.js';
import { serializeBigints } from '../utils/serializeBigints.js';
import {
  AdminCaseListQuery,
  AdminCaseStatsQuery,
} from '../schemas/requests/adminCase.request.js';

export default class AdminCasesController {
  listCases = asyncHandler(async (req, res): Promise<void> => {
    if (!req.adminState) throw new AppError('Unauthorized', 401);

    const query = req.query as unknown as AdminCaseListQuery;
    const result = await adminCasesService.listCases(req.adminState.role as AdminRole, {
      status: query.status,
      caseType: query.caseType,
      assigned: query.assigned,
      assignedAdminId: query.assignedAdminId,
      createdFrom: query.createdFrom,
      createdTo: query.createdTo,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    new SuccessResponse('Cases retrieved successfully', result, 200).send(res);
  });

  getCaseStats = asyncHandler(async (req, res): Promise<void> => {
    if (!req.adminState) throw new AppError('Unauthorized', 401);

    const query = req.query as unknown as AdminCaseStatsQuery;
    const stats = await adminCasesService.getCaseStats(req.adminState.role as AdminRole, {
      createdFrom: query.createdFrom,
      createdTo: query.createdTo,
    });

    new SuccessResponse('Case statistics retrieved successfully', stats, 200).send(res);
  });

  getCaseDetail = asyncHandler(async (req, res): Promise<void> => {
    if (!req.adminState) throw new AppError('Unauthorized', 401);

    const { caseType, caseId } = req.params as { caseType: CaseType; caseId: string };

    const detail = await adminCasesService.getCaseDetail(
      req.adminState.role as AdminRole,
      req.adminState.adminId,
      caseType,
      caseId
    );

    const resolved = detail as { sourceEntityType?: string; sourceEntityId?: string };

    void adminAuditLogService.record({
      actor: {
        adminId: req.adminState.adminId,
        username: req.adminState.username,
        role: req.adminState.role as AdminRole,
      },
      action: 'CASE_VIEWED',
      category: 'ISSUES',
      severity: 'INFO',
      targetType: resolved.sourceEntityType ?? caseType,
      targetId: resolved.sourceEntityId ?? caseId,
      metadata: { caseType, caseId },
    });

    new SuccessResponse('Case details retrieved successfully', serializeBigints(detail), 200).send(res);
  });
}
