import { IDType } from 'src/repositories/interfaces/Repository.js';
import { $Enums } from '../generated/prisma/client.js';
import { FilterFromDescriptor } from '../schemas/common.js';
import { FieldTypeDefinition } from '../types/query.js';

export type ProposalStatus = $Enums.ProposalStatus;

export type Proposal = {
  id: IDType;
  orderId: IDType;
  workerProfileId: IDType;
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkerSummary = {
  id: IDType;
  userId: IDType;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  experienceYears: number;
  rate: number;
  ratingCount: number;
  completedJobsCount: number;
};

export type LatestNegotiationSnapshot = {
  id: IDType;
  price: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  startDate: Date;
  estimatedDurationHours: number;
  direction: 'WORKER_TO_CLIENT' | 'CLIENT_TO_WORKER';
  createdAt: Date;
} | null;

export type ProposalWithWorkerSummary = Proposal & {
  workerProfile: WorkerSummary;
  latestNegotiation: LatestNegotiationSnapshot | null;
};

export type ProposalCreateInput = {
  orderId: IDType;
  workerProfileId: IDType;
};

export type ProposalUpdateInput = Partial<{
  status: ProposalStatus;
}>;

export const ProposalFilterDescriptor = {
  id: { type: 'uuid' },
  orderId: { type: 'uuid' },
  workerProfileId: { type: 'uuid' },
  status: {
    type: 'enum',
    enumValues: ['PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'DISMISSED'],
  },
  createdAt: { type: 'date', sortable: true },
} satisfies Record<string, FieldTypeDefinition>;

export type ProposalFilter = FilterFromDescriptor<typeof ProposalFilterDescriptor>;
