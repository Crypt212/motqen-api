import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { createResponseDoc } from '../../../docs/common.js';
import { z } from '../../../libs/zod.js';
import {
  GetUserResponseSchema,
  GetVerificationResponseSchema,
  GetWorkerGovernmentsResponseSchema,
  GetWorkerOrdersStatisticsResponseSchema,
  GetWorkerProfileResponseSchema,
  GetWorkerSpecializationsResponseSchema,
  GetWorkerSpecializationsTreeResponseSchema,
  GetWorkerWorkingHoursResponseSchema,
  ResubmitVerificationResponseSchema,
  UpdateUserResponseSchema,
  UpdateWorkerProfileResponseSchema,
  CreatePortfolioResponseSchema,
  GetPortfolioResponseSchema,
  UpdatePortfolioResponseSchema,
  AddPortfolioImagesResponseSchema,
  DeletePortfolioImageResponseSchema,
  AddWorkerDaysWorkingHoursResponseSchema,
  RemoveWorkerWorkingDaysResponseSchema,
  AddWorkerGovernmentsResponseSchema,
  DeleteWorkerGovernmentsResponseSchema,
  AddWorkerSpecializationsResponseSchema,
  DeleteWorkerSpecializationsResponseSchema,
  CreateClientProfileResponseSchema,
  GetClientProfileResponseSchema,
  GetWorkerOccupiedTimeSlotsResponseSchema
} from 'src/schemas/responses/dashboard.response.js';
import {
  GetUserQuerySchema,
  GetUserParamsSchema,
  UpdateUserQuerySchema,
  UpdateUserParamsSchema,
  CreateWorkerProfileQuerySchema,
  CreateWorkerProfileParamsSchema,
  GetVerificationQuerySchema,
  GetVerificationParamsSchema,
  ResubmitVerificationQuerySchema,
  ResubmitVerificationParamsSchema,
  CreatePortfolioQuerySchema,
  CreatePortfolioParamsSchema,
  CreatePortfolioRequestSchema,
  GetPortfolioQuerySchema,
  GetPortfolioParamsSchema,
  UpdatePortfolioQuerySchema,
  UpdatePortfolioParamsSchema,
  UpdatePortfolioRequestSchema,
  AddPortfolioImagesRequestSchema,
  AddPortfolioImagesQuerySchema,
  AddPortfolioImagesParamsSchema,
  DeletePortfolioImageQuerySchema,
  DeletePortfolioImageParamsSchema,
  GetWorkerOccupiedTimeSlotsQuerySchema,
  GetWorkerOccupiedTimeSlotsParamsSchema,
  GetWorkerProfileQuerySchema,
  GetWorkerProfileParamsSchema,
  GetWorkerOrdersStatisticsQuerySchema,
  GetWorkerOrdersStatisticsParamsSchema,
  GetWorkerWorkingHoursQuerySchema,
  GetWorkerWorkingHoursParamsSchema,
  AddWorkerDaysWorkingHoursRequestSchema,
  AddWorkerGovernmentsRequestSchema,
  AddWorkerSpecializationsRequestSchema,
  CreateWorkerProfileRequestSchema,
  DeleteWorkerGovernmentsQuerySchema,
  DeleteWorkerGovernmentsRequestSchema,
  DeleteWorkerSpecializationsQuerySchema,
  DeleteWorkerSpecializationsRequestSchema,
  GetWorkerGovernmentsQuerySchema,
  GetWorkerGovernmentsParamsSchema,
  GetWorkerSpecializationsRequestSchema,
  GetWorkerSpecializationsQuerySchema,
  GetWorkerSpecializationsParamsSchema,
  GetWorkerSpecializationsTreeQuerySchema,
  GetWorkerSpecializationsTreeParamsSchema,
  RemoveWorkerWorkingDaysRequestSchema,
  UpdateUserRequestSchema,
  UpdateWorkerProfileRequestSchema,
  AddWorkerDaysWorkingHoursQuerySchema,
  AddWorkerDaysWorkingHoursParamsSchema,
  RemoveWorkerWorkingDaysQuerySchema,
  RemoveWorkerWorkingDaysParamsSchema,
  UpdateWorkerProfileQuerySchema,
  UpdateWorkerProfileParamsSchema,
  AddWorkerGovernmentsQuerySchema,
  AddWorkerGovernmentsParamsSchema,
  DeleteWorkerGovernmentsParamsSchema,
  AddWorkerSpecializationsQuerySchema,
  AddWorkerSpecializationsParamsSchema,
  DeleteWorkerSpecializationsParamsSchema,
  CreateClientProfileQuerySchema,
  CreateClientProfileParamsSchema,
  CreateClientProfileRequestSchema,
} from 'src/schemas/requests/dashboard.request.js';
import {
  WorkerStatsResponseSchema,
  WorkerBadgesResponseSchema
} from 'src/schemas/responses/worker-profile.response.js';

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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: GetUserQuerySchema,
      params: GetUserParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'User retrieved',
        content: { 'application/json': { schema: GetUserResponseSchema } },
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: UpdateUserQuerySchema,
      params: UpdateUserParamsSchema,
      body: {
        content: {
          'multipart/form-data': {
            schema: UpdateUserRequestSchema.extend({
              personal_image: z.any().openapi({
                type: 'string',
                format: 'binary',
                description: 'Personal photo (optional, jpeg/png/bmp/gif)',
              }),
            }),
          },
        },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'User updated',
        content: { 'application/json': { schema: UpdateUserResponseSchema } },
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: CreateWorkerProfileQuerySchema,
      params: CreateWorkerProfileParamsSchema,
      body: {
        content: {
          'multipart/form-data': {
            schema: CreateWorkerProfileRequestSchema.extend({
              personal_image: z.any().openapi({
                type: 'string',
                format: 'binary',
                description: 'Personal photo (required, jpeg/png/bmp/gif)',
              }),
              id_image: z.any().openapi({
                type: 'string',
                format: 'binary',
                description: 'National ID document image (required, jpeg/png/bmp/gif)',
              }),
              personal_with_id_image: z.any().openapi({
                type: 'string',
                format: 'binary',
                description: 'Selfie holding national ID (required, jpeg/png/bmp/gif)',
              }),
            }),
          },
        },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker profile created',
        content: { 'application/json': { schema: GetWorkerProfileResponseSchema } },
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: GetWorkerProfileQuerySchema,
      params: GetWorkerProfileParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker profile retrieved successfully',
        content: { 'application/json': { schema: GetWorkerProfileResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/worker-profile/ordersCount
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/worker-profile/orders-count',
    tags: ['Dashboard'],
    summary: 'Get Craftsman orders count: cancelled, completed, pending, today',
    description:
      'Returns the number of orders for the authenticated craftsman/worker. User must be registered as a Worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: GetWorkerOrdersStatisticsQuerySchema,
      params: GetWorkerOrdersStatisticsParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker orders count retrieved successfully',
        content: { 'application/json': { schema: GetWorkerOrdersStatisticsResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/worker-profile/working-hours
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/worker-profile/working-hours',
    tags: ['Dashboard'],
    summary: 'Get worker working hours',
    description: 'Returns the current working-hours schedule for the authenticated worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: GetWorkerWorkingHoursQuerySchema,
      params: GetWorkerWorkingHoursParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Working hours retrieved',
        content: { 'application/json': { schema: GetWorkerWorkingHoursResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /me/worker-profile/working-hours
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/me/worker-profile/working-hours',
    tags: ['Dashboard'],
    summary: 'Set worker working hours',
    description:
      'creates the working-hours of input days schedule for the authenticated worker. It does not replace the schedule of already set days.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: AddWorkerDaysWorkingHoursQuerySchema,
      params: AddWorkerDaysWorkingHoursParamsSchema,
      body: {
        content: { 'application/json': { schema: AddWorkerDaysWorkingHoursRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Working hours set',
        content: { 'application/json': { schema: AddWorkerDaysWorkingHoursResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /me/worker-profile/working-hours
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/me/worker-profile/working-hours',
    tags: ['Dashboard'],
    summary: 'Set worker working hours',
    description:
      'deletes the working-hours of input days schedule for the authenticated worker. It does not delete the schedule of days which periods are already used for orders.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: RemoveWorkerWorkingDaysQuerySchema,
      params: RemoveWorkerWorkingDaysParamsSchema,
      body: {
        content: { 'application/json': { schema: RemoveWorkerWorkingDaysRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Working hours deleted',
        content: { 'application/json': { schema: RemoveWorkerWorkingDaysResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: UpdateWorkerProfileQuerySchema,
      params: UpdateWorkerProfileParamsSchema,
      body: {
        content: { 'application/json': { schema: UpdateWorkerProfileRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker profile updated',
        content: { 'application/json': { schema: UpdateWorkerProfileResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: GetWorkerGovernmentsQuerySchema,
      params: GetWorkerGovernmentsParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker governments retrieved',
        content: { 'application/json': { schema: GetWorkerGovernmentsResponseSchema } },
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: AddWorkerGovernmentsQuerySchema,
      params: AddWorkerGovernmentsParamsSchema,
      body: {
        content: { 'application/json': { schema: AddWorkerGovernmentsRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker governments added',
        content: { 'application/json': { schema: AddWorkerGovernmentsResponseSchema } },
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: DeleteWorkerGovernmentsQuerySchema,
      params: DeleteWorkerGovernmentsParamsSchema,
      body: {
        content: { 'application/json': { schema: DeleteWorkerGovernmentsRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker governments deleted',
        content: { 'application/json': { schema: DeleteWorkerGovernmentsResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/worker-profile/specializations/tree
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/worker-profile/specializations/tree',
    tags: ['Dashboard'],
    summary: 'Get worker specializations and their sub-specializations',
    description: 'Returns the list of specializations and chosen sub-specializations for the authenticated worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: GetWorkerSpecializationsTreeQuerySchema,
      params: GetWorkerSpecializationsTreeParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker specializations retrieved',
        content: { 'application/json': { schema: GetWorkerSpecializationsTreeResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      body: {
        content: { 'application/json': { schema: GetWorkerSpecializationsRequestSchema } },
      },
      query: GetWorkerSpecializationsQuerySchema,
      params: GetWorkerSpecializationsParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker specializations retrieved',
        content: { 'application/json': { schema: GetWorkerSpecializationsResponseSchema } },
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: AddWorkerSpecializationsQuerySchema,
      params: AddWorkerSpecializationsParamsSchema,
      body: {
        content: { 'application/json': { schema: AddWorkerSpecializationsRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker specializations added',
        content: { 'application/json': { schema: AddWorkerSpecializationsResponseSchema } },
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
    summary: 'Delete worker specializations and subspecializations',
    description:
      'Removes specializations from the authenticated worker. Pass `all=true` to remove all, or `allSub=true` to remove all sub-specializations.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: DeleteWorkerSpecializationsQuerySchema,
      params: DeleteWorkerSpecializationsParamsSchema,
      body: {
        content: { 'application/json': { schema: DeleteWorkerSpecializationsRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker specializations deleted',
        content: { 'application/json': { schema: DeleteWorkerSpecializationsResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/worker-profile/verification
  // ─────────────────────────────────────────────────────────────────────────────
  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/worker-profile/verification',
    tags: ['Dashboard'],
    summary: 'Get worker verification status',
    description: 'Returns the verification status and details for the authenticated worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: GetVerificationQuerySchema,
      params: GetVerificationParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Verification details retrieved',
        content: { 'application/json': { schema: GetVerificationResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /me/worker-profile/verification
  // ─────────────────────────────────────────────────────────────────────────────
  registry.registerPath({
    method: 'put',
    path: '/api/v1/me/worker-profile/verification',
    tags: ['Dashboard'],
    summary: 'Resubmit worker verification',
    description: 'Resubmits verification images for the authenticated worker. Requires `id_image` and `personal_with_id_image`.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: ResubmitVerificationQuerySchema,
      params: ResubmitVerificationParamsSchema,
      body: {
        content: {
          'multipart/form-data': {
            schema: z.object({
              id_image: z.any().openapi({
                type: 'string',
                format: 'binary',
                description: 'National ID document image (required, jpeg/png/bmp/gif)',
              }),
              personal_with_id_image: z.any().openapi({
                type: 'string',
                format: 'binary',
                description: 'Selfie holding national ID (required, jpeg/png/bmp/gif)',
              }),
            }),
          },
        },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Verification resubmitted successfully',
        content: { 'application/json': { schema: ResubmitVerificationResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /me/worker-profile/portfolio
  // ─────────────────────────────────────────────────────────────────────────────
  registry.registerPath({
    method: 'post',
    path: '/api/v1/me/worker-profile/portfolio',
    tags: ['Dashboard'],
    summary: 'Create worker portfolio',
    description: 'Creates a portfolio for the authenticated worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: CreatePortfolioQuerySchema,
      params: CreatePortfolioParamsSchema,
      body: {
        content: { 'application/json': { schema: CreatePortfolioRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Portfolio created successfully',
        content: { 'application/json': { schema: CreatePortfolioResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/worker-profile/portfolio
  // ─────────────────────────────────────────────────────────────────────────────
  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/worker-profile/portfolio',
    tags: ['Dashboard'],
    summary: 'Get worker portfolio',
    description: 'Returns the portfolio for the authenticated worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: GetPortfolioQuerySchema,
      params: GetPortfolioParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Portfolio retrieved',
        content: { 'application/json': { schema: GetPortfolioResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /me/worker-profile/portfolio
  // ─────────────────────────────────────────────────────────────────────────────
  registry.registerPath({
    method: 'put',
    path: '/api/v1/me/worker-profile/portfolio',
    tags: ['Dashboard'],
    summary: 'Update worker portfolio',
    description: 'Updates the portfolio description for the authenticated worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: UpdatePortfolioQuerySchema,
      params: UpdatePortfolioParamsSchema,
      body: {
        content: { 'application/json': { schema: UpdatePortfolioRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Portfolio updated successfully',
        content: { 'application/json': { schema: UpdatePortfolioResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /me/worker-profile/portfolio/images
  // ─────────────────────────────────────────────────────────────────────────────
  registry.registerPath({
    method: 'post',
    path: '/api/v1/me/worker-profile/portfolio/images',
    tags: ['Dashboard'],
    summary: 'Add portfolio images',
    description: 'Uploads images to the authenticated worker\'s portfolio. Pass images in the `images` form data field.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: AddPortfolioImagesQuerySchema,
      params: AddPortfolioImagesParamsSchema,
      body: {
        content: {
          'multipart/form-data': {
            schema: AddPortfolioImagesRequestSchema.extend({
              images: z.array(z.any().openapi({
                type: 'string',
                format: 'binary',
                description: 'Images (max 10, jpeg/png/bmp/gif)',
              })),
            }),
          },
        },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Images added successfully',
        content: { 'application/json': { schema: AddPortfolioImagesResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /me/worker-profile/portfolio/images/{imageId}
  // ─────────────────────────────────────────────────────────────────────────────
  registry.registerPath({
    method: 'delete',
    path: '/api/v1/me/worker-profile/portfolio/images/{imageId}',
    tags: ['Dashboard'],
    summary: 'Delete portfolio image',
    description: 'Deletes an image from the authenticated worker\'s portfolio.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: DeletePortfolioImageQuerySchema,
      params: DeletePortfolioImageParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Image deleted successfully',
        content: { 'application/json': { schema: DeletePortfolioImageResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/worker-profile/stats
  // ─────────────────────────────────────────────────────────────────────────────
  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/worker-profile/stats',
    tags: ['Dashboard'],
    summary: 'Get worker stats',
    description: 'Returns statistics like ratings and completed jobs for the authenticated worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker stats retrieved',
        content: { 'application/json': { schema: WorkerStatsResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/worker-profile/badges
  // ─────────────────────────────────────────────────────────────────────────────
  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/worker-profile/badges',
    tags: ['Dashboard'],
    summary: 'Get worker badges',
    description: 'Returns the badges earned by the authenticated worker.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker badges retrieved',
        content: { 'application/json': { schema: WorkerBadgesResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/worker-profile/occupied-time-slots
  // ─────────────────────────────────────────────────────────────────────────────
  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/worker-profile/occupied-time-slots',
    tags: ['Dashboard'],
    summary: 'Get worker occupied time slots',
    description: 'Returns the time slots that are currently occupied for the authenticated worker for a specific date.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: GetWorkerOccupiedTimeSlotsQuerySchema,
      params: GetWorkerOccupiedTimeSlotsParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Occupied time slots retrieved',
        content: { 'application/json': { schema: GetWorkerOccupiedTimeSlotsResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: CreateClientProfileQuerySchema,
      params: CreateClientProfileParamsSchema,
      body: {
        content: { 'application/json': { schema: CreateClientProfileRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Client profile created',
        content: { 'application/json': { schema: CreateClientProfileResponseSchema } },
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
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Client profile retrieved',
        content: { 'application/json': { schema: GetClientProfileResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      internalServerError: true,
    }),
  });

  // // ─────────────────────────────────────────────────────────────────────────────
  // // PUT /me/client-profile
  // // ─────────────────────────────────────────────────────────────────────────────
  //
  // registry.registerPath({
  //   method: 'put',
  //   path: '/api/v1/me/client-profile',
  //   tags: ['Dashboard'],
  //   summary: 'Update client profile',
  //   description: "Updates the authenticated client's profile. All fields are optional.",
  //   security: [{ BearerAuth: [] }],
  //   parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
  //   request: {
  //     body: {
  //       content: { 'application/json': { schema: UpdateClientProfileSchema } },
  //     },
  //   },
  //   responses: createResponseDoc({
  //     successfulResponse: {
  //       description: 'Client profile updated',
  //       content: { 'application/json': { schema: DashboardClientProfileResponseSchema } },
  //     },
  //     unauthorizedResponse: true,
  //     forbiddenResponse: true,
  //     validationErrorResponse: true,
  //     internalServerError: true,
  //   }),
  // });
}
