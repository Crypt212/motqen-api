import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { ExploreSearchSchema, ExploreWorkerIdParamsSchema } from '../../../schemas/workers.js';
import {
  ExploreWorkersResponseSchema,
  ExploreWorkerDetailResponseSchema,
} from '../../../schemas/responses.js';

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
    request: {
      query: ExploreSearchSchema,
    },
    responses: {
      200: {
        description: 'Explore results retrieved successfully',
        content: { 'application/json': { schema: ExploreWorkersResponseSchema } },
      },
      400: { description: 'Bad Request' },
    },
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
    request: {
      params: ExploreWorkerIdParamsSchema,
    },
    responses: {
      200: {
        description: 'Worker details retrieved successfully',
        content: { 'application/json': { schema: ExploreWorkerDetailResponseSchema } },
      },
      404: { description: 'Not Found' },
    },
  });
}
