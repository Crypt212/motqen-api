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
  WorkerSearchInput,
  WorkerSearchItem,
  WorkerProfileUpdateInput,
  WorkerProfileVerification,
  WorkerProfileVerificationCreateInput,
} from '../../domain/workerProfile.entity.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../../types/query.js';
import { AccountStatus, PrismaClient, VerificationStatus } from 'src/generated/prisma/client.js';

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
    categoryId = undefined,
    specializationId = undefined,
    subSpecializationId = undefined,
    governmentId = undefined,
    area = undefined,
    city = undefined,
    availability = undefined,
    acceptsUrgentJobs = false,
    highestRated = false,
    nearest = false,
    customerGovernmentLatitude = undefined,
    customerGovernmentLongitude = undefined,
    customerGovernmentName = undefined,
    currentUserId = undefined,
    page = 1,
    limit = 10,
  }: WorkerSearchInput): Promise<
    PaginatedResultMeta & {
      workers: WorkerSearchItem[];
    }
  > {
    void customerGovernmentName;
    void currentUserId;

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

      const selectedSubSpecializationId = subSpecializationId || categoryId;

      if (specializationId || selectedSubSpecializationId) {
        whereClause.chosenSpecializations = {
          some: {
            ...(specializationId ? { specializationId } : {}),
            ...(selectedSubSpecializationId
              ? { subSpecializationId: selectedSubSpecializationId }
              : {}),
          },
        };
      }
    } catch (error: unknown) {
      handlePrismaError(error, 'searchWorkers');
    }

    if (acceptsUrgentJobs === true) {
      whereClause.acceptsUrgentJobs = true;
    }

    const areaFilter = governmentId || city || area;

    if (areaFilter) {
      whereClause.workGovernments = {
        some: {
          OR: [
            { id: areaFilter },
            {
              name: {
                equals: areaFilter,
                mode: 'insensitive',
              },
            },
          ],
        },
      };
    }

    // Get total count
    const total = await this.prismaClient.workerProfile.count({
      where: whereClause,
    });

    const toRadians = (value: number): number => (value * Math.PI) / 180;
    const calcDistanceKm = (
      originLat: number,
      originLong: number,
      destinationLat: number,
      destinationLong: number
    ): number => {
      const earthRadiusKm = 6371;
      const deltaLatitude = toRadians(destinationLat - originLat);
      const deltaLongitude = toRadians(destinationLong - originLong);
      const a =
        Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
        Math.cos(toRadians(originLat)) *
          Math.cos(toRadians(destinationLat)) *
          Math.sin(deltaLongitude / 2) *
          Math.sin(deltaLongitude / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return earthRadiusKm * c;
    };

    const customerLat = Number.parseFloat(String(customerGovernmentLatitude ?? ''));
    const customerLong = Number.parseFloat(String(customerGovernmentLongitude ?? ''));
    const hasCustomerCoordinates = Number.isFinite(customerLat) && Number.isFinite(customerLong);

    let nearestDistanceByWorkerId: Record<string, number | null> = {};
    let orderedWorkerIdsByNearest: string[] | null = null;

    if (nearest && hasCustomerCoordinates) {
      const matchingWorkers = await this.prismaClient.workerProfile.findMany({
        where: whereClause,
        select: {
          id: true,
        },
      });

      const matchingWorkerIds = matchingWorkers.map((worker) => worker.id);

      if (matchingWorkerIds.length > 0) {
        const nearestRows = await this.prismaClient.$queryRawUnsafe<
          Array<{
            id: string;
            distance_km: number | null;
          }>
        >(
          `
            SELECT
              wp.id,
              MIN(
                6371 * 2 * ASIN(
                  SQRT(
                    POWER(SIN((RADIANS(CAST(g.lat AS double precision)) - RADIANS($2::double precision)) / 2), 2) +
                    COS(RADIANS($2::double precision)) * COS(RADIANS(CAST(g.lat AS double precision))) *
                    POWER(SIN((RADIANS(CAST(g.long AS double precision)) - RADIANS($3::double precision)) / 2), 2)
                  )
                )
              ) AS distance_km
            FROM worker_profiles wp
            LEFT JOIN governments_for_workers gfw ON gfw."workerProfileId" = wp.id
            LEFT JOIN governments g ON g.id = gfw."governmentId"
            WHERE wp.id = ANY($1::text[])
            GROUP BY wp.id
            ORDER BY distance_km ASC NULLS LAST, wp."experienceYears" DESC, wp.id DESC
            LIMIT $4 OFFSET $5
          `,
          matchingWorkerIds,
          customerLat,
          customerLong,
          normalizedLimit,
          skip
        );

        orderedWorkerIdsByNearest = nearestRows.map((row) => row.id);
        nearestDistanceByWorkerId = nearestRows.reduce<Record<string, number | null>>(
          (acc, row) => {
            acc[row.id] = typeof row.distance_km === 'number' ? row.distance_km : null;
            return acc;
          },
          {}
        );
      } else {
        orderedWorkerIdsByNearest = [];
      }
    }

    // Fetch workers with relations
    const workers = await this.prismaClient.workerProfile.findMany({
      where:
        nearest && orderedWorkerIdsByNearest
          ? {
              ...whereClause,
              id: {
                in: orderedWorkerIdsByNearest,
              },
            }
          : whereClause,
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
        orders: {
          select: {
            rating: true,
            status: true,
          },
        },
        workGovernments: {
          select: {
            id: true,
            name: true,
            lat: true,
            long: true,
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
      orderBy:
        nearest && orderedWorkerIdsByNearest
          ? undefined
          : [{ experienceYears: 'desc' }, { id: 'desc' }],
      skip: nearest && orderedWorkerIdsByNearest ? undefined : skip,
      take: nearest && orderedWorkerIdsByNearest ? undefined : normalizedLimit,
    });

    const computedWorkers = workers.map((worker) => {
      const ratedOrders = worker.orders.filter((order) => typeof order.rating === 'number');
      const rating =
        ratedOrders.length > 0
          ? ratedOrders.reduce((sum, order) => sum + order.rating, 0) / ratedOrders.length
          : 0;
      const completedServices = worker.orders.filter(
        (order) => order.status === 'COMPLETED' || order.status === 'REVIEWED'
      ).length;

      let nearestDistanceKm = null;
      if (nearest && worker.id in nearestDistanceByWorkerId) {
        nearestDistanceKm = nearestDistanceByWorkerId[worker.id];
      } else if (hasCustomerCoordinates) {
        for (const government of worker.workGovernments) {
          const governmentLat = Number.parseFloat(String(government.lat ?? ''));
          const governmentLong = Number.parseFloat(String(government.long ?? ''));
          if (!Number.isFinite(governmentLat) || !Number.isFinite(governmentLong)) {
            continue;
          }

          const distance = calcDistanceKm(customerLat, customerLong, governmentLat, governmentLong);
          if (nearestDistanceKm === null || distance < nearestDistanceKm) {
            nearestDistanceKm = distance;
          }
        }
      }

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

    // Transform data to response format
    const data = sortedWorkers.map(({ worker, rating, completedServices, nearestDistanceKm }) => ({
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
      ...(nearestDistanceKm !== null ? { distanceKm: Number(nearestDistanceKm.toFixed(1)) } : {}),
    }));

    const totalPages = Math.ceil(total / normalizedLimit);

    return {
      workers: data,
      total,
      page: normalizedPage,
      limit: normalizedLimit,
      count: data.length,
      hasNext: page != totalPages,
      hasPrev: page != 1,
      totalPages,
    };
  }
}
