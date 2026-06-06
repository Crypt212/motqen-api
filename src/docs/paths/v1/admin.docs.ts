import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { AdminLoginSchema } from '../../../schemas/requests/admin-auth.request.js';
import {
  AdminLoginResponseSchema,
  AdminAccessTokenResponseSchema,
} from '../../../schemas/responses/admin-auth.response.js';
import {
  AdminAuditLogQuerySchema,
  AdminAuditMetricsQuerySchema,
} from '../../../schemas/requests/admin-audit-logs.request.js';
import {
  AdminAuditLogsResponseSchema,
  AdminAuditMetricsResponseSchema,
} from '../../../schemas/responses/admin-audit-logs.response.js';
import { EmptySuccessResponseSchema, SuccessResponseSchema } from '../../../schemas/responses.js';
import { createResponseDoc } from '../../../docs/common.js';
import { UUIDSchema } from '../../../schemas/common.js';
import { z } from '../../../libs/zod.js';
import {
  withdrawRequestListResponseSchema,
  idParamsSchema,
  rejectWithdrawRequestBodySchema,
  completePayoutBodySchema,
  failPayoutBodySchema,
  listDebtsQuerySchema,
  listWithdrawRequestsQuerySchema,
} from '../../../schemas/financial/withdrawal.schema.js';
import { initiateRefundSchema, orderIdParamsSchema } from '../../../schemas/financial/refund.schema.js';
import {
  listEscrowHoldsQuerySchema,
  escrowHoldIdParamsSchema,
} from '../../../schemas/financial/escrow.schema.js';
import {
  financialSummaryQuerySchema,
  activityLogQuerySchema,
  userAggregationParamsSchema,
} from '../../../schemas/financial/dashboard.schema.js';
import { CreateAdminSchema, UpdateAdminSchema } from '../../../schemas/requests/admin-users.request.js';

