import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  UpdateReportStatusSchema,
  ReportIdParamsSchema,
} from '../../../../schemas/requests/report.request.js';
import {
  ReportResponseSchema,
} from '../../../../schemas/responses/report.response.js';
import { createResponseDoc } from '../../../../docs/common.js';

export default function registerAdminReportsDocs(registry: OpenAPIRegistry) {
  const TAG = 'Admin Reports';

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/admin/reports/{reportId}/status',
    tags: [TAG],
    summary: 'Update report status (Admin)',
    security: [{ BearerAuth: [] }],
    request: {
      params: ReportIdParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: UpdateReportStatusSchema,
          },
        },
        required: true,
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Report status updated successfully',
        content: { 'application/json': { schema: ReportResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });
}
