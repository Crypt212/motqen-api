import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from '../../../libs/zod.js';
import {
  CreateOrderSchema,
  OrderQuerySchema,
  OrderIdParamsSchema,
  SpecifyRangeSchema,
  OrderRateSchema,
} from '../../../schemas/requests/order.request.js';
import { CreateNegotiationSchema } from '../../../schemas/requests/negotiation.request.js';
import { MessageOnlyResponseSchema } from '../../../schemas/responses.js';
import { OrderResponseSchema, OrderListResponseSchema } from '../../../schemas/responses/order.response.js';
import {
  NegotiationListResponseSchema,
  NegotiationResponseSchema,
  NegotiationOrderResponseSchema,
} from '../../../schemas/responses/negotiation.response.js';
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
  // GET /orders/:orderId/location
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/orders/{orderId}/location',
    tags: ['Orders'],
    summary: 'Get the location assigned to order by ID',
    description:
      'Returns the location assigned to the order. Accessible by the client who created it or the assigned worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Location of order retrieved successfully',
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

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /orders/:orderId/negotiations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/orders/{orderId}/negotiations',
    tags: ['Negotiations'],
    summary: 'Get negotiation history for an order',
    description:
      'Returns the full negotiation history for the specified order, sorted by createdAt DESC. Only the client of the order or the assigned worker can access it.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Negotiation history retrieved',
        content: { 'application/json': { schema: NegotiationListResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /orders/:orderId/negotiations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/negotiations',
    tags: ['Negotiations'],
    summary: 'Create a new negotiation offer',
    description:
      'Submit a new price offer for the order. Only allowed when order status is PENDING or TIME_SPECIFIED. Blocked if the previous offer is still PENDING. Direction is inferred from the requester\'s role.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
      body: { content: { 'application/json': { schema: CreateNegotiationSchema } } },
    },
    responses: createResponseDoc({
      createdSuccessfullyResponse: {
        description: 'Negotiation created',
        content: { 'application/json': { schema: NegotiationResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /orders/:orderId/negotiations/accept
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/negotiations/accept',
    tags: ['Negotiations'],
    summary: 'Accept the latest pending negotiation',
    description:
      'Accepts the most recent PENDING negotiation. Only the opponent of the offer creator can accept. Atomically sets negotiation.status = ACCEPTED, order.finalPrice = negotiation.price, order.orderStatus = PRICE_AGREED.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Negotiation accepted, order updated',
        content: { 'application/json': { schema: NegotiationOrderResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /orders/:orderId/negotiations/reject
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/negotiations/reject',
    tags: ['Negotiations'],
    summary: 'Reject the latest pending negotiation',
    description:
      'Rejects the most recent PENDING negotiation. Only the opponent of the offer creator can reject. Sets negotiation.status = REJECTED, unlocking new offers.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Negotiation rejected',
        content: { 'application/json': { schema: NegotiationResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });
}
