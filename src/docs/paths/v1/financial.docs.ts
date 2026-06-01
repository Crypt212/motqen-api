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
