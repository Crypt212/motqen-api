import type { AccountStatus, Role } from '../generated/prisma/client.js';

export type ExploreWorkerPublicDetail = {
  id: string;
  userId: string;
  portfolioId: string | null;
  experienceYears: number;
  isInTeam: boolean;
  acceptsUrgentJobs: boolean;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    phoneNumber: string;
    firstName: string;
    middleName: string;
    lastName: string;
    profileImageUrl: string | null;
    status: AccountStatus;
    role: Role;
    isOnline: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  portfolio: {
    id: string;
    workerProfileId: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    projectImages: Array<{
      id: string;
      portfolioId: string;
      imageUrl: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
  } | null;
};
