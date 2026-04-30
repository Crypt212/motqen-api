import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { paymobWebhookSchema } from '../../../schemas/financial/payment.schema.js';
import { createResponseDoc } from '../../../docs/common.js';

export default function registerWebhooksDocs(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'post',
    path: '/api/v1/webhooks/paymob',
    tags: ['Webhooks'],
    summary: 'Handle Paymob webhook',
    description:
      'Receives and processes Paymob payment transaction webhooks. No authentication required — called by Paymob servers.',
    request: {
      body: { content: { 'application/json': { schema: paymobWebhookSchema } } },
    },
    responses: createResponseDoc({
      successfulResponse: { description: 'Webhook processed successfully' },
      badRequestResponse: true,
      internalServerError: true,
    }),
  });
}
