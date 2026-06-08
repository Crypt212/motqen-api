import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from '../../../../libs/zod.js';
import { SuccessResponseSchema } from '../../../../schemas/responses.js';
import { createResponseDoc } from '../../../../docs/common.js';
import {
  AdminCaseDetailParamsSchema,
  AdminCaseListQuerySchema,
  AdminCaseStatsQuerySchema,
  CaseTypeSchema,
  NormalizedCaseStatusSchema,
} from '../../../../schemas/requests/adminCase.request.js';

export default function registerAdminCasesDocs(registry: OpenAPIRegistry) {
  const TAG = 'Admin Cases';

  const AdminCaseSummarySchema = z.object({
    caseId: z.string().uuid(),
    caseType: CaseTypeSchema,
    department: z.enum(['USER_MANAGEMENT', 'FINANCIAL_MONITOR', 'ISSUES_MANAGEMENT']),
    assignedAdminId: z.string().uuid().nullable(),
    title: z.string(),
    summary: z.string(),
    status: NormalizedCaseStatusSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    priority: z.string().nullable().optional(),
    sourceEntityType: z.string(),
    sourceEntityId: z.string().uuid(),
  });

  const AdminCaseListResponseSchema = SuccessResponseSchema(
    z.object({
      items: z.array(AdminCaseSummarySchema),
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      hasNext: z.boolean(),
      hasPrevious: z.boolean(),
    })
  );

  const AdminCaseStatsResponseSchema = SuccessResponseSchema(
    z.object({
      total: z.number(),
      open: z.number(),
      assigned: z.number(),
      unassigned: z.number(),
      resolved: z.number(),
    })
  );

  const AdminCaseDetailResponseSchema = SuccessResponseSchema(z.record(z.string(), z.unknown()));

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/cases',
    tags: [TAG],
    summary: 'Unified cases dashboard listing',
    description:
      'Aggregates reports, verifications, disputes, withdrawals, refunds, escrow holds, and failed payment attempts. ' +
      'Department visibility: USER_MANAGEMENT sees ACCOUNT_ISSUE only; FINANCIAL_MONITOR sees FINANCIAL_ISSUE only; ' +
      'ISSUES_MANAGEMENT sees DISPUTE_CASE only; SUPER_ADMIN sees all. ' +
      'Assignment actions use existing /admin/issues endpoints with targetType REPORT, VERIFICATION, DISPUTE, WITHDRAW_REQUEST, REFUND, or ESCROW_HOLD.',
    security: [{ BearerAuth: [] }],
    request: { query: AdminCaseListQuerySchema },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Cases retrieved',
        content: { 'application/json': { schema: AdminCaseListResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/cases/stats',
    tags: [TAG],
    summary: 'Cases dashboard statistics',
    description: 'Role-scoped counts for total, open, assigned, unassigned, and resolved cases.',
    security: [{ BearerAuth: [] }],
    request: { query: AdminCaseStatsQuerySchema },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Statistics retrieved',
        content: { 'application/json': { schema: AdminCaseStatsResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/cases/{caseType}/{caseId}',
    tags: [TAG],
    summary: 'Get full case details',
    description:
      'Returns case-type-specific detail payload plus assignment notes and history. ' +
      'Generates CASE_VIEWED audit log. Non-SUPER_ADMIN must own the case (assignedAdminId).',
    security: [{ BearerAuth: [] }],
    request: { params: AdminCaseDetailParamsSchema },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Case details retrieved',
        content: { 'application/json': { schema: AdminCaseDetailResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });
}
