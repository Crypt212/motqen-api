import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  CreateSpecializationSchema,
  UpdateSpecializationSchema,
  CreateSubSpecializationSchema,
  SpecializationIdParamsSchema,
  SubSpecializationIdParamsSchema,
  SpecializationQuerySchema,
  SubSpecializationQuerySchema,
} from '../../../schemas/requests/specialization.request.js';
import {
  SpecializationResponseSchema,
  SpecializationListResponseSchema,
  SubSpecializationResponseSchema,
  SubSpecializationListResponseSchema,
} from '../../../schemas/responses/specialization.response.js';
import { MessageOnlyResponseSchema } from '../../../schemas/responses.js';
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


}
