import IWorkerProfileRepository from '../interfaces/WorkerRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { IDType } from '../interfaces/Repository.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { SpecializationsTree } from '../../domain/specialization.entity.js';
import { isEmptyFilter, getEmptyPaginatedResult } from './utils.js';
import {
  WorkerProfile,
  WorkerProfileCreateInput,
  WorkerProfileFilter,
  WorkerProfileUpdateInput,
  WorkerProfileVerification,
  WorkerProfileVerificationCreateInput,
} from '../../domain/workerProfile.entity.js';
import { PaginationOptions, PaginatedResult, SortOptions } from '../../types/query.js';
import * as pkg from '@prisma/client';

export default class WorkerRepositoryRepository extends Repository implements IWorkerProfileRepository {
  constructor(prisma: pkg.PrismaClient) {
    super(prisma);
  }

  private toDomain(record: WorkerProfile): WorkerProfile {
    return {
      id: record.id,
      userId: record.userId,
      experienceYears: record.experienceYears,
      isInTeam: record.isInTeam,
      acceptsUrgentJobs: record.acceptsUrgentJobs,
      bio: record.bio ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toDomainVerification(record: WorkerProfileVerification): WorkerProfileVerification {
    return {
      id: record.id,
      workerProfileId: record.workerProfileId,
      idWithPersonalImageUrl: record.idWithPersonalImageUrl,
      idDocumentUrl: record.idDocumentUrl,
      reason: record.reason,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async exists({ filter }: { filter: WorkerProfileFilter }): Promise<boolean> {
    try {
      if (isEmptyFilter(filter)) return false;
      const count = await this.prismaClient.workerProfile.count({
        where: filter,
      });
      return count > 0;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'exists');
    }
  }

  async find({ filter }: { filter: WorkerProfileFilter }): Promise<WorkerProfile | null> {
    try {
      if (isEmptyFilter(filter)) return null;
      const record = await this.prismaClient.workerProfile.findFirst({
        where: filter,
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async findOnline({
    filter,
    pagination,
    sort,
  }: {
    filter: WorkerProfileFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<WorkerProfile>;
  }): Promise<PaginatedResult<WorkerProfile>> {
    try {
      if (isEmptyFilter(filter)) return getEmptyPaginatedResult();

      const whereCondition = {
        user: { isOnline: true },
        ...filter,
      };

      const total = await this.prismaClient.workerProfile.count({
        where: whereCondition,
      });
      const sortQuery = handleSort(sort);
      const { paginationResult, paginationQuery } = handlePagination({
        total,
        paginationOptions: pagination,
      });

      const profiles = await this.prismaClient.workerProfile.findMany({
        where: whereCondition,
        ...paginationQuery,
        orderBy: sortQuery,
      });

      return {
        data: profiles.map((p) => this.toDomain(p)),
        ...paginationResult,
        count: profiles.length,
        hasNext: paginationResult.page < paginationResult.totalPages,
        hasPrev: paginationResult.page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findOnline');
    }
  }

  async findWorkGovernments({
    filter,
    pagination,
  }: {
    filter: WorkerProfileFilter;
    pagination?: PaginationOptions;
  }): Promise<PaginatedResult<IDType>> {
    try {
      if (isEmptyFilter(filter)) return getEmptyPaginatedResult();

      const workerProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
        include: { workGovernments: true },
      });

      if (!workerProfile) {
        return getEmptyPaginatedResult();
      }

      const governmentIds = workerProfile.workGovernments.map((g) => g.id);
      const total = governmentIds.length;
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        data: governmentIds,
        page,
        limit,
        count: governmentIds.length,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findWorkGovernments');
    }
  }

  async findVerification({
    filter,
  }: {
    filter: WorkerProfileFilter;
  }): Promise<WorkerProfileVerification | null> {
    try {
      if (isEmptyFilter(filter)) return null;
      const workerProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
      });

      if (!workerProfile) return null;

      const verification = await this.prismaClient.workerVerification.findFirst({
        where: { workerProfileId: workerProfile.id },
      });

      return verification ? this.toDomainVerification(verification) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findVerification');
    }
  }

  async findSpecializations({
    mainSpecializationIds,
    filter,
    pagination,
  }: {
    mainSpecializationIds: IDType[];
    filter: WorkerProfileFilter;
    pagination?: PaginationOptions;
  }): Promise<PaginatedResult<IDType>> {
    try {
      if (isEmptyFilter(filter)) return getEmptyPaginatedResult();

      const workerProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
        include: { chosenSpecializations: true },
      });

      if (!workerProfile) {
        return getEmptyPaginatedResult();
      }

      let specializationIds = workerProfile.chosenSpecializations.map((s) => s.specializationId);

      if (mainSpecializationIds.length > 0) {
        specializationIds = specializationIds.filter((id) => mainSpecializationIds.includes(id));
      }

      const uniqueIds = [...new Set(specializationIds)];
      const total = uniqueIds.length;
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        data: uniqueIds,
        page,
        limit,
        count: uniqueIds.length,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findSpecializations');
    }
  }

  async create({
    userId,
    workerProfile,
  }: {
    userId: IDType;
    workerProfile: WorkerProfileCreateInput;
  }): Promise<WorkerProfile> {
    try {
      const record = await this.prismaClient.workerProfile.create({
        data: {
          userId: userId,
          ...workerProfile,
        },
      });
      return this.toDomain(record);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'create');
    }
  }

  async insertWorkGovernments({
    filter,
    governmentIds,
  }: {
    filter: WorkerProfileFilter;
    governmentIds: IDType[];
  }): Promise<void> {
    try {
      if (isEmptyFilter(filter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) return;

      await this.prismaClient.workerProfile.update({
        where: { id: existingProfile.id },
        data: {
          workGovernments: {
            connect: governmentIds.map((gid) => ({ id: gid })),
          },
        },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'insertWorkGovernments');
    }
  }

  async insertSpecializations({
    filter,
    specializations,
  }: {
    filter: WorkerProfileFilter;
    specializations: IDType[];
  }): Promise<void> {
    try {
      if (isEmptyFilter(filter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) return;

      const data = specializations.map((specializationId) => ({
        workerProfileId: existingProfile.id,
        specializationId,
        subSpecializationId: specializationId,
      }));

      await this.prismaClient.chosenSpecialization.createMany({
        data,
        skipDuplicates: true,
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'insertSpecializations');
    }
  }

  async insertSubSpecializations({
    filter,
    specializationsTree,
  }: {
    filter: WorkerProfileFilter;
    specializationsTree: SpecializationsTree;
  }): Promise<void> {
    try {
      if (isEmptyFilter(filter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) return;

      const data = specializationsTree.reduce((acc, current) => {
        return [
          ...acc,
          ...current.subIds.map((subSpecializationId) => ({
            workerProfileId: existingProfile.id,
            specializationId: current.mainId,
            subSpecializationId,
          })),
        ];
      }, []);

      await this.prismaClient.chosenSpecialization.createMany({
        data,
        skipDuplicates: true,
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'insertSubSpecializations');
    }
  }

  async setVerification({
    workerProfileId,
    verification,
  }: {
    workerProfileId: IDType;
    verification: WorkerProfileVerificationCreateInput;
  }): Promise<WorkerProfileVerification> {
    try {
      const existing = await this.prismaClient.workerVerification.findFirst({
        where: { workerProfileId: workerProfileId as string },
      });

      if (existing) {
        const updated = await this.prismaClient.workerVerification.update({
          where: { id: existing.id },
          data: {
            idWithPersonalImageUrl: verification.idWithPersonalImageUrl as string,
            idDocumentUrl: verification.idDocumentUrl as string,
            reason: verification.reason as string | undefined,
            status: verification.status || 'PENDING',
          },
        });

        return this.toDomainVerification(updated);
      }

      const created = await this.prismaClient.workerVerification.create({
        data: {
          workerProfileId: workerProfileId as string,
          idWithPersonalImageUrl: verification.idWithPersonalImageUrl as string,
          idDocumentUrl: verification.idDocumentUrl as string,
          reason: verification.reason as string | undefined,
          status: verification.status || 'PENDING',
        },
      });

      return this.toDomainVerification(created);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'setVerification');
    }
  }

  async update({
    filter,
    workerProfile,
  }: {
    filter: WorkerProfileFilter;
    workerProfile: WorkerProfileUpdateInput;
  }): Promise<WorkerProfile> {
    try {
      if (isEmptyFilter(filter)) {
        throw new Error('Worker profile not found');
      }

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) {
        throw new Error('Worker profile not found');
      }

      const updated = await this.prismaClient.workerProfile.update({
        where: { id: existingProfile.id },
        data: workerProfile,
      });
      return this.toDomain(updated);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'update');
    }
  }

  async delete({ filter }: { filter: WorkerProfileFilter }): Promise<void> {
    try {
      if (isEmptyFilter(filter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) return;

      await this.prismaClient.workerProfile.delete({
        where: { id: existingProfile.id },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'delete');
    }
  }

  async deleteWorkGovernments({
    filter,
    governmentIds,
  }: {
    filter: WorkerProfileFilter;
    governmentIds: IDType[];
  }): Promise<void> {
    try {
      if (isEmptyFilter(filter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) return;

      await this.prismaClient.workerProfile.update({
        where: { id: existingProfile.id },
        data: {
          workGovernments: {
            disconnect: governmentIds.map((gid) => ({ id: gid })),
          },
        },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'deleteWorkGovernments');
    }
  }

  async deleteSpecializations({
    filter,
    specializations,
  }: {
    filter: WorkerProfileFilter;
    specializations: IDType[];
  }): Promise<void> {
    try {
      if (isEmptyFilter(filter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) return;

      await this.prismaClient.chosenSpecialization.deleteMany({
        where: {
          workerProfileId: existingProfile.id,
          specializationId: { in: specializations },
        },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'deleteSpecializations');
    }
  }

  async deleteSubSpecializations({
    filter,
    specializationsTree,
  }: {
    filter: WorkerProfileFilter;
    specializationsTree: SpecializationsTree;
  }): Promise<void> {
    try {
      if (isEmptyFilter(filter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) return;

      for (const treeNode of specializationsTree) {
        await this.prismaClient.chosenSpecialization.deleteMany({
          where: {
            workerProfileId: existingProfile.id,
            specializationId: treeNode.mainId,
            subSpecializationId: { in: treeNode.subIds },
          },
        });
      }
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'deleteSubSpecializations');
    }
  }

  async deleteAllWorkGovernments({ filter }: { filter: WorkerProfileFilter }): Promise<void> {
    try {
      if (isEmptyFilter(filter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) return;

      await this.prismaClient.workerProfile.update({
        where: { id: existingProfile.id },
        data: {
          workGovernments: {
            set: [],
          },
        },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'deleteAllWorkGovernments');
    }
  }

  async deleteAllSpecializations({ filter }: { filter: WorkerProfileFilter }): Promise<void> {
    try {
      if (isEmptyFilter(filter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
      });

      if (!existingProfile) return;

      await this.prismaClient.chosenSpecialization.deleteMany({
        where: {
          workerProfileId: existingProfile.id,
        },
      });
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'deleteAllSpecializations');
    }
  }
}
