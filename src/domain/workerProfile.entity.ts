import { $Enums } from '../generated/prisma/client.js';
import { IDType } from '../repositories/interfaces/Repository.js';
import { FilterFromDescriptor } from '../schemas/common.js';
import { FieldTypeDefinition } from '../types/query.js';

export type VerificationStatus = $Enums.VerificationStatus;

export type WorkerProfile = {
  id: IDType;
  userId: string;
  experienceYears: number;
  isInTeam: boolean;
  acceptsUrgentJobs: boolean;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkerProfileCreateInput = {
  experienceYears?: number;
  isInTeam?: boolean;
  acceptsUrgentJobs?: boolean;
  bio?: string;
};

export type WorkerProfileUpdateInput = Partial<WorkerProfileCreateInput>;

export const WorkerProfileFilterDescriptor = {
  id: { type: 'uuid' as const },
  userId: { type: 'uuid' as const },
} satisfies Record<string, FieldTypeDefinition>;

export type WorkerProfileFilter = FilterFromDescriptor<typeof WorkerProfileFilterDescriptor>;

// ==================================================

export type WorkerProfileVerification = {
  id: IDType;
  workerProfileId: string;

  idWithPersonalImageUrl: string;
  idDocumentUrl: string;
  reason: string;
  status: VerificationStatus;

  createdAt: Date;
  updatedAt: Date;
};

export type WorkerProfileVerificationCreateInput = {
  idWithPersonalImageUrl: string;
  idDocumentUrl: string;
  reason?: string;
  status?: VerificationStatus;
};

export type WorkerProfileVerificationUpdateInput = Partial<WorkerProfileVerificationCreateInput>;

// ===================================================

export type Portfolio = {
  id: IDType;
  workerProfileId: IDType;

  description: string;

  updatedAt: Date;
  createdAt: Date;
};

export type PortfolioCreateInput = {
  description?: string;
};

export type PortfolioUpdateInput = Partial<PortfolioCreateInput>;
