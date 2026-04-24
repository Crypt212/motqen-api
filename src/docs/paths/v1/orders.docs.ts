import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from '../../../libs/zod.js';
import {
  CreateOrderSchema,
  OrderQuerySchema,
  OrderIdParamsSchema,
  SpecifyRangeSchema,
  OrderRateSchema,
} from '../../../schemas/order.js';
import {
  OrderResponseSchema,
  OrderListResponseSchema,
  MessageOnlyResponseSchema,
} from '../../../schemas/responses.js';
import { createResponseDoc } from '../../../docs/common.js';

export default function registerOrdersDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST /orders
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders',
    tags: ['Orders'],
    summary: 'Create a new order',
    description:
      'Creates a new service order. Requires an active client profile. Accepts up to 3 images as multipart/form-data alongside JSON fields.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: CreateOrderSchema.extend({
              images: z
                .any()
                .openapi({
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                  description: 'Up to 3 order images (optional)',
                })
                .optional(),
            }),
          },
        },
      },
    },
    responses: createResponseDoc({
      createdSuccessfullyResponse: {
        description: 'Order created successfully',
        content: { 'application/json': { schema: OrderResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /orders
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/orders',
    tags: ['Orders'],
    summary: 'List orders',
    description:
      'Returns a paginated list of orders for the authenticated user. Clients see their own orders; workers see orders assigned to them.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: OrderQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Orders retrieved successfully',
        content: { 'application/json': { schema: OrderListResponseSchema } },
      },
      unauthorizedResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /orders/:orderId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/orders/{orderId}',
    tags: ['Orders'],
    summary: 'Get order by ID',
    description:
      'Returns a single order by its UUID. Accessible by the client who created it or the assigned worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Order retrieved successfully',
        content: { 'application/json': { schema: OrderResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /orders/:orderId   (cancel)
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/orders/{orderId}',
    tags: ['Orders'],
    summary: 'Cancel an order',
    description:
      'Cancels an order. Only the client who created it can cancel, and only while the order is in a cancellable state (e.g. PENDING or ACCEPTED).',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Order cancelled successfully',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /orders/:orderId/specify-range
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/specify-range',
    tags: ['Orders'],
    summary: 'Specify work time range',
    description:
      'Allows the assigned worker to specify the estimated start and end time for the job. Only valid when the order is in an appropriate state.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
      body: {
        content: { 'application/json': { schema: SpecifyRangeSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Work range specified successfully',
        content: { 'application/json': { schema: OrderResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /orders/:orderId/start-work
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/start-work',
    tags: ['Orders'],
    summary: 'Start work on an order',
    description:
      'Transitions the order to IN_PROGRESS. Only the assigned worker can perform this action, and only when the order is in the correct state.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Work started successfully',
        content: { 'application/json': { schema: OrderResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /orders/:orderId/finish-work
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/finish-work',
    tags: ['Orders'],
    summary: 'Finish work on an order',
    description:
      'Transitions the order to COMPLETED. Only the assigned worker can perform this action, and only when the order is IN_PROGRESS.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Work finished successfully',
        content: { 'application/json': { schema: OrderResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/rate',
    tags: ['Orders'],
    summary: 'Rate an order',
    description: '',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
      body: { content: { 'application/json': { schema: OrderRateSchema } } },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Order Rated successfully',
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });
}
