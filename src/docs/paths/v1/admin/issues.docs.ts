import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from '../../../../libs/zod.js';
import { SuccessResponseSchema, EmptySuccessResponseSchema } from '../../../../schemas/responses.js';
import { createResponseDoc } from '../../../../docs/common.js';

export default function registerAdminIssuesDocs(registry: OpenAPIRegistry) {
  const TAG = 'Admin Issues';

  const IssueTypeSchema = z.enum(['REPORT', 'DISPUTE', 'VERIFICATION']);

  const UnifiedQueueItemSchema = z.object({
    id: z.string().uuid(),
    status: z.string(),
    assignedDepartment: z.string().nullable(),
    assignedAdminId: z.string().nullable(),
    createdAt: z.string().datetime(),
    type: IssueTypeSchema,
  });

  const UnifiedQueueResponseSchema = SuccessResponseSchema(
    z.object({
      data: z.array(UnifiedQueueItemSchema),
    })
  );

  const IssueNoteSchema = z.object({
    id: z.string().uuid(),
    targetType: z.string(),
    targetId: z.string(),
    authorAdminId: z.string(),
    content: z.string(),
    createdAt: z.string().datetime(),
  });

  const IssueAssignmentHistorySchema = z.object({
    id: z.string().uuid(),
    targetType: z.string(),
    targetId: z.string(),
    previousAdminId: z.string().nullable(),
    newAdminId: z.string().nullable(),
    previousDepartment: z.string().nullable(),
    newDepartment: z.string().nullable(),
    event: z.string(),
    note: z.string().nullable(),
    actorAdminId: z.string(),
    createdAt: z.string().datetime(),
  });

  // GET /admin/issues
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/issues',
    tags: [TAG],
    summary: 'Get unified queue of reports, disputes, and verifications',
    security: [{ BearerAuth: [] }],
    parameters: [
      {
        in: 'query',
        name: 'department',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by responsible department',
      },
      {
        in: 'query',
        name: 'status',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by issue status',
      },
      {
        in: 'query',
        name: 'isAssigned',
        schema: { type: 'boolean' },
        required: false,
        description: 'Filter by assignment status',
      },
      {
        in: 'query',
        name: 'adminId',
        schema: { type: 'string' },
        required: false,
        description: 'Filter by assigned admin ID',
      },
    ],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Unified queue retrieved successfully',
        content: { 'application/json': { schema: UnifiedQueueResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
    }),
  });

  // POST /admin/issues/claim
  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/issues/claim',
    tags: [TAG],
    summary: 'Claim an unassigned issue',
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              targetType: IssueTypeSchema,
              targetId: z.string().uuid(),
              note: z.string().optional(),
            }),
          },
        },
        required: true,
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Issue claimed successfully',
        content: { 'application/json': { schema: EmptySuccessResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });

  // POST /admin/issues/transfer-admin
  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/issues/transfer-admin',
    tags: [TAG],
    summary: 'Transfer an issue to another admin',
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              targetType: IssueTypeSchema,
              targetId: z.string().uuid(),
              newAdminId: z.string().uuid(),
              note: z.string().optional(),
            }),
          },
        },
        required: true,
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Issue transferred successfully',
        content: { 'application/json': { schema: EmptySuccessResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });

  // POST /admin/issues/transfer-department
  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/issues/transfer-department',
    tags: [TAG],
    summary: 'Transfer an issue to another department',
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              targetType: IssueTypeSchema,
              targetId: z.string().uuid(),
              newDepartment: z.string(),
              note: z.string().optional(),
            }),
          },
        },
        required: true,
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Issue transferred successfully',
        content: { 'application/json': { schema: EmptySuccessResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });

  // POST /admin/issues/unassign
  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/issues/unassign',
    tags: [TAG],
    summary: 'Return an issue to the unassigned department queue',
    security: [{ BearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              targetType: IssueTypeSchema,
              targetId: z.string().uuid(),
              note: z.string().optional(),
            }),
          },
        },
        required: true,
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Issue unassigned successfully',
        content: { 'application/json': { schema: EmptySuccessResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });

  // GET /admin/issues/{targetType}/{targetId}/notes
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/issues/{targetType}/{targetId}/notes',
    tags: [TAG],
    summary: 'Get internal notes for an issue',
    security: [{ BearerAuth: [] }],
    parameters: [
      { in: 'path', name: 'targetType', schema: { type: 'string' }, required: true },
      { in: 'path', name: 'targetId', schema: { type: 'string' }, required: true },
    ],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Notes retrieved successfully',
        content: { 'application/json': { schema: SuccessResponseSchema(z.object({ data: z.array(IssueNoteSchema) })) } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
    }),
  });

  // POST /admin/issues/{targetType}/{targetId}/notes
  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/issues/{targetType}/{targetId}/notes',
    tags: [TAG],
    summary: 'Add an internal note to an issue',
    security: [{ BearerAuth: [] }],
    parameters: [
      { in: 'path', name: 'targetType', schema: { type: 'string' }, required: true },
      { in: 'path', name: 'targetId', schema: { type: 'string' }, required: true },
    ],
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              content: z.string(),
            }),
          },
        },
        required: true,
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Note added successfully',
        content: { 'application/json': { schema: SuccessResponseSchema(IssueNoteSchema) } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
    }),
  });

  // GET /admin/issues/{targetType}/{targetId}/history
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/issues/{targetType}/{targetId}/history',
    tags: [TAG],
    summary: 'Get assignment history for an issue',
    security: [{ BearerAuth: [] }],
    parameters: [
      { in: 'path', name: 'targetType', schema: { type: 'string' }, required: true },
      { in: 'path', name: 'targetId', schema: { type: 'string' }, required: true },
    ],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Assignment history retrieved successfully',
        content: { 'application/json': { schema: SuccessResponseSchema(z.object({ data: z.array(IssueAssignmentHistorySchema) })) } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
    }),
  });
}
