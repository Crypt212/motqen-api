import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from '../../../../libs/zod.js';
import { SuccessResponseSchema } from '../../../../schemas/responses.js';
import { createResponseDoc } from '../../../../docs/common.js';

export default function registerAdminVerificationsDocs(registry: OpenAPIRegistry) {
  const TAG = 'Admin Verifications';

  const VerificationStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
  const VerificationRejectionReasonSchema = z.enum([
    'BLURRY_IMAGE',
    'EXPIRED_ID',
    'MISMATCHED_PERSON',
    'MISSING_DOCUMENT',
    'INVALID_DOCUMENT',
    'OTHER',
  ]);

  const WorkerVerificationSchema = z.object({
    id: z.string().uuid(),
    workerProfileId: z.string().uuid(),
    idWithPersonalImageUrl: z.string(),
    idDocumentUrl: z.string(),
    reason: z.string().nullable(),
    status: VerificationStatusSchema,
    assignedDepartment: z.string().nullable(),
    assignedAdminId: z.string().nullable(),
    rejectionReasons: z.array(VerificationRejectionReasonSchema),
    rejectionNote: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  });

  const VerificationResponseSchema = SuccessResponseSchema(
    z.object({
      verification: WorkerVerificationSchema,
    })
  );

  const VerificationUpdatedResponseSchema = SuccessResponseSchema(
    z.object({
      updated: WorkerVerificationSchema,
    })
  );

  // GET /admin/verifications/{id}
  registry.registerPath({
    method: 'get',
    path: '/api/v1/admin/verifications/{id}',
    tags: [TAG],
    summary: 'Retrieve details of a worker verification issue',
    security: [{ BearerAuth: [] }],
    parameters: [
      {
        in: 'path',
        name: 'id',
        schema: { type: 'string', format: 'uuid' },
        required: true,
      },
    ],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Verification details retrieved successfully',
        content: { 'application/json': { schema: VerificationResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });

  // POST /admin/verifications/{id}/approve
  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/verifications/{id}/approve',
    tags: [TAG],
    summary: 'Approve a worker verification',
    security: [{ BearerAuth: [] }],
    parameters: [
      {
        in: 'path',
        name: 'id',
        schema: { type: 'string', format: 'uuid' },
        required: true,
      },
    ],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Verification approved successfully',
        content: { 'application/json': { schema: VerificationUpdatedResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });

  // POST /admin/verifications/{id}/reject
  registry.registerPath({
    method: 'post',
    path: '/api/v1/admin/verifications/{id}/reject',
    tags: [TAG],
    summary: 'Reject a worker verification',
    security: [{ BearerAuth: [] }],
    parameters: [
      {
        in: 'path',
        name: 'id',
        schema: { type: 'string', format: 'uuid' },
        required: true,
      },
    ],
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              rejectionReasons: z.array(VerificationRejectionReasonSchema),
              rejectionNote: z.string().optional(),
            }),
          },
        },
        required: true,
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Verification rejected successfully',
        content: { 'application/json': { schema: VerificationUpdatedResponseSchema } },
      },
      badRequestResponse: true,
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
    }),
  });
}
