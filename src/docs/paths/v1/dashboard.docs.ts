import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from '../../../libs/zod.js';
import {
  UpdateUserSchema,
  CreateWorkerProfileSchema,
  UpdateWorkerProfileSchema,
  AddWorkerGovernmentsSchema,
  DeleteWorkerGovernmentsSchema,
  DeleteWorkerGovernmentsQuerySchema,
  AddWorkerSpecializationsSchema,
  DeleteWorkerSpecializationsSchema,
  DeleteWorkerSpecializationsQuerySchema,
  CreateClientProfileSchema,
  UpdateClientProfileSchema,
  WorkerGovernmentQuerySchema,
  WorkerSpecializationQuerySchema,
} from '../../../schemas/dashboard.js';
import {
  UserResponseSchema,
  WorkerProfileResponseSchema,
  ClientProfileResponseSchema,
  WorkGovernmentsResponseSchema,
  SpecializationsResponseSchema,
  MessageOnlyResponseSchema,
} from '../../../schemas/responses.js';

export default function registerDashboardDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/me',
    tags: ['Dashboard'],
    summary: 'Get current user',
    description: "Returns the authenticated user's profile information.",
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: 'User retrieved',
        content: { 'application/json': { schema: UserResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /me
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'put',
    path: '/api/v1/me',
    tags: ['Dashboard'],
    summary: 'Update current user',
    description: "Updates the authenticated user's basic info. All fields are optional.",
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: z.object({
              personal_image: z.string().optional().describe('Profile image file (optional)'),
              ...UpdateUserSchema.shape,
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User updated',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /me/worker-profile
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/me/worker-profile',
    tags: ['Dashboard'],
    summary: 'Create worker profile',
    description:
      'Creates a worker profile for the authenticated user (who must not already be a worker). Send as multipart/form-data with three required image files.',
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: z.object({
              personal_image: z.string().describe('Personal photo (required, jpeg/png/webp)'),
              id_image: z.string().describe('National ID document image (required)'),
              personal_with_id_image: z.string().describe('Selfie holding national ID (required)'),
              ...CreateWorkerProfileSchema.shape,
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Worker profile created',
        content: { 'application/json': { schema: WorkerProfileResponseSchema } },
      },
      400: { description: 'Bad Request' },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/worker-profile
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/worker-profile',
    tags: ['Dashboard'],
    summary: 'Get Craftsman Profile Details',
    description:
      'Returns the complete profile of the authenticated craftsman/worker. Includes experience, specializations, operating governments, rating, badges, verification status, and portfolio. User must be registered as a Worker.',
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: 'Worker profile retrieved successfully',
        content: { 'application/json': { schema: WorkerProfileResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /me/worker-profile
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'put',
    path: '/api/v1/me/worker-profile',
    tags: ['Dashboard'],
    summary: 'Update worker profile',
    description: "Updates the authenticated worker's profile. All fields are optional.",
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: UpdateWorkerProfileSchema } },
      },
    },
    responses: {
      200: {
        description: 'Worker profile updated',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /me/worker-profile
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/me/worker-profile',
    tags: ['Dashboard'],
    summary: 'Delete worker profile',
    description: "Deletes the authenticated worker's profile.",
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: 'Worker profile deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/worker-profile/work-governments
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/worker-profile/work-governments',
    tags: ['Dashboard'],
    summary: 'Get worker governments',
    description: 'Returns the list of governments where the authenticated worker operates.',
    security: [{ BearerAuth: [] }],
    request: {
      query: WorkerGovernmentQuerySchema,
    },
    responses: {
      200: {
        description: 'Worker governments retrieved',
        content: { 'application/json': { schema: WorkGovernmentsResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /me/worker-profile/work-governments
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/me/worker-profile/work-governments',
    tags: ['Dashboard'],
    summary: 'Add worker governments',
    description: 'Adds governments where the authenticated worker operates.',
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: AddWorkerGovernmentsSchema } },
      },
    },
    responses: {
      200: {
        description: 'Worker governments added',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /me/worker-profile/work-governments
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/me/worker-profile/work-governments',
    tags: ['Dashboard'],
    summary: 'Delete worker governments',
    description:
      "Removes governments from the authenticated worker's operating regions. Pass `all=true` query to remove all.",
    security: [{ BearerAuth: [] }],
    request: {
      query: DeleteWorkerGovernmentsQuerySchema,
      body: {
        content: { 'application/json': { schema: DeleteWorkerGovernmentsSchema } },
      },
    },
    responses: {
      200: {
        description: 'Worker governments deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/worker-profile/specializations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/worker-profile/specializations',
    tags: ['Dashboard'],
    summary: 'Get worker specializations',
    description: 'Returns the list of specializations for the authenticated worker.',
    security: [{ BearerAuth: [] }],
    request: {
      query: WorkerSpecializationQuerySchema,
    },
    responses: {
      200: {
        description: 'Worker specializations retrieved',
        content: { 'application/json': { schema: SpecializationsResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /me/worker-profile/specializations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/me/worker-profile/specializations',
    tags: ['Dashboard'],
    summary: 'Add worker specializations',
    description: 'Adds specializations for the authenticated worker.',
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: AddWorkerSpecializationsSchema } },
      },
    },
    responses: {
      200: {
        description: 'Worker specializations added',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /me/worker-profile/specializations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/me/worker-profile/specializations',
    tags: ['Dashboard'],
    summary: 'Delete worker specializations',
    description:
      'Removes specializations from the authenticated worker. Pass `all=true` to remove all, or `allSub=true` to remove all sub-specializations.',
    security: [{ BearerAuth: [] }],
    request: {
      query: DeleteWorkerSpecializationsQuerySchema,
      body: {
        content: { 'application/json': { schema: DeleteWorkerSpecializationsSchema } },
      },
    },
    responses: {
      200: {
        description: 'Worker specializations deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /me/client-profile
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/me/client-profile',
    tags: ['Dashboard'],
    summary: 'Create client profile',
    description:
      'Creates a client profile for the authenticated user (who must not already be a client).',
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: CreateClientProfileSchema } },
      },
    },
    responses: {
      200: {
        description: 'Client profile created',
        content: { 'application/json': { schema: ClientProfileResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/client-profile
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/client-profile',
    tags: ['Dashboard'],
    summary: 'Get client profile',
    description: "Returns the authenticated client's profile. User must have a client profile.",
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: 'Client profile retrieved',
        content: { 'application/json': { schema: ClientProfileResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /me/client-profile
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'put',
    path: '/api/v1/me/client-profile',
    tags: ['Dashboard'],
    summary: 'Update client profile',
    description: "Updates the authenticated client's profile. All fields are optional.",
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: { 'application/json': { schema: UpdateClientProfileSchema } },
      },
    },
    responses: {
      200: {
        description: 'Client profile updated',
        content: { 'application/json': { schema: ClientProfileResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /me/client-profile
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/me/client-profile',
    tags: ['Dashboard'],
    summary: 'Delete client profile',
    description: "Deletes the authenticated client's profile.",
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: 'Client profile deleted',
        content: { 'application/json': { schema: ClientProfileResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
  });
}
