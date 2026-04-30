import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { UUIDSchema } from '../../../schemas/common.js';
import { createResponseDoc } from '../../../docs/common.js';
import { SuccessResponseSchema } from '../../../schemas/responses.js';
import { z } from '../../../libs/zod.js';

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
    request: { params: z.object({ orderId: UUIDSchema }) },
    responses: createResponseDoc({ createdSuccessfullyResponse: { description: 'Refund initiated', content: { 'application/json': { schema: SuccessResponseSchema(z.any()) } } }, unauthorizedResponse: true }),
  });
}