export default function registerAdminDocs(registry: OpenAPIRegistry): void {
  // --- Admin Auth ---
  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/auth/login',
    summary: 'Admin login',
    description: 'Authenticates an admin using username and password.',
    tags: ['Admin Auth'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: AdminLoginSchema,
          },
        },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Admin login successful',
        content: { 'application/json': { schema: AdminLoginResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      internalServerError: true,
    }),
    security: [],
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/auth/logout',
    summary: 'Admin logout',
    description: 'Revokes current admin sessions.',
    tags: ['Admin Auth'],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Logout successful',
        content: { 'application/json': { schema: EmptySuccessResponseSchema } },
      },
      unauthorizedResponse: true,
      internalServerError: true,
    }),
    security: [{ BearerAuth: [] }],
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/auth/access',
    summary: 'Refresh admin access token',
    description: 'Issues a new admin access token using a refresh token.',
    tags: ['Admin Auth'],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'New access token',
        content: { 'application/json': { schema: AdminAccessTokenResponseSchema } },
      },
      unauthorizedResponse: true,
      internalServerError: true,
    }),
    security: [{ BearerAuth: [] }],
  });

  // --- Admin Audit Logs ---
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/audit-logs',
    summary: 'Search admin audit logs',
    description: 'Returns immutable admin audit logs with filters, pagination, and role-scoped visibility.',
    tags: ['Admin Audit Logs'],
    request: { query: AdminAuditLogQuerySchema },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Admin audit logs',
        content: { 'application/json': { schema: AdminAuditLogsResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
    security: [{ BearerAuth: [] }],
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/audit-logs/metrics',
    summary: 'Get admin audit metrics',
    description: 'Returns monitoring metrics from indexed admin audit log queries. Redis counters are deferred for v1.',
    tags: ['Admin Audit Logs'],
    request: { query: AdminAuditMetricsQuerySchema },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Admin audit metrics',
        content: { 'application/json': { schema: AdminAuditMetricsResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
    security: [{ BearerAuth: [] }],
  });

  // --- Admin Withdrawals & Financials ---
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/withdraw-requests',
    tags: ['Withdrawals (Admin)'],
    summary: 'List withdraw requests (admin)',
    description: 'Requires admin access.',
    security: [{ BearerAuth: [] }],
    request: { query: listWithdrawRequestsQuerySchema },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'List of withdraw requests',
        content: { 'application/json': { schema: SuccessResponseSchema(withdrawRequestListResponseSchema) } },
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/withdraw-requests/{id}/start-processing',
    tags: ['Withdrawals (Admin)'],
    summary: 'Start processing a withdrawal (PENDING → IN_PROGRESS)',
    security: [{ BearerAuth: [] }],
    request: { params: idParamsSchema },
    responses: createResponseDoc({
      successfulResponse: { description: 'Processing started' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/withdraw-requests/{id}/reject',
    tags: ['Withdrawals (Admin)'],
    summary: 'Reject withdraw request',
    security: [{ BearerAuth: [] }],
    request: {
      params: idParamsSchema,
      body: { content: { 'application/json': { schema: rejectWithdrawRequestBodySchema } } },
    },
    responses: createResponseDoc({
      successfulResponse: { description: 'Request rejected' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/payout-executions/{id}/complete',
    tags: ['Withdrawals (Admin)'],
    summary: 'Complete payout execution (requires proof of payment)',
    security: [{ BearerAuth: [] }],
    request: {
      params: idParamsSchema,
      body: { content: { 'application/json': { schema: completePayoutBodySchema } } },
    },
    responses: createResponseDoc({
      successfulResponse: { description: 'Payout completed' },
      badRequestResponse: true,
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/payout-executions/{id}/fail',
    tags: ['Withdrawals (Admin)'],
    summary: 'Mark payout execution as failed',
    security: [{ BearerAuth: [] }],
    request: {
      params: idParamsSchema,
      body: { content: { 'application/json': { schema: failPayoutBodySchema } } },
    },
    responses: createResponseDoc({
      successfulResponse: { description: 'Payout marked as failed' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/worker-debts',
    tags: ['Withdrawals (Admin)'],
    summary: 'List worker debts',
    security: [{ BearerAuth: [] }],
    request: { query: listDebtsQuerySchema },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'List of worker debts',
        content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } },
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/worker-debts/{id}/settle',
    tags: ['Withdrawals (Admin)'],
    summary: 'Settle worker debt',
    security: [{ BearerAuth: [] }],
    request: { params: idParamsSchema },
    responses: createResponseDoc({
      successfulResponse: { description: 'Debt settled' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/disputes',
    tags: ['Disputes (Admin)'],
    summary: 'List disputes',
    security: [{ BearerAuth: [] }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'List of disputes',
        content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } },
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/disputes',
    tags: ['Disputes (Admin)'],
    summary: 'Open a new dispute',
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: z.any() } }
      }
    },
    responses: createResponseDoc({
      createdSuccessfullyResponse: {
        description: 'Dispute created',
        content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } }
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/disputes/{id}',
    tags: ['Disputes (Admin)'],
    summary: 'Get dispute details with messages and transaction logs',
    security: [{ BearerAuth: [] }],
    request: { params: idParamsSchema },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Dispute details',
        content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } }
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/disputes/{id}/request-info',
    tags: ['Disputes (Admin)'],
    summary: 'Request more information from the user',
    security: [{ BearerAuth: [] }],
    request: {
      params: idParamsSchema,
      body: { content: { 'application/json': { schema: z.any() } } }
    },
    responses: createResponseDoc({
      successfulResponse: { description: 'Info requested' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/disputes/{id}/resolve',
    tags: ['Disputes (Admin)'],
    summary: 'Resolve a dispute (decision + reason required)',
    security: [{ BearerAuth: [] }],
    request: {
      params: idParamsSchema,
      body: { content: { 'application/json': { schema: z.any() } } }
    },
    responses: createResponseDoc({
      successfulResponse: { description: 'Dispute resolved' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/disputes/{id}/messages',
    tags: ['Disputes (Admin)'],
    summary: 'Get dispute messages',
    security: [{ BearerAuth: [] }],
    request: { params: idParamsSchema },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Dispute messages',
        content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } }
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/disputes/{id}/messages',
    tags: ['Disputes (Admin)'],
    summary: 'Add a message to a dispute',
    security: [{ BearerAuth: [] }],
    request: {
      params: idParamsSchema,
      body: { content: { 'application/json': { schema: z.any() } } }
    },
    responses: createResponseDoc({
      createdSuccessfullyResponse: { description: 'Message added' },
      unauthorizedResponse: true,
    }),
  });

  // --- Admin Escrow Holds ---
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/escrow-holds',
    tags: ['Escrow (Admin)'],
    summary: 'List escrow holds',
    security: [{ BearerAuth: [] }],
    request: { query: listEscrowHoldsQuerySchema },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'List of escrow holds',
        content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } }
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/escrow-holds/{id}/release',
    tags: ['Escrow (Admin)'],
    summary: 'Manual release escrow hold',
    security: [{ BearerAuth: [] }],
    request: { params: escrowHoldIdParamsSchema },
    responses: createResponseDoc({
      successfulResponse: { description: 'Escrow hold released successfully' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/orders/{orderId}/refunds',
    tags: ['Refunds (Admin)'],
    summary: 'Initiate refund (admin)',
    security: [{ BearerAuth: [] }],
    request: {
      params: orderIdParamsSchema,
      body: { content: { 'application/json': { schema: initiateRefundSchema } } },
    },
    responses: createResponseDoc({
      createdSuccessfullyResponse: {
        description: 'Refund initiated',
        content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } },
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/orders/{orderId}/refunds',
    tags: ['Refunds (Admin)'],
    summary: 'List refunds for an order',
    security: [{ BearerAuth: [] }],
    request: { params: orderIdParamsSchema },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'List of refunds',
        content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } },
      },
      unauthorizedResponse: true,
    }),
  });

  // --- Admin Users ---
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/users',
    summary: 'List admins',
    tags: ['Admin Users'],
    security: [{ BearerAuth: [] }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'List of admins',
        content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } },
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/users',
    summary: 'Create admin',
    description:
      'Creates a new admin account. Only accessible by the **SUPER_ADMIN**.\n\n' +
      'The request body must include a unique username, a password (min 8 characters), ' +
      'first/last name, and a role. The password is hashed server-side using scrypt before storage. ' +
      'Returns the created admin object with `passwordHash` omitted. ' +
      'An audit log entry (`ADMIN_CREATED`, severity `WARNING`) is recorded for the action.\n\n' +
      '> ⚠️ `SUPER_ADMIN` cannot be assigned via this endpoint — only one SUPER_ADMIN exists in the system.\n\n' +
      '---\n\n' +
      '**`role` — allowed values for new admins:**\n' +
      '- `USER_MANAGEMENT` – Can view and manage platform users (ban, verify, suspend, etc.).\n' +
      '- `FINANCIAL_MONITOR` – Read/write access to withdrawals, payouts, debts, refunds, and escrow holds.\n' +
      '- `ISSUES_MANAGEMENT` – Can handle disputes, reports, verifications, and support issues.\n\n' +
      '**`status` — set automatically on creation, read-only in this response:**\n' +
      '- `ACTIVE` – Account is enabled; admin can log in immediately.\n' +
      '- `DISABLED` – Account is suspended; login is rejected.',
    tags: ['Admin Users'],
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateAdminSchema.extend({
              role: z
                .enum(['USER_MANAGEMENT', 'FINANCIAL_MONITOR', 'ISSUES_MANAGEMENT'])
                .openapi({
                  description:
                    'Role to assign. SUPER_ADMIN is not allowed here — only one exists in the system.',
                  enum: ['USER_MANAGEMENT', 'FINANCIAL_MONITOR', 'ISSUES_MANAGEMENT'],
                  example: 'USER_MANAGEMENT',
                }),
            }),
          },
        },
      },
    },
    responses: createResponseDoc({
      createdSuccessfullyResponse: {
        description: 'Admin created successfully',
        content: {
          'application/json': {
            schema: SuccessResponseSchema(
              z.object({
                id: z.string().uuid().openapi({ description: 'Unique admin identifier (UUID v4)' }),
                username: z.string().openapi({ description: 'Unique login username', example: 'john_doe' }),
                firstName: z.string().openapi({ example: 'John' }),
                lastName: z.string().openapi({ example: 'Doe' }),
                profileImageUrl: z.string().url().nullable().openapi({
                  description: 'Profile image URL, or null if not set',
                  example: 'https://cdn.example.com/avatar.jpg',
                }),
                role: z
                  .enum(['USER_MANAGEMENT', 'FINANCIAL_MONITOR', 'ISSUES_MANAGEMENT'])
                  .openapi({
                    description:
                      'USER_MANAGEMENT: manage platform users | ' +
                      'FINANCIAL_MONITOR: withdrawals, payouts & refunds | ' +
                      'ISSUES_MANAGEMENT: disputes, reports & verifications',
                    example: 'USER_MANAGEMENT',
                  }),
                status: z.enum(['ACTIVE', 'DISABLED']).openapi({
                  description:
                    'ACTIVE: account enabled, login allowed | ' +
                    'DISABLED: account suspended, login rejected',
                  example: 'ACTIVE',
                }),
                createdAt: z.string().datetime().openapi({ example: '2026-06-01T12:00:00.000Z' }),
                updatedAt: z.string().datetime().openapi({ example: '2026-06-01T12:00:00.000Z' }),
              })
            ),
          },
        },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: {
        description: 'Forbidden – caller does not have SUPER_ADMIN role',
      },
      conflictResponse: {
        description: 'Conflict – username already exists',
      },
      validationErrorResponse: true,
    }),
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/users/{adminId}/role',
    summary: 'Update admin role',
    tags: ['Admin Users'],
    security: [{ BearerAuth: [] }],
    request: {
      params: z.object({ adminId: UUIDSchema }),
      body: { content: { 'application/json': { schema: UpdateAdminSchema } } },
    },
    responses: createResponseDoc({
      successfulResponse: { description: 'Role updated' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/users/{adminId}/status',
    summary: 'Update admin status',
    tags: ['Admin Users'],
    security: [{ BearerAuth: [] }],
    request: {
      params: z.object({ adminId: UUIDSchema }),
      body: { content: { 'application/json': { schema: UpdateAdminSchema } } },
    },
    responses: createResponseDoc({
      successfulResponse: { description: 'Status updated' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/users/{adminId}/force-logout',
    summary: 'Force logout admin',
    tags: ['Admin Users'],
    security: [{ BearerAuth: [] }],
    request: {
      params: z.object({ adminId: UUIDSchema }),
    },
    responses: createResponseDoc({
      successfulResponse: { description: 'Force logout successful' },
      unauthorizedResponse: true,
    }),
  });

  // --- Admin Issues ---
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/issues',
    summary: 'Get unified queue of reports, disputes, and verifications',
    tags: ['Admin Issues'],
    security: [{ BearerAuth: [] }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Unified queue retrieved',
        content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } },
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/issues/claim',
    summary: 'Claim an unassigned issue',
    tags: ['Admin Issues'],
    security: [{ BearerAuth: [] }],
    responses: createResponseDoc({
      successfulResponse: { description: 'Issue claimed successfully' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/issues/transfer',
    summary: 'Transfer an issue to another admin or department',
    tags: ['Admin Issues'],
    security: [{ BearerAuth: [] }],
    responses: createResponseDoc({
      successfulResponse: { description: 'Issue transferred successfully' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/issues/return',
    summary: 'Return an issue to the unassigned queue',
    tags: ['Admin Issues'],
    security: [{ BearerAuth: [] }],
    responses: createResponseDoc({
      successfulResponse: { description: 'Issue returned successfully' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/issues/{targetType}/{targetId}/notes',
    summary: 'Get notes for an issue',
    tags: ['Admin Issues'],
    security: [{ BearerAuth: [] }],
    request: {
      params: z.object({ targetType: z.string(), targetId: z.string() }),
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Notes retrieved',
        content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } },
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/issues/{targetType}/{targetId}/notes',
    summary: 'Add a note to an issue',
    tags: ['Admin Issues'],
    security: [{ BearerAuth: [] }],
    request: {
      params: z.object({ targetType: z.string(), targetId: z.string() }),
      body: { content: { 'application/json': { schema: z.any() } } },
    },
    responses: createResponseDoc({
      createdSuccessfullyResponse: { description: 'Note added successfully' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/issues/{targetType}/{targetId}/history',
    summary: 'Get assignment history for an issue',
    tags: ['Admin Issues'],
    security: [{ BearerAuth: [] }],
    request: {
      params: z.object({ targetType: z.string(), targetId: z.string() }),
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'History retrieved',
        content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } },
      },
      unauthorizedResponse: true,
    }),
  });

  // --- Admin Dashboard ---
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/finance/summary',
    summary: 'Get financial dashboard summary',
    tags: ['Admin Dashboard'],
    security: [{ BearerAuth: [] }],
    request: {
      query: financialSummaryQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Financial summary retrieved',
        content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } },
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/finance/activity-log',
    summary: 'Get financial activity log',
    tags: ['Admin Dashboard'],
    security: [{ BearerAuth: [] }],
    request: {
      query: activityLogQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Activity log retrieved',
        content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } },
      },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/finance/users/{userId}/aggregation',
    summary: 'Get user financial aggregation',
    tags: ['Admin Dashboard'],
    security: [{ BearerAuth: [] }],
    request: {
      params: userAggregationParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'User aggregation retrieved',
        content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } },
      },
      unauthorizedResponse: true,
      notFoundResponse: true,
    }),
  });

  // --- Admin Reports ---
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/reports/{id}',
    summary: 'Get a specific report',
    tags: ['Admin Reports'],
    security: [{ BearerAuth: [] }],
    request: {
      params: idParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Report retrieved',
        content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } },
      },
      unauthorizedResponse: true,
      notFoundResponse: true,
    }),
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/reports/{id}/status',
    summary: 'Update report status',
    tags: ['Admin Reports'],
    security: [{ BearerAuth: [] }],
    request: {
      params: idParamsSchema,
      body: {
        content: { 'application/json': { schema: z.object({ status: z.string() }) } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Report status updated',
        content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } },
      },
      unauthorizedResponse: true,
    }),
  });

  // --- Admin Verifications ---
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/verifications/{id}',
    summary: 'Get a specific verification request',
    tags: ['Admin Verifications'],
    security: [{ BearerAuth: [] }],
    request: {
      params: idParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Verification retrieved',
        content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } },
      },
      unauthorizedResponse: true,
      notFoundResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/verifications/{id}/reject',
    summary: 'Reject a verification request',
    tags: ['Admin Verifications'],
    security: [{ BearerAuth: [] }],
    request: {
      params: idParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: z.object({
              rejectionReasons: z.array(z.string()),
              rejectionNote: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Verification rejected',
        content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } },
      },
      unauthorizedResponse: true,
    }),
  });
}
