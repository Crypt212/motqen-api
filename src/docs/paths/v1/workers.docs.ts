import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { ExploreSearchSchema, ExploreWorkerIdParamsSchema } from '../../../schemas/workers.js';
import {
  ExploreWorkersResponseSchema,
  ExploreWorkerDetailResponseSchema,
  SpecializationsResponseSchema,
} from '../../../schemas/responses.js';
import { createResponseDoc } from '../../../docs/common.js';

export default function registerWorkersDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /workers
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/workers',
    tags: ['Workers'],
    summary: 'Explore workers with flagged filters',
    description: `Returns a paginated list of approved workers filtered by:
- specializationId (required)
- subSpecializationId (optional)
- governmentId (optional)
- Flags (optional): availableNow, nearest, acceptsUrgentJobs, highestRated

Each worker includes userInfo, location (with nested city/government), specializationTree, and workInfo.`,
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: ExploreSearchSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Explore results retrieved successfully',
        content: { 'application/json': { schema: ExploreWorkersResponseSchema } },
      },
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /workers/:id
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/workers/{id}',
    tags: ['Workers'],
    summary: 'Get explored worker details',
    description:
      'Returns the full public profile for the selected worker card. Only approved workers with active accounts are returned.',
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: ExploreWorkerIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker details retrieved successfully',
        content: { 'application/json': { schema: ExploreWorkerDetailResponseSchema } },
      },
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /workers/:id/specializations/tree
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/workers/{id}/specializations/tree',
    tags: ['Workers'],
    summary: 'Get specializations and thier sub-specializations for explored worker details',
    description:
      'Returns the specializations and thier sub-specializations for the selected worker card. Only approved workers with active accounts are returned.',
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: { },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker details retrieved successfully',
        content: { 'application/json': { schema: SpecializationsResponseSchema } },
      },
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });
}
