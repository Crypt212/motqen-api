import { z } from 'src/libs/zod.js';
import { UUIDSchema, createFilterMetadata } from '../common.js';
import { WorkerSummaryViewSchema } from './workerProfile.js';
import { LatestNegotiationSnapshotSchema } from './negotiations.js';

export const ProposalObjectSchema = z.object({
  id: UUIDSchema,
  orderId: UUIDSchema,
  workerProfileId: UUIDSchema,
  status: z.enum(['PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'DISMISSED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProposalWithWorkerSummarySchema = ProposalObjectSchema.extend({
  workerProfile: WorkerSummaryViewSchema,
  latestNegotiation: LatestNegotiationSnapshotSchema.nullable(),
});

export const ProposalFilterSchema = createFilterMetadata(
  {
    id: UUIDSchema,
    orderId: UUIDSchema,
    workerProfileId: UUIDSchema,
    status: z.enum(['PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'DISMISSED']),
    createdAt: z.coerce.date(),
  },
  {
    sortableFields: ['createdAt'],
  }
);

