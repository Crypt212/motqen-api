import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from '../../../../libs/zod.js';
import { SuccessResponseSchema } from '../../../../schemas/responses.js';
import { createResponseDoc } from '../../../../docs/common.js';

export default function registerAdminAdminsDocs(registry: OpenAPIRegistry) {
  const TAG = 'Admin Discovery';

  const AdminStatusSchema = z.enum(['ACTIVE', 'DISABLED']);
  const AdminRoleSchema = z.enum(['SUPER_ADMIN', 'USER_MANAGEMENT', 'FINANCIAL_MONITOR', 'ISSUES_MANAGEMENT']);

  const AvailableAdminSchema = z.object({
    id: z.string().uuid(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    profileImageUrl: z.string().nullable(),
    role: AdminRoleSchema,
    status: AdminStatusSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  });

  const AvailableAdminsResponseSchema = SuccessResponseSchema(
    z.array(AvailableAdminSchema)
  );

  // GET /admin/admins/available
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/admins/available',
    tags: [TAG],
    summary: 'Get a list of available (active) admins',
    security: [{ BearerAuth: [] }],
    parameters: [
      {
        in: 'query',
        name: 'department',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by department (role)',
      },
    ],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Available admins retrieved successfully',
        content: { 'application/json': { schema: AvailableAdminsResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
    }),
  });
}
