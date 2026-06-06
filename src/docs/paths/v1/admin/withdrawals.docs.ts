import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  withdrawRequestListResponseSchema,
  withdrawRequestResponseSchema,
  rejectWithdrawRequestBodySchema,
  completePayoutBodySchema,
  failPayoutBodySchema,
  listDebtsQuerySchema,
  listWithdrawRequestsQuerySchema,
} from'../../../../schemas/financial/withdrawal.schema.js';
import { PayoutExecutionStatus } from '../../../../domain/financial/withdrawal.entity.js';

export default function registerAdminWithdrawalsDocs(registry: OpenAPIRegistry) {
  const BEARER_AUTH = { bearerAuth: [] };

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/withdrawals/withdraw-requests',
    tags: ['Admin / Withdrawals'],
    summary: 'List withdraw requests',
    security: [BEARER_AUTH],
    request: { query: listWithdrawRequestsQuerySchema },
    responses: {
      200: { description: 'Withdraw requests retrieved successfully', content: { 'application/json': { schema:
        z.object({ status: z.literal('success'), message: z.string(), data: z.object({ items: withdrawRequestListResponseSchema, nextCursor: z.string().nullable(), hasNext: z.boolean() }) })
      } } }
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/withdrawals/withdraw-requests/{id}',
    tags: ['Admin / Withdrawals'],
    summary: 'Get withdraw request details',
    security: [BEARER_AUTH],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: { description: 'Withdraw request details retrieved successfully', content: { 'application/json': { schema:
        z.object({ status: z.literal('success'), message: z.string(), data: withdrawRequestResponseSchema.extend({
          workerProfile: z.any(),
          payoutExecution: z.any(),
          auditHistory: z.array(z.any()),
        }) })
      } } }
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/withdrawals/withdraw-requests/{id}/start-processing',
    tags: ['Admin / Withdrawals'],
    summary: 'Start processing withdraw request',
    security: [BEARER_AUTH],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: { description: 'Processing started', content: { 'application/json': { schema: z.object({ status: z.literal('success'), message: z.string() }) } } }
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/withdrawals/withdraw-requests/{id}/reject',
    tags: ['Admin / Withdrawals'],
    summary: 'Reject a pending withdraw request',
    security: [BEARER_AUTH],
    request: { params: z.object({ id: z.string().uuid() }), body: { content: { 'application/json': { schema: rejectWithdrawRequestBodySchema } } } },
    responses: {
      200: { description: 'Request rejected successfully', content: { 'application/json': { schema: z.object({ status: z.literal('success'), message: z.string() }) } } }
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/withdrawals/payout-executions/{id}/complete',
    tags: ['Admin / Withdrawals'],
    summary: 'Complete payout execution',
    security: [BEARER_AUTH],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        content: { 'multipart/form-data': { schema: z.object({
          externalReferenceId: z.string(),
          proofOfPaymentImage: z.any(),
          notes: z.string().optional()
        }) } }
      }
    },
    responses: {
      200: { description: 'Payout completed successfully', content: { 'application/json': { schema: z.object({ status: z.literal('success'), message: z.string() }) } } }
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/withdrawals/payout-executions/{id}/fail',
    tags: ['Admin / Withdrawals'],
    summary: 'Fail payout execution',
    security: [BEARER_AUTH],
    request: { params: z.object({ id: z.string().uuid() }), body: { content: { 'application/json': { schema: failPayoutBodySchema } } } },
    responses: {
      200: { description: 'Payout marked as failed', content: { 'application/json': { schema: z.object({ status: z.literal('success'), message: z.string() }) } } }
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/withdrawals/payout-executions/{id}/proof',
    tags: ['Admin / Withdrawals'],
    summary: 'Get payout execution proof',
    security: [BEARER_AUTH],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: { description: 'Payout execution proof retrieved successfully', content: { 'application/json': { schema:
        z.object({ status: z.literal('success'), message: z.string(), data: z.object({
          proofOfPaymentUrl: z.string().url().nullable(),
          externalReferenceId: z.string().nullable(),
          notes: z.string().nullable(),
          status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
          executedAt: z.string().nullable(),
          completedAt: z.string().nullable(),
        }) })
      } } }
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/withdrawals/worker-debts',
    tags: ['Admin / Withdrawals'],
    summary: 'List worker debts',
    security: [BEARER_AUTH],
    request: { query: listDebtsQuerySchema },
    responses: {
      200: { description: 'Debts fetched successfully', content: { 'application/json': { schema:
        z.object({ status: z.literal('success'), message: z.string() })
      } } }
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/withdrawals/worker-debts/{id}/settle',
    tags: ['Admin / Withdrawals'],
    summary: 'Settle worker debt',
    security: [BEARER_AUTH],
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: { description: 'Debt settled successfully', content: { 'application/json': { schema: z.object({ status: z.literal('success'), message: z.string() }) } } }
    }
  });
}
