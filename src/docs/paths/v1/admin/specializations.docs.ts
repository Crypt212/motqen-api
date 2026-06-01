import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  CreateSpecializationSchema,
  UpdateSpecializationSchema,
  CreateSubSpecializationSchema,
  SpecializationIdParamsSchema,
  SubSpecializationIdParamsSchema,
} from '../../../../schemas/requests/specialization.request.js';
import {
  SpecializationResponseSchema,
  SubSpecializationResponseSchema,
} from '../../../../schemas/responses/specialization.response.js';
import { MessageOnlyResponseSchema } from '../../../../schemas/responses.js';
import { createResponseDoc } from '../../../../docs/common.js';

export default function registerAdminSpecializationsDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST /admin/specializations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/specializations',
    tags: ['Admin Specializations'],
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
  // PUT /admin/specializations/:specializationId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'put',
    path: '/api/v1/admin/specializations/{specializationId}',
    tags: ['Admin Specializations'],
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
  // DELETE /admin/specializations/:specializationId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/admin/specializations/{specializationId}',
    tags: ['Admin Specializations'],
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
  // POST /admin/specializations/:specializationId/sub-specializations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/specializations/{specializationId}/sub-specializations',
    tags: ['Admin Specializations'],
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
  // DELETE /admin/specializations/:specializationId/sub-specializations/:subSpecializationId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/admin/specializations/{specializationId}/sub-specializations/{subSpecializationId}',
    tags: ['Admin Specializations'],
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
