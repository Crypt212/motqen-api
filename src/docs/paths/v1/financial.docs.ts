import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { createResponseDoc } from '../../../docs/common.js';

export default function registerFinancialDocs(registry: OpenAPIRegistry) {
  // Admin: withdraw requests
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/withdraw-requests',
    tags: ['Withdrawals (Admin)'],
    summary: 'List withdraw requests (admin)',
    description: 'Requires admin access.',
    security: [{ BearerAuth: [] }],
    responses: createResponseDoc({
      successfulResponse: { description: 'List of withdraw requests' },
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/withdraw-requests/{id}/start-processing',
    tags: ['Withdrawals (Admin)'],
    summary: 'Start processing a withdrawal (PENDING → IN_PROGRESS)',
    security: [{ BearerAuth: [] }],
    responses: createResponseDoc({ successfulResponse: { description: 'Processing started' }, unauthorizedResponse: true }),
  });

  // Admin: disputes (basic set)
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/disputes',
    tags: ['Disputes'],
    summary: 'List disputes',
    security: [{ BearerAuth: [] }],
    responses: createResponseDoc({ successfulResponse: { description: 'List of disputes' }, unauthorizedResponse: true }),
  });

  // Admin: refunds for order
  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/orders/{orderId}/refunds',
    tags: ['Refunds'],
    summary: 'Initiate refund (admin)',
    security: [{ BearerAuth: [] }],
    responses: createResponseDoc({ createdSuccessfullyResponse: { description: 'Refund initiated' }, unauthorizedResponse: true }),
  });
}
