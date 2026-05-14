import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { UUIDSchema } from '../../../schemas/common.js';
import { createResponseDoc } from '../../../docs/common.js';
import { SuccessResponseSchema } from '../../../schemas/responses.js';
import { z } from '../../../libs/zod.js';
import {
  withdrawRequestSchema,
  payoutMethodSchema,
  updatePayoutMethodSchema,
  workerEarningsBalanceSchema,
  withdrawRequestListResponseSchema,
  withdrawRequestResponseSchema,
  payoutMethodResponseSchema,
  payoutMethodListResponseSchema,
  idParamsSchema,
  rejectWithdrawRequestBodySchema,
  completePayoutBodySchema,
  failPayoutBodySchema,
  listDebtsQuerySchema,
  listWithdrawRequestsQuerySchema,
} from '../../../schemas/financial/withdrawal.schema.js';
import { initiateRefundSchema } from '../../../schemas/financial/refund.schema.js';

export default function registerFinancialDocs(registry: OpenAPIRegistry) {
  // Admin: withdraw requests list
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/withdraw-requests',
    tags: ['Withdrawals (Admin)'],
    summary: 'List withdraw requests (admin)',
    description: 'Requires admin access.',
    security: [{ BearerAuth: [] }],
    request: {
      query: listWithdrawRequestsQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'List of withdraw requests',
        content: { 'application/json': { schema: SuccessResponseSchema(withdrawRequestListResponseSchema) } },
      },
      unauthorizedResponse: true,
    }),
  });

  // Start processing a withdraw request
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

  // Reject a withdraw request
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

  // Complete a payout execution
  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/payout-executions/{id}/complete',
    tags: ['Withdrawals (Admin)'],
    summary: 'Complete payout execution (requires proof of payment)',
    security: [{ BearerAuth: [] }],
    request: {
      params: idParamsSchema,
      body: {
        content: {
          'application/json': { schema: completePayoutBodySchema },
        },
      },
    },
    responses: createResponseDoc({
      successfulResponse: { description: 'Payout completed' },
      badRequestResponse: true,
      unauthorizedResponse: true,
    }),
  });

  // Fail a payout execution
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

  // Admin: list worker debts
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/worker-debts',
    tags: ['Withdrawals (Admin)'],
    summary: 'List worker debts',
    security: [{ BearerAuth: [] }],
    request: {
      query: listDebtsQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'List of worker debts',
        content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } },
      },
      unauthorizedResponse: true,
    }),
  });

  // Admin: settle worker debt
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

  // Admin: disputes list
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/disputes',
    tags: ['Disputes'],
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

  // Admin: initiate refund for order
  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/orders/{orderId}/refunds',
    tags: ['Refunds'],
    summary: 'Initiate refund (admin)',
    security: [{ BearerAuth: [] }],
    request: {
      params: z.object({ orderId: UUIDSchema }),
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

  // Admin: list refunds for order
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/orders/{orderId}/refunds',
    tags: ['Refunds'],
    summary: 'List refunds for an order',
    security: [{ BearerAuth: [] }],
    request: {
      params: z.object({ orderId: UUIDSchema }),
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'List of refunds',
        content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } },
      },
      unauthorizedResponse: true,
    }),
  });

  // Worker earnings endpoints (worker scope)
  registry.registerPath({
    method: 'get',
    path: '/api/v1/workers/me/earnings',
    tags: ['Worker Earnings'],
    summary: 'Get my earnings balance',
    description: "Returns the authenticated worker's earnings balance breakdown",
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Earnings balance retrieved',
        content: {
          'application/json': {
            schema: SuccessResponseSchema(workerEarningsBalanceSchema),
          },
        },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/workers/me/earnings/withdraw-requests',
    tags: ['Worker Earnings'],
    summary: 'List my withdraw requests',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: listWithdrawRequestsQuerySchema.omit({ workerProfileId: true }),
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'List of withdraw requests',
        content: {
          'application/json': { schema: SuccessResponseSchema(withdrawRequestListResponseSchema) },
        },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/workers/me/earnings/withdraw-requests',
    tags: ['Worker Earnings'],
    summary: 'Create withdraw request',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: { body: { content: { 'application/json': { schema: withdrawRequestSchema } } } },
    responses: createResponseDoc({
      createdSuccessfullyResponse: {
        description: 'Withdraw request created',
        content: {
          'application/json': { schema: SuccessResponseSchema(withdrawRequestResponseSchema) },
        },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      tooManyRequestsResponse: true,
      internalServerError: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/workers/me/earnings/withdraw-requests/{id}',
    tags: ['Worker Earnings'],
    summary: 'Get a single withdraw request',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: z.object({ id: UUIDSchema }),
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Withdraw request details',
        content: {
          'application/json': { schema: SuccessResponseSchema(withdrawRequestResponseSchema) },
        },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/workers/me/earnings/payout-methods',
    tags: ['Worker Earnings'],
    summary: 'List my payout methods',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'List of payout methods',
        content: {
          'application/json': { schema: SuccessResponseSchema(payoutMethodListResponseSchema) },
        },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/workers/me/earnings/payout-methods',
    tags: ['Worker Earnings'],
    summary: 'Add payout method',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: { body: { content: { 'application/json': { schema: payoutMethodSchema } } } },
    responses: createResponseDoc({
      createdSuccessfullyResponse: {
        description: 'Payout method added',
        content: {
          'application/json': { schema: SuccessResponseSchema(payoutMethodResponseSchema) },
        },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  registry.registerPath({
    method: 'put',
    path: '/api/v1/workers/me/earnings/payout-methods/{id}',
    tags: ['Worker Earnings'],
    summary: 'Update a payout method',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: z.object({ id: UUIDSchema }),
      body: { content: { 'application/json': { schema: updatePayoutMethodSchema } } },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Payout method updated',
        content: {
          'application/json': { schema: SuccessResponseSchema(payoutMethodResponseSchema) },
        },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/workers/me/earnings/payout-methods/{id}',
    tags: ['Worker Earnings'],
    summary: 'Delete a payout method',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: z.object({ id: UUIDSchema }),
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Payout method deleted',
        content: { 'application/json': { schema: SuccessResponseSchema(z.null()) } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });
}
