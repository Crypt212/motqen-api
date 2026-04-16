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
import { createResponseDoc } from '../../../docs/common.js';

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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'User retrieved',
        content: { 'application/json': { schema: UserResponseSchema } },
      },
      unauthorizedResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
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
    responses: createResponseDoc({
      successfulResponse: {
        description: 'User updated',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      unauthorizedResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
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
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker profile created',
        content: { 'application/json': { schema: WorkerProfileResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker profile retrieved successfully',
        content: { 'application/json': { schema: WorkerProfileResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: { 'application/json': { schema: UpdateWorkerProfileSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker profile updated',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker profile deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: WorkerGovernmentQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker governments retrieved',
        content: { 'application/json': { schema: WorkGovernmentsResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: { 'application/json': { schema: AddWorkerGovernmentsSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker governments added',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: DeleteWorkerGovernmentsQuerySchema,
      body: {
        content: { 'application/json': { schema: DeleteWorkerGovernmentsSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker governments deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: WorkerSpecializationQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker specializations retrieved',
        content: { 'application/json': { schema: SpecializationsResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: { 'application/json': { schema: AddWorkerSpecializationsSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker specializations added',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: DeleteWorkerSpecializationsQuerySchema,
      body: {
        content: { 'application/json': { schema: DeleteWorkerSpecializationsSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker specializations deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: { 'application/json': { schema: CreateClientProfileSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Client profile created',
        content: { 'application/json': { schema: ClientProfileResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Client profile retrieved',
        content: { 'application/json': { schema: ClientProfileResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: { 'application/json': { schema: UpdateClientProfileSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Client profile updated',
        content: { 'application/json': { schema: ClientProfileResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Client profile deleted',
        content: { 'application/json': { schema: ClientProfileResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });
}
