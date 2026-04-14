import IWorkerProfileRepository from '../interfaces/WorkerRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { IDType } from '../interfaces/Repository.js';
import {
  getPaginationQuery,
  getPaginationResult,
  handleSort,
  isEmptyFilter,
  paginateResult,
} from '../../utils/handleFilteration.js';
import { SpecializationsTree } from '../../domain/specialization.entity.js';
import {
  WorkerProfile,
  WorkerProfileCreateInput,
  WorkerProfileFilter,
  WorkerProfileUpdateInput,
  WorkerProfileVerification,
  WorkerProfileVerificationCreateInput,
} from '../../domain/workerProfile.entity.js';
import { PaginationOptions, PaginatedResult, SortOptions } from '../../types/query.js';
import {
  AccountStatus,
  Prisma,
  PrismaClient,
  VerificationStatus,
} from '../../generated/prisma/client.js';

export default class WorkerProfileRepository
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
  }): Promise<PaginatedResult<{ workerProfiles: WorkerProfile[] }>> {
    try {
      const whereCondition = {
        user: { isOnline: true },
        ...workerFilter,
      };

      const sortQuery = handleSort(sort);
      const paginationQuery = getPaginationQuery(pagination);

      const profiles = await this.prismaClient.workerProfile.findMany({
        where: whereCondition,
        take: paginationQuery.take + 1,
        skip: paginationQuery.skip,
        orderBy: sortQuery,
      });

      const paginationResult = getPaginationResult({
        count: profiles.length,
        hasNext: profiles.length > paginationQuery.take,
        paginationOptions: pagination,
      });

      return paginateResult(
        { workerProfiles: profiles.map((p) => this.toDomain(p)).slice(0, profiles.length - 1) },
        paginationResult
      );
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
  }): Promise<PaginatedResult<{ governmentIds: IDType[] }>> {
    try {
      const paginationQuery = getPaginationQuery(pagination);

      const workGovernments = await this.prismaClient.government.findMany({
        where: {
          workers: { some: workerFilter },
        },
        take: paginationQuery.take + 1,
        skip: paginationQuery.skip,
      });
      const governmentIds = workGovernments.map((g) => g.id);

      const paginationResult = getPaginationResult({
        count: governmentIds.length,
        hasNext: governmentIds.length > paginationQuery.take,
        paginationOptions: pagination,
      });

      return paginateResult(
        { governmentIds: governmentIds.slice(0, governmentIds.length - 1) },
        paginationResult
      );
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
  }): Promise<PaginatedResult<{ specializationIds: IDType[] }>> {
    try {
      const paginationQuery = getPaginationQuery(pagination);
      const chosenSpecializations = await this.prismaClient.chosenSpecialization.findMany({
        where: { workerProfile: filter },
        take: paginationQuery.take + 1,
        skip: paginationQuery.skip,
      });

      let specializationIds = chosenSpecializations.map((s) => s.specializationId);

      if (mainSpecializationIds.length > 0) {
        specializationIds = specializationIds.filter((id) => mainSpecializationIds.includes(id));
      }

      const paginationResult = getPaginationResult({
        count: specializationIds.length,
        hasNext: specializationIds.length > paginationQuery.take,
        paginationOptions: pagination,
      });

      return paginateResult(
        { specializationIds: specializationIds.slice(0, specializationIds.length - 1) },
        paginationResult
      );
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

      await this.prismaClient.chosenSpecialization.deleteMany({
        where: {
          workerProfileId: existingProfile.id,
          OR: specializationsTree.map((treeNode) => ({
            specializationId: treeNode.mainId,
            subSpecializationId: { in: treeNode.subIds },
          })),
        },
      });
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
    PaginatedResult<{
      workers: {
        workerId: string;
        name: string;
        profileImage: string;
        rating: number;
        ratingCount: number;
        distance?: number;
        isAvailableNow: boolean;
        completedServices: number;
      }[];
    }>
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
            _count: {
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
      ratingRows.map((row) => [
        row.workerProfileId,
        {
          rating: Number(row._avg.rating ?? 0),
          ratingCount: Number(row._count.rating ?? 0),
        },
      ])
    );
    const completedMap = new Map(
      completedRows.map((row) => [row.workerProfileId, Number(row._count._all ?? 0)])
    );

    const computedWorkers = workers.map((worker) => {
      const ratingData = ratingMap.get(worker.id) ?? { rating: 0, ratingCount: 0 };
      const completedServices = completedMap.get(worker.id) ?? 0;

      const nearestDistance = nearestDistanceMap.get(worker.id) ?? null;

      return {
        worker,
        rating: ratingData.rating,
        ratingCount: ratingData.ratingCount,
        completedServices,
        nearestDistance,
      };
    });

    const sortedWorkers = computedWorkers.sort((a, b) => {
      if (nearest && hasCustomerCoordinates) {
        const aDistance = a.nearestDistance;
        const bDistance = b.nearestDistance;

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
      ({ worker, rating, ratingCount, completedServices, nearestDistance }) => {
        return {
          workerId: worker.id,
          name: `${worker.user.firstName} ${worker.user.middleName || ''} ${worker.user.lastName}`.trim(),
          profileImage: worker.user.profileImageUrl,
          rating,
          ratingCount,
          isAvailableNow: worker.user.isOnline,
          completedServices,
          ...(nearestDistance !== null ? { distance: Number(nearestDistance.toFixed(1)) } : {}),
        };
      }
    );

    const totalPages = Math.ceil(total / normalizedLimit);

    return paginateResult(
      {
        workers: data,
      },
      {
        page: normalizedPage,
        limit: normalizedLimit,
        count: data.length,
        hasNext: normalizedPage < totalPages,
        hasPrev: normalizedPage > 1,
      }
    );
  }
}
