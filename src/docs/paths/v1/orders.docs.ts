import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from '../../../libs/zod.js';
import {
  CreateOrderSchema,
  OrderQuerySchema,
  OrderIdParamsSchema,
  OrderRateSchema,
} from '../../../schemas/requests/order.request.js';
import { MessageOnlyResponseSchema } from '../../../schemas/responses.js';
import { OrderResponseSchema, OrderListResponseSchema } from '../../../schemas/responses/order.response.js';
import { CreateNegotiationSchema } from '../../../schemas/requests/negotiation.request.js';
import {
  NegotiationResponseSchema,
  NegotiationListResponseSchema,
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
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
  // GET /orders/:orderId/negotiations (Direct Orders)
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/orders/{orderId}/negotiations',
    tags: ['Orders'],
    summary: 'List negotiations for a direct order',
    description: 'Retrieves the negotiation thread for a direct order (where proposalId is implicitly resolved).',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Negotiations retrieved successfully',
        content: { 'application/json': { schema: NegotiationListResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /orders/:orderId/negotiations (Direct Orders)
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/negotiations',
    tags: ['Orders'],
    summary: 'Create a negotiation offer for a direct order',
    description: 'Creates a new negotiation offer (counter-offer) for a direct order. If omitted, startDate and estimatedDurationHours are inherited from the previous offer. The response includes a hasOverlapWarning boolean flag indicating if the proposed time overlaps with the worker\'s other occupied time slots.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      params: OrderIdParamsSchema,
      body: { content: { 'application/json': { schema: CreateNegotiationSchema } } },
    },
    responses: createResponseDoc({
      createdSuccessfullyResponse: {
        description: 'Negotiation offer created successfully. Warning: it may contain hasOverlapWarning flag.',
        content: { 'application/json': { schema: NegotiationResponseSchema } },
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
  // POST /orders/:orderId/negotiations/accept (Direct Orders)
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/negotiations/accept',
    tags: ['Orders'],
    summary: 'Accept the latest pending negotiation on a direct order',
    description: 'Accepts the latest pending counter-offer on a direct order. This finalizes the price, start date, and duration, transitioning the order to PRICE_AGREED.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Negotiation accepted successfully',
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
  // POST /orders/:orderId/negotiations/reject (Direct Orders)
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/negotiations/reject',
    tags: ['Orders'],
    summary: 'Reject the latest pending negotiation on a direct order',
    description: 'Rejects the latest pending counter-offer on a direct order without proposing a new one.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Negotiation rejected successfully',
        content: { 'application/json': { schema: NegotiationResponseSchema } },
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
  // POST /orders/:orderId/negotiations/cancel (Direct Orders)
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/negotiations/cancel',
    tags: ['Orders'],
    summary: 'Cancel the latest pending negotiation on a direct order',
    description: 'Cancels the latest pending owned offer on a direct order without proposing a new one.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Negotiation cancelled successfully',
        content: { 'application/json': { schema: NegotiationResponseSchema } },
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
