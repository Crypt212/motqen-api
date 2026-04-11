import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from '../../../libs/zod.js';
import {
  CreateGovernmentSchema,
  UpdateGovernmentSchema,
  GovernmentIdParamsSchema,
  GovernmentQuerySchema,
} from '../../../schemas/governments.js';
import {
  GovernmentResponseSchema,
  GovernmentListResponseSchema,
  CityListResponseSchema,
  MessageOnlyResponseSchema,
} from '../../../schemas/responses.js';

export default function registerGovernmentsDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /governments
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/governments',
    tags: ['Governments'],
    summary: 'Get all governments',
    description: 'Returns a list of all governments. Public endpoint.',
    request: {
      query: GovernmentQuerySchema,
    },
    responses: {
      200: {
        description: 'Governments retrieved',
        content: { 'application/json': { schema: GovernmentListResponseSchema } },
      },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /governments/:governmentId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/governments/{governmentId}',
    tags: ['Governments'],
    summary: 'Get government by ID',
    description: 'Returns a single government by its UUID. Public endpoint.',
    request: {
      params: GovernmentIdParamsSchema,
    },
    responses: {
      200: {
        description: 'Government retrieved',
        content: { 'application/json': { schema: GovernmentResponseSchema } },
      },
      404: { description: 'Not Found' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /governments
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/governments',
    tags: ['Governments'],
    summary: 'Create government (Admin)',
    description: 'Creates a new government. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: CreateGovernmentSchema } },
      },
    },
    responses: {
      201: {
        description: 'Government created',
        content: { 'application/json': { schema: GovernmentResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /governments/:governmentId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'put',
    path: '/api/v1/governments/{governmentId}',
    tags: ['Governments'],
    summary: 'Update government (Admin)',
    description: 'Updates an existing government by UUID. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    request: {
      params: GovernmentIdParamsSchema,
      body: {
        content: { 'application/json': { schema: UpdateGovernmentSchema } },
      },
    },
    responses: {
      200: {
        description: 'Government updated',
        content: { 'application/json': { schema: GovernmentResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      404: { description: 'Not Found' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /governments/:governmentId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/governments/{governmentId}',
    tags: ['Governments'],
    summary: 'Delete government (Admin)',
    description: 'Deletes a government by UUID. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    request: {
      params: GovernmentIdParamsSchema,
    },
    responses: {
      200: {
        description: 'Government deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      404: { description: 'Not Found' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /governments/:governmentId/cities
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/governments/{governmentId}/cities',
    tags: ['Governments'],
    summary: 'Get cities by government',
    description: 'Returns all cities under a specific government.',
    security: [{ BearerAuth: [] }],
    request: {
      params: GovernmentIdParamsSchema,
      query: GovernmentQuerySchema,
    },
    responses: {
      200: {
        description: 'Cities retrieved',
        content: { 'application/json': { schema: CityListResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      404: { description: 'Not Found' },
      500: { description: 'Internal Server Error' },
    },
  });
}
