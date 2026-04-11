import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  CreateSpecializationSchema,
  UpdateSpecializationSchema,
  CreateSubSpecializationSchema,
  SpecializationIdParamsSchema,
  SubSpecializationIdParamsSchema,
  SpecializationQuerySchema,
  SubSpecializationQuerySchema,
} from '../../../schemas/specializations.js';
import {
  SpecializationResponseSchema,
  SpecializationListResponseSchema,
  SubSpecializationResponseSchema,
  SubSpecializationListResponseSchema,
  MessageOnlyResponseSchema,
} from '../../../schemas/responses.js';

export default function registerSpecializationsDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /specializations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/specializations',
    tags: ['Specializations'],
    summary: 'Get all specializations',
    description: 'Returns a list of all specializations. Public endpoint.',
    request: {
      query: SpecializationQuerySchema,
    },
    responses: {
      200: {
        description: 'Specializations retrieved',
        content: { 'application/json': { schema: SpecializationListResponseSchema } },
      },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /specializations/:specializationId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/specializations/{specializationId}',
    tags: ['Specializations'],
    summary: 'Get specialization by ID',
    description: 'Returns a single specialization by its UUID. Public endpoint.',
    request: {
      params: SpecializationIdParamsSchema,
    },
    responses: {
      200: {
        description: 'Specialization retrieved',
        content: { 'application/json': { schema: SpecializationResponseSchema } },
      },
      404: { description: 'Not Found' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /specializations/:specializationId/sub-specializations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/specializations/{specializationId}/sub-specializations',
    tags: ['Specializations'],
    summary: 'Get sub-specializations',
    description: 'Returns all sub-specializations under a parent specialization. Public endpoint.',
    request: {
      params: SpecializationIdParamsSchema,
      query: SubSpecializationQuerySchema,
    },
    responses: {
      200: {
        description: 'Sub-specializations retrieved',
        content: { 'application/json': { schema: SubSpecializationListResponseSchema } },
      },
      404: { description: 'Not Found' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /specializations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/specializations',
    tags: ['Specializations'],
    summary: 'Create specialization (Admin)',
    description: 'Creates a new specialization. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: CreateSpecializationSchema } },
      },
    },
    responses: {
      201: {
        description: 'Specialization created',
        content: { 'application/json': { schema: SpecializationResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /specializations/:specializationId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'put',
    path: '/api/v1/specializations/{specializationId}',
    tags: ['Specializations'],
    summary: 'Update specialization (Admin)',
    description: 'Updates an existing specialization by UUID. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    request: {
      params: SpecializationIdParamsSchema,
      body: {
        content: { 'application/json': { schema: UpdateSpecializationSchema } },
      },
    },
    responses: {
      200: {
        description: 'Specialization updated',
        content: { 'application/json': { schema: SpecializationResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      404: { description: 'Not Found' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /specializations/:specializationId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/specializations/{specializationId}',
    tags: ['Specializations'],
    summary: 'Delete specialization (Admin)',
    description: 'Deletes a specialization by UUID. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    request: {
      params: SpecializationIdParamsSchema,
    },
    responses: {
      200: {
        description: 'Specialization deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      404: { description: 'Not Found' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /specializations/:specializationId/sub-specializations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/specializations/{specializationId}/sub-specializations',
    tags: ['Specializations'],
    summary: 'Create sub-specialization (Admin)',
    description:
      'Creates a new sub-specialization under a parent specialization. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    request: {
      params: SpecializationIdParamsSchema,
      body: {
        content: { 'application/json': { schema: CreateSubSpecializationSchema } },
      },
    },
    responses: {
      201: {
        description: 'Sub-specialization created',
        content: { 'application/json': { schema: SubSpecializationResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      404: { description: 'Not Found' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /specializations/:specializationId/sub-specializations/:subSpecializationId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/specializations/{specializationId}/sub-specializations/{subSpecializationId}',
    tags: ['Specializations'],
    summary: 'Delete sub-specialization (Admin)',
    description:
      'Deletes a sub-specialization by UUID under a parent specialization. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    request: {
      params: SpecializationIdParamsSchema.merge(SubSpecializationIdParamsSchema),
    },
    responses: {
      200: {
        description: 'Sub-specialization deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      404: { description: 'Not Found' },
      500: { description: 'Internal Server Error' },
    },
  });
}
