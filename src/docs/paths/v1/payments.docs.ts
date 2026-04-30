import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { createResponseDoc } from '../../../docs/common.js';

export default function registerPaymentsDocs(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/api/v1/payments/{orderId}/iframe',
    tags: ['Payments'],
    summary: 'Get payment iframe URL',
    description:
      "Generates a Paymob payment iframe URL for the specified order. The authenticated user must be the order's client.",
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      // params schema is provided in route; keep minimal here to avoid coupling
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Payment iframe URL generated successfully',
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });
}
