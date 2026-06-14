import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  GetSpecializationsQuerySchema,
  GetSpecializationsParamsSchema,
  GetSpecializationByIdQuerySchema,
  GetSpecializationByIdParamsSchema,
  GetSubSpecializationsQuerySchema,
  GetSubSpecializationsParamsSchema,
  CreateSpecializationQuerySchema,
  CreateSpecializationParamsSchema,
  CreateSpecializationRequestSchema,
  UpdateSpecializationQuerySchema,
  UpdateSpecializationParamsSchema,
  UpdateSpecializationRequestSchema,
  DeleteSpecializationQuerySchema,
  DeleteSpecializationParamsSchema,
  CreateSubSpecializationQuerySchema,
  CreateSubSpecializationParamsSchema,
  CreateSubSpecializationRequestSchema,
  DeleteSubSpecializationQuerySchema,
  DeleteSubSpecializationParamsSchema
} from '../../../schemas/requests/specialization.request.js';
import {
  GetSpecializationsResponseSchema,
  GetSpecializationByIdResponseSchema,
  GetSubSpecializationsResponseSchema,
  CreateSpecializationResponseSchema,
  UpdateSpecializationResponseSchema,
  DeleteSpecializationResponseSchema,
  CreateSubSpecializationResponseSchema,
  DeleteSubSpecializationResponseSchema
} from '../../../schemas/responses/specialization.response.js';
import { createResponseDoc } from '../../../docs/common.js';

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
      query: GetSpecializationsQuerySchema,
      params: GetSpecializationsParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Specializations retrieved',
        content: { 'application/json': { schema: GetSpecializationsResponseSchema } },
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
      query: GetSpecializationByIdQuerySchema,
      params: GetSpecializationByIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Specialization retrieved',
        content: { 'application/json': { schema: GetSpecializationByIdResponseSchema } },
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
      params: GetSubSpecializationsParamsSchema,
      query: GetSubSpecializationsQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Sub-specializations retrieved',
        content: { 'application/json': { schema: GetSubSpecializationsResponseSchema } },
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
      query: CreateSpecializationQuerySchema,
      params: CreateSpecializationParamsSchema,
      body: {
        content: { 'application/json': { schema: CreateSpecializationRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Specialization created',
        content: { 'application/json': { schema: CreateSpecializationResponseSchema } },
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
      query: UpdateSpecializationQuerySchema,
      params: UpdateSpecializationParamsSchema,
      body: {
        content: { 'application/json': { schema: UpdateSpecializationRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Specialization updated',
        content: { 'application/json': { schema: UpdateSpecializationResponseSchema } },
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
      query: DeleteSpecializationQuerySchema,
      params: DeleteSpecializationParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Specialization deleted',
        content: { 'application/json': { schema: DeleteSpecializationResponseSchema } },
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
      query: CreateSubSpecializationQuerySchema,
      params: CreateSubSpecializationParamsSchema,
      body: {
        content: { 'application/json': { schema: CreateSubSpecializationRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Sub-specialization created',
        content: { 'application/json': { schema: CreateSubSpecializationResponseSchema } },
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
      query: DeleteSubSpecializationQuerySchema,
      params: DeleteSubSpecializationParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Sub-specialization deleted',
        content: { 'application/json': { schema: DeleteSubSpecializationResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });
}
