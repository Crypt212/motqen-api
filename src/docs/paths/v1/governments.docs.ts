import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  CreateGovernmentSchema,
  UpdateGovernmentSchema,
  GovernmentIdParamsSchema,
  GovernmentQuerySchema,
} from '../../../schemas/requests/government.request.js';
import {
  GovernmentResponseSchema,
  GovernmentListResponseSchema,
  CityListResponseSchema,
} from '../../../schemas/responses/government.response.js';
import { MessageOnlyResponseSchema } from '../../../schemas/responses.js';
import { createResponseDoc } from '../../../docs/common.js';

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
