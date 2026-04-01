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

  idWithPersonalImageUrl: String;
  idDocumentUrl: String;
  reason: String;
  status: VerificationStatus;

  createdAt: Date;
  updatedAt: Date;
};

export type WorkerProfileVerificationCreateInput = {
  idWithPersonalImageUrl: String;
  idDocumentUrl: String;
  reason?: String;
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

export type WorkerSearchFlag = 'availability' | 'nearest' | 'acceptsUrgentJobs' | 'highestRated';

export type WorkerSearchInput = {
  categoryId?: string;
  specializationId?: string;
  subSpecializationId?: string;
  governmentId?: string;
  area?: string;
  city?: string;
  availability?: boolean;
  acceptsUrgentJobs?: boolean;
  highestRated?: boolean;
  nearest?: boolean;
  customerGovernmentName?: string;
  customerGovernmentLatitude?: string | number;
  customerGovernmentLongitude?: string | number;
  currentUserId?: string;
  page?: number;
  limit?: number;
};

export type WorkerSearchItem = {
  distanceKm?: number;
  workerId: string;
  name: string;
  profileImage: string;
  service_title: string;
  rating: number;
  area: string;
  isAvailableNow: boolean;
  completedServices: number;
  acceptsUrgentJobs: boolean;
};
