import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { UUIDSchema } from '../../../schemas/common.js';
import { createResponseDoc } from '../../../docs/common.js';
import { SuccessResponseSchema } from '../../../schemas/responses.js';
import { z } from '../../../libs/zod.js';
import { withdrawRequestSchema, payoutMethodSchema } from '../../../schemas/financial/withdrawal.schema.js';
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
    responses: createResponseDoc({
      successfulResponse: { description: 'List of withdraw requests', content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } } },
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
    request: { params: z.object({ id: UUIDSchema }) },
    responses: createResponseDoc({ successfulResponse: { description: 'Processing started' }, unauthorizedResponse: true }),
  });

  // Admin: disputes list
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/disputes',
    tags: ['Disputes'],
    summary: 'List disputes',
    security: [{ BearerAuth: [] }],
    responses: createResponseDoc({ successfulResponse: { description: 'List of disputes', content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } } }, unauthorizedResponse: true }),
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

  // Worker earnings endpoints (worker scope)
  registry.registerPath({
    method: 'get',
    path: '/api/v1/workers/me/earnings',
    tags: ['Worker Earnings'],
    summary: "Get my earnings balance",
    description: "Returns the authenticated worker's earnings balance breakdown",
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: { description: 'Earnings balance retrieved', content: { 'application/json': { schema: SuccessResponseSchema(z.object({ total_earned: z.string(), withdrawn: z.string(), pending_withdraw: z.string(), on_hold_for_dispute: z.string(), available_to_withdraw: z.string() })) } },
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
    responses: createResponseDoc({ successfulResponse: { description: 'List of withdraw requests', content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } } }, unauthorizedResponse: true, forbiddenResponse: true, internalServerError: true }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/workers/me/earnings/withdraw-requests',
    tags: ['Worker Earnings'],
    summary: 'Create withdraw request',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: { body: { 'application/json': { schema: withdrawRequestSchema } } },
    responses: createResponseDoc({ createdSuccessfullyResponse: { description: 'Withdraw request created', content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } } }, badRequestResponse: true, unauthorizedResponse: true, forbiddenResponse: true, internalServerError: true }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/workers/me/earnings/payout-methods',
    tags: ['Worker Earnings'],
    summary: 'List my payout methods',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({ successfulResponse: { description: 'List of payout methods', content: { 'application/json': { schema: SuccessResponseSchema(z.array(z.any())) } } }, unauthorizedResponse: true, forbiddenResponse: true, internalServerError: true }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/workers/me/earnings/payout-methods',
    tags: ['Worker Earnings'],
    summary: 'Add payout method',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: { body: { 'application/json': { schema: payoutMethodSchema } } },
    responses: createResponseDoc({ createdSuccessfullyResponse: { description: 'Payout method added', content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } } }, badRequestResponse: true, unauthorizedResponse: true, forbiddenResponse: true, internalServerError: true }),
  });
}
