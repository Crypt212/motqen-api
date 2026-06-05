import { z } from '../../libs/zod.js';
import { SuccessResponseSchema } from '../responses.js';
import { UUIDSchema } from '../common.js';

export const WorkerSummarySchema = z.object({
  id: UUIDSchema,
  userId: UUIDSchema,
  firstName: z.string(),
  lastName: z.string(),
  profileImageUrl: z.string().nullable(),
  experienceYears: z.number(),
  rate: z.number(),
  ratingCount: z.number(),
  completedJobsCount: z.number(),
});

export const LatestNegotiationSnapshotSchema = z.object({
  id: UUIDSchema,
  price: z.number(),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED']),
  startDate: z.date(),
  estimatedDurationHours: z.number(),
  direction: z.enum(['WORKER_TO_CLIENT', 'CLIENT_TO_WORKER']),
  createdAt: z.date(),
}).nullable();

export const ProposalObjectSchema = z.object({
  id: UUIDSchema,
  orderId: UUIDSchema,
  workerProfileId: UUIDSchema,
  status: z.enum(['PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'DISMISSED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProposalWithWorkerSummarySchema = ProposalObjectSchema.extend({
  workerProfile: WorkerSummarySchema,
  latestNegotiation: LatestNegotiationSnapshotSchema.nullable(),
});

export const ProposalResponseSchema = SuccessResponseSchema(ProposalWithWorkerSummarySchema);

export const ProposalListResponseSchema = SuccessResponseSchema(
  z.object({
    proposals: z.array(ProposalWithWorkerSummarySchema),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })
);


export const ProposalRejectResponseSchema = SuccessResponseSchema(ProposalObjectSchema);
export const ProposalWithdrawResponseSchema = SuccessResponseSchema(ProposalObjectSchema);
