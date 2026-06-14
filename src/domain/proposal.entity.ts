import { IDType } from 'src/repositories/interfaces/Repository.js';
import { $Enums } from '../generated/prisma/client.js';

import { FieldTypeDefinition } from '../types/query.js';
import { WorkerSummary } from './workerProfile.entity.js';
import { LatestNegotiationSnapshot } from './negotiation.entity.js';

export type ProposalStatus = $Enums.ProposalStatus;

export type Proposal = {
  id: IDType;
  orderId: IDType;
  workerProfileId: IDType;
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
};

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

export type ProposalFilter = Partial<{
  id: IDType;
  orderId: IDType;
  workerProfileId: IDType;
  status: ProposalStatus;
  createdAt: Date;
}>;
