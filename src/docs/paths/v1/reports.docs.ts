import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  CreateReportRequestSchema,
  CreateReportQuerySchema,
  CreateReportParamsSchema,
  GetReportsQuerySchema,
  GetReportByIdQuerySchema,
  GetReportByIdParamsSchema,
  UpdateReportRequestSchema,
  UpdateReportQuerySchema,
  UpdateReportParamsSchema,
  CancelReportQuerySchema,
  CancelReportParamsSchema,
  UpdateReportStatusRequestSchema,
  UpdateReportStatusQuerySchema,
  UpdateReportStatusParamsSchema,
} from '../../../schemas/requests/report.request.js';
import {
  CreateReportResponseSchema,
  GetReportsResponseSchema,
  GetReportByIdResponseSchema,
  UpdateReportResponseSchema,
  UpdateReportStatusResponseSchema,
} from '../../../schemas/responses/report.response.js';
import { createResponseDoc } from '../../../docs/common.js';
import { z } from '../../../libs/zod.js';

export default function registerReportsDocs(registry: OpenAPIRegistry) {
  const TAG = 'Reports';

  const CreateReportMultipartSchema = CreateReportRequestSchema;
  const UpdateReportMultipartSchema = UpdateReportRequestSchema;
  registry.registerPath({
    method: 'post',
    path: '/api/v1/reports',
    tags: [TAG],
    summary: 'Submit a report or complaint',
    security: [{ bearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: CreateReportQuerySchema,
      params: CreateReportParamsSchema,
      body: {
        content: {
          'multipart/form-data': {
            schema: CreateReportMultipartSchema.extend({
              images: z
                .any()
                .openapi({
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                  description: 'Up to 5 order images (optional)',
                })
                .optional(),
            }),
          },
        },
        description: 'Report data with up to 5 images',
        required: true,
      },
    },
    responses: createResponseDoc({
      createdSuccessfullyResponse: {
        description: 'Report created successfully',
        content: { 'application/json': { schema: CreateReportResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      tooManyRequestsResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/reports',
    tags: [TAG],
    summary: 'List reports',
    description: 'Retrieves a list of reports. Reporters see only their own; Admins see all.',
    security: [{ bearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: GetReportsQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Reports retrieved successfully',
        content: { 'application/json': { schema: GetReportsResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
    }),
  });

  registry.registerPath({
    method: 'get',
    path: '/api/v1/reports/{reportId}',
    tags: [TAG],
    summary: 'Get a report by ID',
    security: [{ bearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: GetReportByIdQuerySchema,
      params: GetReportByIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Report retrieved successfully',
        content: { 'application/json': { schema: GetReportByIdResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/reports/{reportId}',
    tags: [TAG],
    summary: 'Update a PENDING report',
    description: 'Update the description and replace images of an existing PENDING report.',
    security: [{ bearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: UpdateReportQuerySchema,
      params: UpdateReportParamsSchema,
      body: {
        content: {
          'multipart/form-data': {
            schema: UpdateReportMultipartSchema.extend({
              images: z
                .any()
                .openapi({
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                  description: 'Up to 5 order images (optional)',
                })
                .optional(),
            }),
          },
        },
        description: 'Updated report data',
        required: true,
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Report updated successfully',
        content: { 'application/json': { schema: UpdateReportResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/reports/{reportId}',
    tags: [TAG],
    summary: 'Cancel a PENDING report',
    security: [{ bearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: CancelReportQuerySchema,
      params: CancelReportParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/reports/{reportId}/status',
    tags: [TAG],
    summary: 'Update report status (Admin only)',
    security: [{ bearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }, { $ref: '#/components/parameters/UserType' }],
    request: {
      query: UpdateReportStatusQuerySchema,
      params: UpdateReportStatusParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: UpdateReportStatusRequestSchema,
          },
        },
        required: true,
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Report status updated successfully',
        content: { 'application/json': { schema: UpdateReportStatusResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });
}
