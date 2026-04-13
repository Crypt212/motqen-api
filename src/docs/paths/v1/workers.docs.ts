import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { ExploreSearchSchema, ExploreWorkerIdParamsSchema } from '../../../schemas/workers.js';
import {
  ExploreWorkersResponseSchema,
  ExploreWorkerDetailResponseSchema,
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
- governments (optional multi-select)
- flaged (optional front flags: availbilty, nearest, acceptUrgentJobs, heasetrated)`,
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
}
