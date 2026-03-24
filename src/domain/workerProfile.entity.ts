import { $Enums } from "@prisma/client";
import { IDType } from "../repositories/interfaces/Repository.js";

export type VerificationStatus = $Enums.VerificationStatus;

export type WorkerProfile = {
  id: IDType;
  userId: string,

  experienceYears: number,
  isInTeam: boolean,
  acceptsUrgentJobs: boolean,
  bio?: string,

  createdAt: Date,
  updatedAt: Date,
}

export type WorkerProfileCreateInput = {
  experienceYears?: number,
  isInTeam?: boolean,
  acceptsUrgentJobs?: boolean,
  bio?: string,
}

export type WorkerProfileUpdateInput = Partial<WorkerProfileCreateInput>

export type WorkerProfileFilter = {
  id?: IDType,
  workerProfileId?: IDType,
  userId?: IDType,
}

// ==================================================

export type WorkerProfileVerification = {
  id: IDType;
  workerProfileId: string,

  idWithPersonalImageUrl: String,
  idDocumentUrl: String,
  reason: String,
  status: VerificationStatus,

  createdAt: Date,
  updatedAt: Date,
}

export type WorkerProfileVerificationCreateInput = {
  idWithPersonalImageUrl: String,
  idDocumentUrl: String,
  reason?: String,
  status?: VerificationStatus,
}

export type WorkerProfileVerificationUpdateInput = Partial<WorkerProfileVerificationCreateInput>

// ===================================================

export type Portfolio = {
  id: IDType,
  workerProfileId: IDType,

  description: string,

  updatedAt: Date,
  createdAt: Date,
}

export type PortfolioCreateInput = {
  description?: string,
}

export type PortfolioUpdateInput = Partial<PortfolioCreateInput>
