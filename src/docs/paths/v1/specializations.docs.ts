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
import { createResponseDoc } from 'src/docs/common.js';

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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: SpecializationQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Specializations retrieved',
        content: { 'application/json': { schema: SpecializationListResponseSchema } },
      },
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: SpecializationIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Specialization retrieved',
        content: { 'application/json': { schema: SpecializationResponseSchema } },
      },
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: SpecializationIdParamsSchema,
      query: SubSpecializationQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Sub-specializations retrieved',
        content: { 'application/json': { schema: SubSpecializationListResponseSchema } },
      },
      notFoundResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: { 'application/json': { schema: CreateSpecializationSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Specialization created',
        content: { 'application/json': { schema: SpecializationResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: SpecializationIdParamsSchema,
      body: {
        content: { 'application/json': { schema: UpdateSpecializationSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Specialization updated',
        content: { 'application/json': { schema: SpecializationResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: SpecializationIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Specialization deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: SpecializationIdParamsSchema,
      body: {
        content: { 'application/json': { schema: CreateSubSpecializationSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Sub-specialization created',
        content: { 'application/json': { schema: SubSpecializationResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: SpecializationIdParamsSchema.merge(SubSpecializationIdParamsSchema),
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Sub-specialization deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });
}
