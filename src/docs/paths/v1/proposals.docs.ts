import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  CreateProposalSchema,
  OrderProposalParamsSchema,
} from '../../../schemas/requests/proposal.request.js';
import { OrderIdParamsSchema } from '../../../schemas/requests/order.request.js';
import {
  ProposalResponseSchema,
  ProposalListResponseSchema,
  ProposalAcceptResponseSchema,
} from '../../../schemas/responses/proposal.response.js';
import { CreateNegotiationSchema } from '../../../schemas/requests/negotiation.request.js';
import {
  NegotiationListResponseSchema,
  NegotiationResponseSchema,
  NegotiationOrderResponseSchema,
} from '../../../schemas/responses/negotiation.response.js';
import { createResponseDoc } from '../../../docs/common.js';

export default function registerProposalsDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST /orders/{orderId}/proposals
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/proposals',
    tags: ['Proposals'],
    summary: 'Submit a proposal for a global order',
    description:
      'Allows a verified and approved worker to submit a proposal with a price offer and optional note to an open global order.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: CreateProposalSchema,
          },
        },
      },
    },
    responses: createResponseDoc({
      createdSuccessfullyResponse: {
        description: 'Proposal submitted successfully',
        content: { 'application/json': { schema: ProposalResponseSchema } },
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
  // GET /orders/{orderId}/proposals
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/orders/{orderId}/proposals',
    tags: ['Proposals'],
    summary: 'List proposals for a specific order',
    description:
      'Returns a list of all proposals submitted for the specified order. Accessible only by the client who created the order or an admin.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Proposals retrieved successfully',
        content: { 'application/json': { schema: ProposalListResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /orders/{orderId}/proposals/{proposalId}
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/orders/{orderId}/proposals/{proposalId}',
    tags: ['Proposals'],
    summary: 'Get details of a specific proposal',
    description:
      'Returns the details of a single proposal including worker profile summary and latest negotiation. Accessible only by the order client owner or the submitting worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderProposalParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Proposal retrieved successfully',
        content: { 'application/json': { schema: ProposalResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /orders/{orderId}/proposals/{proposalId}/accept
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/proposals/{proposalId}/accept',
    tags: ['Proposals'],
    summary: 'Accept a proposal for an order',
    description:
      'Accepts a worker\'s proposal for an open order. This atomically assigns the worker, updates the order status to PRICE_AGREED, locks the agreed price and time, and dismisses all other active proposals for the order.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderProposalParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Proposal accepted successfully',
        content: { 'application/json': { schema: ProposalAcceptResponseSchema } },
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
  // GET /orders/{orderId}/proposals/{proposalId}/negotiations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/orders/{orderId}/proposals/{proposalId}/negotiations',
    tags: ['Negotiations'],
    summary: 'Get negotiation history for a proposal',
    description:
      'Returns the full negotiation history for the specified proposal, sorted by createdAt DESC. Only the client of the order or the assigned worker can access it.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderProposalParamsSchema,
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
  // POST /orders/{orderId}/proposals/{proposalId}/negotiations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/proposals/{proposalId}/negotiations',
    tags: ['Negotiations'],
    summary: 'Create a new negotiation offer',
    description:
      'Submit a new price offer and time for the proposal. Only allowed when order status is OPEN. Blocked if the previous offer is still PENDING. Direction is inferred from the requester\'s role.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderProposalParamsSchema,
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
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /orders/{orderId}/proposals/{proposalId}/negotiations/accept
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/proposals/{proposalId}/negotiations/accept',
    tags: ['Negotiations'],
    summary: 'Accept the latest pending negotiation',
    description:
      'Accepts the most recent PENDING negotiation. Only the opponent of the offer creator can accept. Atomically sets negotiation.status = ACCEPTED, order.finalPrice = negotiation.price, order.orderStatus = PRICE_AGREED.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderProposalParamsSchema,
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
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /orders/{orderId}/proposals/{proposalId}/negotiations/reject
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/orders/{orderId}/proposals/{proposalId}/negotiations/reject',
    tags: ['Negotiations'],
    summary: 'Reject the latest pending negotiation',
    description:
      'Rejects the most recent PENDING negotiation. Only the opponent of the offer creator can reject. Sets negotiation.status = REJECTED, unlocking new offers.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: OrderProposalParamsSchema,
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
