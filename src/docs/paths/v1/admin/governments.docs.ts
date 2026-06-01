import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  CreateGovernmentSchema,
  UpdateGovernmentSchema,
  GovernmentIdParamsSchema,
} from '../../../../schemas/requests/government.request.js';
import {
  GovernmentResponseSchema,
} from '../../../../schemas/responses/government.response.js';
import { MessageOnlyResponseSchema } from '../../../../schemas/responses.js';
import { createResponseDoc } from '../../../../docs/common.js';

export default function registerAdminGovernmentsDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST /admin/governments
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/governments',
    tags: ['Admin Governments'],
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
  // PUT /admin/governments/:governmentId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'put',
    path: '/api/v1/admin/governments/{governmentId}',
    tags: ['Admin Governments'],
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
  // DELETE /admin/governments/:governmentId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/admin/governments/{governmentId}',
    tags: ['Admin Governments'],
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
}
