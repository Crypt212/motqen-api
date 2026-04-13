import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
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
import { createResponseDoc } from 'src/docs/common.js';

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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: GovernmentQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Governments retrieved',
        content: { 'application/json': { schema: GovernmentListResponseSchema } },
      },
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: GovernmentIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Government retrieved',
        content: { 'application/json': { schema: GovernmentResponseSchema } },
      },
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: { 'application/json': { schema: CreateGovernmentSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Government created',
        content: { 'application/json': { schema: GovernmentResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: GovernmentIdParamsSchema,
      body: {
        content: { 'application/json': { schema: UpdateGovernmentSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Government updated',
        content: { 'application/json': { schema: GovernmentResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: GovernmentIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Government deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: GovernmentIdParamsSchema,
      query: GovernmentQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Cities retrieved',
        content: { 'application/json': { schema: CityListResponseSchema } },
      },
      unauthorizedResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });
}
