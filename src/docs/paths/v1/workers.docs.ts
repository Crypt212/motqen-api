import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { ExploreSearchSchema, ExploreWorkerIdParamsSchema } from '../../../schemas/requests/worker-explore.request.js';
import {
  ExploreSearchResponseSchema,
  ExploreDetailResponseSchema,
  OccupiedTimeSlotsResponseSchema,
} from '../../../schemas/responses/worker-explore.response.js';
import { WorkerWorkingHoursResponseSchema } from '../../../schemas/responses/worker-profile.response.js';
import { MessageOnlyResponseSchema } from '../../../schemas/responses.js';
import { createResponseDoc } from '../../../docs/common.js';
import { z } from '../../../libs/zod.js';

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
        content: { 'application/json': { schema: ExploreSearchResponseSchema } },
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
        content: { 'application/json': { schema: ExploreDetailResponseSchema } },
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
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /workers/:id/occupied-time-slots
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/workers/{id}/occupied-time-slots',
    tags: ['Workers'],
    summary: 'Get worker occupied time slots',
    description: 'Returns the occupied time slots for the worker on a specific date.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: ExploreWorkerIdParamsSchema,
      query: z.object({ selectedDate: z.string().openapi({ description: 'YYYY-MM-DD' }) }),
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Occupied time slots retrieved',
        content: { 'application/json': { schema: OccupiedTimeSlotsResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /workers/:id/working-hours
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/workers/{id}/working-hours',
    tags: ['Workers'],
    summary: 'Get worker working hours',
    description: 'Returns the current working-hours schedule for the explored worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Working hours retrieved',
        content: { 'application/json': { schema: WorkerWorkingHoursResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });
}
