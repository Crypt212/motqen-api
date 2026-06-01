import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  CreateReportSchema,
  UpdateReportSchema,
  UpdateReportStatusSchema,
  ReportIdParamsSchema,
  ReportQuerySchema,
} from '../../../schemas/requests/report.request.js';
import {
  ReportResponseSchema,
  PaginatedReportsResponseSchema,
} from '../../../schemas/responses/report.response.js';
import { createResponseDoc } from '../../../docs/common.js';
import { z } from '../../../libs/zod.js';

export default function registerReportsDocs(registry: OpenAPIRegistry) {
  const TAG = 'Reports';

  const CreateReportMultipartSchema = CreateReportSchema.extend({
    images: z.any().openapi({ type: 'array', items: { type: 'string', format: 'binary' } }),
  });

  const UpdateReportMultipartSchema = UpdateReportSchema.extend({
    images: z.any().openapi({ type: 'array', items: { type: 'string', format: 'binary' } }),
  });

  registry.registerPath({
    method: 'post',
    path: '/api/v1/reports',
    tags: [TAG],
    summary: 'Submit a report or complaint',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: CreateReportMultipartSchema,
          },
        },
        description: 'Report data with up to 5 images',
        required: true,
      },
    },
    responses: createResponseDoc({
      createdSuccessfullyResponse: {
        description: 'Report created successfully',
        content: { 'application/json': { schema: ReportResponseSchema } },
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
    request: {
      query: ReportQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Reports retrieved successfully',
        content: { 'application/json': { schema: PaginatedReportsResponseSchema } },
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
    request: {
      params: ReportIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Report retrieved successfully',
        content: { 'application/json': { schema: ReportResponseSchema } },
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
    request: {
      params: ReportIdParamsSchema,
      body: {
        content: {
          'multipart/form-data': {
            schema: UpdateReportMultipartSchema,
          },
        },
        description: 'Updated report data',
        required: true,
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Report updated successfully',
        content: { 'application/json': { schema: ReportResponseSchema } },
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
    request: {
      params: ReportIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });


}
