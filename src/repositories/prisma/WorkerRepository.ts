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
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../../types/query.js';
import {
  AccountStatus,
  Prisma,
  PrismaClient,
  VerificationStatus,
} from '../../generated/prisma/client.js';

export default class WorkerRepositoryRepository
  extends Repository
  implements IWorkerProfileRepository
{
  constructor(prisma: PrismaClient) {
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

  async exists({ workerFilter }: { workerFilter: WorkerProfileFilter }): Promise<boolean> {
    try {
      if (isEmptyFilter(workerFilter)) return false;
      const count = await this.prismaClient.workerProfile.count({
        where: workerFilter,
      });
      return count > 0;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'exists');
    }
  }

  async find({
    workerFilter,
  }: {
    workerFilter: WorkerProfileFilter;
  }): Promise<WorkerProfile | null> {
    try {
      if (isEmptyFilter(workerFilter)) return null;
      const record = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
      });
      return record ? this.toDomain(record) : null;
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'find');
    }
  }

  async findOnline({
    workerFilter,
    pagination,
    sort,
  }: {
    workerFilter: WorkerProfileFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<WorkerProfile>;
  }): Promise<PaginatedResultMeta & { workerProfiles: WorkerProfile[] }> {
    try {
      if (isEmptyFilter(workerFilter)) return { ...getEmptyPaginatedResult(), workerProfiles: [] };

      const whereCondition = {
        user: { isOnline: true },
        ...workerFilter,
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
        workerProfiles: profiles.map((p) => this.toDomain(p)),
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
    workerFilter,
    pagination,
  }: {
    workerFilter: WorkerProfileFilter;
    pagination?: PaginationOptions;
  }): Promise<PaginatedResultMeta & { governmentIds: IDType[] }> {
    try {
      if (isEmptyFilter(workerFilter)) return { ...getEmptyPaginatedResult(), governmentIds: [] };

      const workerProfile = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
        include: { workGovernments: true },
      });

      if (!workerProfile) {
        return { ...getEmptyPaginatedResult(), governmentIds: [] };
      }

      const governmentIds = workerProfile.workGovernments.map((g) => g.id);
      const total = governmentIds.length;
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        governmentIds,
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
    workerFilter,
  }: {
    workerFilter: WorkerProfileFilter;
  }): Promise<WorkerProfileVerification | null> {
    try {
      if (isEmptyFilter(workerFilter)) return null;
      const workerProfile = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
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
  }): Promise<PaginatedResultMeta & { specializationIds: IDType[] }> {
    try {
      if (isEmptyFilter(filter)) return { ...getEmptyPaginatedResult(), specializationIds: [] };

      const workerProfile = await this.prismaClient.workerProfile.findFirst({
        where: filter,
        include: { chosenSpecializations: true },
      });

      if (!workerProfile) {
        return { ...getEmptyPaginatedResult(), specializationIds: [] };
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
        specializationIds: uniqueIds,
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
    workerFilter,
    governmentIds,
  }: {
    workerFilter: WorkerProfileFilter;
    governmentIds: IDType[];
  }): Promise<void> {
    try {
      if (isEmptyFilter(workerFilter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
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
    workerFilter,
    specializations,
  }: {
    workerFilter: WorkerProfileFilter;
    specializations: IDType[];
  }): Promise<void> {
    try {
      if (isEmptyFilter(workerFilter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
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
    workerFilter,
    specializationsTree,
  }: {
    workerFilter: WorkerProfileFilter;
    specializationsTree: SpecializationsTree;
  }): Promise<void> {
    try {
      if (isEmptyFilter(workerFilter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
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
    workerFilter,
    workerProfile,
  }: {
    workerFilter: WorkerProfileFilter;
    workerProfile: WorkerProfileUpdateInput;
  }): Promise<WorkerProfile> {
    try {
      if (isEmptyFilter(workerFilter)) {
        throw new Error('Worker profile not found');
      }

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
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

  async delete({ workerFilter }: { workerFilter: WorkerProfileFilter }): Promise<void> {
    try {
      if (isEmptyFilter(workerFilter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
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
    workerFilter,
    governmentIds,
  }: {
    workerFilter: WorkerProfileFilter;
    governmentIds: IDType[];
  }): Promise<void> {
    try {
      if (isEmptyFilter(workerFilter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
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
    workerFilter,
    specializations,
  }: {
    workerFilter: WorkerProfileFilter;
    specializations: IDType[];
  }): Promise<void> {
    try {
      if (isEmptyFilter(workerFilter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
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
    workerFilter,
    specializationsTree,
  }: {
    workerFilter: WorkerProfileFilter;
    specializationsTree: SpecializationsTree;
  }): Promise<void> {
    try {
      if (isEmptyFilter(workerFilter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
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

  async deleteAllWorkGovernments({
    workerFilter,
  }: {
    workerFilter: WorkerProfileFilter;
  }): Promise<void> {
    try {
      if (isEmptyFilter(workerFilter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
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

  async deleteAllSpecializations({
    workerFilter,
  }: {
    workerFilter: WorkerProfileFilter;
  }): Promise<void> {
    try {
      if (isEmptyFilter(workerFilter)) return;

      const existingProfile = await this.prismaClient.workerProfile.findFirst({
        where: workerFilter,
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

  // ============================================
  // Search Operations
  // ============================================

  /**
   * Search for approved workers with pagination, filtering, and sorting
   */
  async searchWorkers({
    specializationId,
    subSpecializationId,
    governmentIds = [],
    availability = undefined,
    acceptsUrgentJobs = false,
    highestRated = false,
    nearest = false,
    customerLatitude = undefined,
    customerLongitude = undefined,
    page = 1,
    limit = 10,
  }: {
    specializationId: string;
    subSpecializationId?: string;
    governmentIds?: string[];
    availability?: boolean;
    acceptsUrgentJobs: boolean;
    highestRated: boolean;
    nearest: boolean;
    customerLatitude?: string | number;
    customerLongitude?: string | number;
    page: number;
    limit: number;
  }): Promise<
    PaginatedResultMeta & {
      workers: {
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
      }[];
    }
  > {
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page;
    const normalizedLimit = Math.min(Math.max(parsedLimit || 10, 1), 50);
    const normalizedPage = Math.max(parsedPage || 1, 1);
    const skip = (normalizedPage - 1) * normalizedLimit;

    const whereClause: {
      verification: {
        status: VerificationStatus;
      };
      user: {
        status: AccountStatus;
        isOnline?: boolean;
      };
      chosenSpecializations?: {
        some: unknown;
      };
      acceptsUrgentJobs?: boolean;
      workGovernments?: unknown;
    } = {
      verification: { status: VerificationStatus.APPROVED },
      user: { status: AccountStatus.ACTIVE },
    };

    try {
      if (availability !== undefined && availability !== null) {
        whereClause.user.isOnline = availability === true;
      }

      whereClause.chosenSpecializations = {
        some: {
          specializationId,
          ...(subSpecializationId ? { subSpecializationId } : {}),
        },
      };

      if (governmentIds.length > 0) {
        whereClause.workGovernments = {
          some: {
            id: {
              in: governmentIds,
            },
          },
        };
      }
    } catch (error: unknown) {
      handlePrismaError(error, 'searchWorkers');
    }

    if (acceptsUrgentJobs === true) {
      whereClause.acceptsUrgentJobs = true;
    }

    // Get total count
    const total = await this.prismaClient.workerProfile.count({
      where: whereClause,
    });

    // Fetch workers with relations
    const workers = await this.prismaClient.workerProfile.findMany({
      where: whereClause,
      select: {
        id: true,
        experienceYears: true,
        acceptsUrgentJobs: true,
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            profileImageUrl: true,
            isOnline: true,
          },
        },
        workGovernments: {
          select: {
            id: true,
            name: true,
            ...(nearest ? { lat: true, long: true } : {}),
          },
        },
        chosenSpecializations: {
          select: {
            subSpecialization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ experienceYears: 'desc' }, { id: 'desc' }],
    });

    const workerIds = workers.map((worker) => worker.id);

    const customerLat = Number.parseFloat(String(customerLatitude ?? ''));
    const customerLong = Number.parseFloat(String(customerLongitude ?? ''));
    const hasCustomerCoordinates = Number.isFinite(customerLat) && Number.isFinite(customerLong);

    const nearestRowsPromise =
      nearest && hasCustomerCoordinates && workerIds.length > 0
        ? this.prismaClient.$queryRaw<
            Array<{ workerProfileId: string; distanceKm: number | null }>
          >`
            SELECT
              gfw."workerProfileId" AS "workerProfileId",
              MIN(
                6371 * ACOS(
                  LEAST(
                    1,
                    GREATEST(
                      -1,
                      COS(RADIANS(${customerLat})) *
                        COS(RADIANS(CAST(g."lat" AS double precision))) *
                        COS(RADIANS(CAST(g."long" AS double precision)) - RADIANS(${customerLong})) +
                        SIN(RADIANS(${customerLat})) *
                        SIN(RADIANS(CAST(g."lat" AS double precision)))
                    )
                  )
                )
              )::double precision AS "distanceKm"
            FROM "governments_for_workers" gfw
            INNER JOIN "governments" g ON g."id" = gfw."governmentId"
            WHERE gfw."workerProfileId" IN (${Prisma.join(workerIds)})
              AND g."lat" ~ '^-?[0-9]+(\\.[0-9]+)?$'
              AND g."long" ~ '^-?[0-9]+(\\.[0-9]+)?$'
            GROUP BY gfw."workerProfileId"
          `
        : Promise.resolve([]);

    const ratingRowsPromise =
      workerIds.length > 0
        ? this.prismaClient.order.groupBy({
            by: ['workerProfileId'],
            where: {
              workerProfileId: {
                in: workerIds,
              },
            },
            _avg: {
              rating: true,
            },
          })
        : Promise.resolve([]);

    const completedRowsPromise =
      workerIds.length > 0
        ? this.prismaClient.order.groupBy({
            by: ['workerProfileId'],
            where: {
              workerProfileId: {
                in: workerIds,
              },
              status: {
                in: ['COMPLETED', 'REVIEWED'],
              },
            },
            _count: {
              _all: true,
            },
          })
        : Promise.resolve([]);

    const [nearestRows, ratingRows, completedRows] = await Promise.all([
      nearestRowsPromise,
      ratingRowsPromise,
      completedRowsPromise,
    ]);

    const nearestDistanceMap = new Map(
      nearestRows
        .filter((row) => typeof row.distanceKm === 'number' && Number.isFinite(row.distanceKm))
        .map((row) => [row.workerProfileId, Number(row.distanceKm)])
    );

    const ratingMap = new Map(
      ratingRows.map((row) => [row.workerProfileId, Number(row._avg.rating ?? 0)])
    );
    const completedMap = new Map(
      completedRows.map((row) => [row.workerProfileId, Number(row._count._all ?? 0)])
    );

    const computedWorkers = workers.map((worker) => {
      const rating = ratingMap.get(worker.id) ?? 0;
      const completedServices = completedMap.get(worker.id) ?? 0;

      const nearestDistanceKm = nearestDistanceMap.get(worker.id) ?? null;

      return {
        worker,
        rating,
        completedServices,
        nearestDistanceKm,
      };
    });

    const sortedWorkers = computedWorkers.sort((a, b) => {
      if (nearest && hasCustomerCoordinates) {
        const aDistance = a.nearestDistanceKm;
        const bDistance = b.nearestDistanceKm;

        if (aDistance === null && bDistance !== null) return 1;
        if (aDistance !== null && bDistance === null) return -1;
        if (aDistance !== null && bDistance !== null && aDistance !== bDistance) {
          return aDistance - bDistance;
        }
      }

      if (highestRated && b.rating !== a.rating) return b.rating - a.rating;
      if (b.completedServices !== a.completedServices)
        return b.completedServices - a.completedServices;
      return b.worker.experienceYears - a.worker.experienceYears;
    });

    const paginatedWorkers = sortedWorkers.slice(skip, skip + normalizedLimit);

    // Transform data to response format
    const data = paginatedWorkers.map(
      ({ worker, rating, completedServices, nearestDistanceKm }) => {
        return {
          workerId: worker.id,
          name: `${worker.user.firstName} ${worker.user.middleName || ''} ${worker.user.lastName}`.trim(),
          profileImage: worker.user.profileImageUrl,
          service_title:
            worker.chosenSpecializations.length > 0
              ? worker.chosenSpecializations[0].subSpecialization.name
              : null,
          rating,
          area: worker.workGovernments.length > 0 ? worker.workGovernments[0].name : null,
          isAvailableNow: worker.user.isOnline,
          completedServices,
          acceptsUrgentJobs: worker.acceptsUrgentJobs,
          ...(nearestDistanceKm !== null
            ? { distanceKm: Number(nearestDistanceKm.toFixed(1)) }
            : {}),
        };
      }
    );

    const totalPages = Math.ceil(total / normalizedLimit);

    return {
      workers: data,
      total,
      page: normalizedPage,
      limit: normalizedLimit,
      count: data.length,
      hasNext: normalizedPage < totalPages,
      hasPrev: normalizedPage > 1,
      totalPages,
    };
  }
}
