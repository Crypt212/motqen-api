import AppError from '../../errors/AppError.js';
import IWorkerProfileRepository from '../interfaces/WorkerRepository.js';
import { handlePrismaError, Repository } from './Repository.js';
import { IDType } from '../interfaces/Repository.js';
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
import { WorkingHours as WorkingHoursEntity } from '../../domain/workingHours.entity.js';
import { handlePagination, handleSort } from '../../utils/handleFilteration.js';
import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../../types/query.js';
import { AccountStatus, Prisma, PrismaClient } from '../../generated/prisma/client.js';
import type { ExploreWorkerPublicDetail } from '../../types/exploreWorker.js';

export type { ExploreWorkerPublicDetail };

type ExploreWorkerPrismaRow = Prisma.WorkerProfileGetPayload<{
  include: {
    user: true;
    portfolio: { include: { projectImages: true } };
  };
}>;

export default class WorkerProfileRepository
  extends Repository
  implements IWorkerProfileRepository
{
  constructor(
    prisma: PrismaClient | import('../../generated/prisma/client.js').Prisma.TransactionClient
  ) {
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

  private toDomainWorkingHours(record: Prisma.WorkingHoursGetPayload<object>): WorkingHoursEntity {
    return {
      id: record.id,
      workerProfileId: record.workerProfileId,
      daysOfWeek: record.daysOfWeek,
      startTime: record.startTime,
      endTime: record.endTime,
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

  /**
   * Public explore profile: approved worker, active user, with user / portfolio / project images.
   * Missing relations are returned as null; arrays are never undefined.
   */
  async findExploreWorkerById(userId: string): Promise<ExploreWorkerPublicDetail | null> {
    try {
      const record = await this.prismaClient.workerProfile.findFirst({
        where: {
          userId: userId,
          user: { status: AccountStatus.ACTIVE },
        },
        include: {
          user: true,

          portfolio: {
            include: {
              projectImages: { orderBy: { createdAt: 'asc' } },
            },
          },
          chosenSpecializations: true,
        },
      });

      if (!record) return null;
      return this.mapExploreWorkerPublicDetail(record as ExploreWorkerPrismaRow);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findExploreWorkerById');
    }
  }

  private mapExploreWorkerPublicDetail(row: ExploreWorkerPrismaRow): ExploreWorkerPublicDetail {
    const nullable = <T>(v: T | null | undefined): T | null => (v == null ? null : v);

    return {
      id: row.id,
      userId: row.userId,
      portfolioId: nullable(row.portfolioId),
      experienceYears: row.experienceYears,
      isInTeam: row.isInTeam,
      acceptsUrgentJobs: row.acceptsUrgentJobs,
      bio: nullable(row.bio),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: {
        id: row.user.id,
        phoneNumber: row.user.phoneNumber,
        firstName: row.user.firstName,
        middleName: row.user.middleName,
        lastName: row.user.lastName,
        profileImageUrl: nullable(row.user.profileImageUrl),
        status: row.user.status,
        role: row.user.role,
        isOnline: row.user.isOnline,
        createdAt: row.user.createdAt,
        updatedAt: row.user.updatedAt,
      },
      portfolio: row.portfolio
        ? {
            id: row.portfolio.id,
            workerProfileId: row.portfolio.workerProfileId,
            description: nullable(row.portfolio.description),
            createdAt: row.portfolio.createdAt,
            updatedAt: row.portfolio.updatedAt,
            projectImages: (row.portfolio.projectImages ?? []).map((img) => ({
              id: img.id,
              portfolioId: img.portfolioId,
              imageUrl: img.imageUrl,
              createdAt: img.createdAt,
              updatedAt: img.updatedAt,
            })),
          }
        : null,
    };
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

  async findWorkingHoursByUserId({
    userId,
  }: {
    userId: IDType;
  }): Promise<WorkingHoursEntity | null> {
    try {
      const workerProfile = await this.prismaClient.workerProfile.findFirst({
        where: { userId: userId as string },
        include: { workingHours: true },
      });

      if (!workerProfile?.workingHours) return null;

      return this.toDomainWorkingHours(workerProfile.workingHours);
    } catch (error: unknown) {
      throw handlePrismaError(error as Error, 'findWorkingHoursByUserId');
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
          user: { connect: { id: userId } },
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
    governmentId,
    availability,
    acceptsUrgentJobs,
    highestRated,
    nearest,
    location,
    page = 1,
    limit = 10,
    excludeUserId,
  }: {
    specializationId: string;
    subSpecializationId?: string;
    governmentId?: string;
    availability?: boolean;
    acceptsUrgentJobs?: boolean;
    highestRated?: boolean;
    nearest?: boolean;
    location?: { latitude: number; longitude: number };
    page: number;
    limit: number;
    excludeUserId?: string;
  }): Promise<{
    workers: {
      workerId: string;
      name: string;
      profileImage: string | null;
      rating: number;
      ratingCount: number;
      completedServices: number;
      distance?: number;
      isAvailableNow: boolean;
    }[];
    meta: {
      page: number;
      limit: number;
      count: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const parsedLimit =
      typeof limit === 'string' ? Math.min(parseInt(limit, 10), 20) : Math.min(limit, 20);

    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page;
    const normalizedLimit = Math.min(Math.max(parsedLimit || 10, 1), 50);
    const normalizedPage = Math.max(parsedPage || 1, 1);
    const offset = (normalizedPage - 1) * normalizedLimit;
    const fetchLimit = normalizedLimit + 1;

    const customerLat = location?.latitude;
    const customerLong = location?.longitude;
    const hasCoords = Number.isFinite(customerLat) && Number.isFinite(customerLong);

    const specFilter = subSpecializationId
      ? Prisma.sql`
        AND EXISTS (
          SELECT 1 FROM "chosen_specializations" cs
          WHERE cs."workerProfileId"     = wp."id"
            AND cs."subSpecializationId" = ${subSpecializationId}
        )`
      : specializationId
        ? Prisma.sql`
          AND EXISTS (
            SELECT 1 FROM "chosen_specializations" cs
            LEFT JOIN "sub_specializations" ss ON ss."id" = cs."subSpecializationId"
            WHERE cs."workerProfileId" = wp."id"
              AND (
                cs."specializationId"      = ${specializationId}
                OR ss."mainSpecializationId" = ${specializationId}
              )
          )`
        : Prisma.sql``;

    const availFilter =
      availability !== undefined ? Prisma.sql`AND u."isOnline" = ${availability}` : Prisma.sql``;

    const urgentFilter = acceptsUrgentJobs
      ? Prisma.sql`AND wp."acceptsUrgentJobs" = true`
      : Prisma.sql``;

    const govFilter = governmentId
      ? Prisma.sql`
        AND EXISTS (
          SELECT 1 FROM "_GovernmentToWorkerProfile" gfw
          WHERE gfw."B" = wp."id"
            AND gfw."A" = ${governmentId}
        )`
      : Prisma.sql``;

    // ─── geometry ─────────────────────────────────────────────────────────────

    const userPoint = hasCoords
      ? Prisma.sql`ST_SetSRID(ST_MakePoint(${customerLong}, ${customerLat}), 4326)::geography`
      : Prisma.sql`NULL::geography`;

    const geoFilter =
      nearest && hasCoords
        ? Prisma.sql`
        AND l."pointGeography" IS NOT NULL
        AND ST_DWithin(l."pointGeography", ${userPoint}::geography, 100000)`
        : Prisma.sql``;

    const distanceLateral = hasCoords
      ? Prisma.sql`
        LEFT JOIN LATERAL (
          SELECT LEAST((l2."pointGeography" <-> ${userPoint}::geography) / 1000.0, 9999.9) AS distance_km
          FROM   "locations" l2
          WHERE  l2."userId" = wp."userId"
            AND  l2."isMain" = true
            AND  l2."pointGeography" IS NOT NULL
          LIMIT 1
        ) loc_dist ON true`
      : Prisma.sql``;

    const distanceSelect = hasCoords
      ? Prisma.sql`loc_dist.distance_km`
      : Prisma.sql`NULL::double precision`;

    // ─── exclude own profile ────────────────────────────────────────────────────

    const excludeSelfFilter = excludeUserId
      ? Prisma.sql`AND wp."userId" != ${excludeUserId}`
      : Prisma.sql``;

    // ─── ordering ─────────────────────────────────────────────────────────────
    //
    // nearest flag    → distance أولاً
    // highestRated    → rate أولاً
    // لا flags        → hybrid score عشان نعطي فرصة للـ new workers
    //                   (rate * 0.4) + (completedJobs * 0.3) + (userHash * 0.3)
    //                   الـ userHash ثابت لكل يوزر (نفس قيمة الـ random لكن ثابتة للمستخدم)

    const orderExpr =
      nearest && hasCoords
        ? Prisma.sql`
        loc_dist.distance_km ASC NULLS LAST,
        wp."rate"              DESC,
        wp."completedJobsCount" DESC`
        : highestRated
          ? Prisma.sql`
          wp."rate"              DESC,
          wp."completedJobsCount" DESC,
          wp."experienceYears"    DESC`
          : Prisma.sql`
          (
            COALESCE(wp."rate", 0)               * 0.4 +
            LEAST(wp."completedJobsCount", 100)  * 0.003 +
            (ABS(HASHTEXT(wp."userId" || ${excludeUserId ?? ''})) % 1000 / 1000.0) * 0.3
          ) DESC`;
    //
    // ملاحظة على الـ hybrid:
    // - LEAST(..., 100) عشان متخليش workers بـ 1000 job يطغوا على الـ score بشكل غير عادل
    // - completedJobsCount * 0.003 يساوي max 0.3 لو عنده 100+ job (نفس وزن الـ random)
    // - rate max هو 5.0، يعني rate * 0.4 = max 2.0
    // النتيجة: worker جديد بـ random 0.3 ممكن يتفوق على worker قديم بـ rate وسط

    // ─── query ────────────────────────────────────────────────────────────────

    type Row = {
      worker_id: string;
      first_name: string;
      middle_name: string | null;
      last_name: string;
      profile_image_url: string | null;
      is_online: boolean;
      rate: number;
      completed_jobs_count: number;
      distance_km: number | null;
    };

    const rows = await this.prismaClient.$queryRaw<Row[]>`
    WITH filtered AS  (
      SELECT wp."id"
      FROM   "worker_profiles" wp
      JOIN   "users"         u  ON  u."id"              = wp."userId"
      LEFT JOIN "locations"  l  ON  l."userId"          = wp."userId"
                                AND l."isMain"          = true
      WHERE  u."status" = 'ACTIVE'
        ${availFilter}
        ${urgentFilter}
        ${govFilter}
        ${geoFilter}
        ${specFilter}
        ${excludeSelfFilter}
    )

    SELECT
      wp."userId"             AS worker_id,
      u."firstName"           AS first_name,
      u."middleName"          AS middle_name,
      u."lastName"            AS last_name,
      u."profileImageUrl"     AS profile_image_url,
      u."isOnline"            AS is_online,
      wp."rate"               AS rate,
      wp."completedJobsCount" AS completed_jobs_count,
      ${distanceSelect}       AS distance_km

    FROM   filtered f
    JOIN   "worker_profiles" wp ON wp."id" = f."id"
    JOIN   "users"           u  ON  u."id" = wp."userId"
    ${distanceLateral}

    ORDER BY ${orderExpr}
    LIMIT    ${fetchLimit}
    OFFSET   ${offset}
  `;

    // ─── hasNext ──────────────────────────────────────────────────────────────

    const hasNext = rows.length > normalizedLimit;
    const pageRows = hasNext ? rows.slice(0, normalizedLimit) : rows;

    // Rows processed

    // ─── format ───────────────────────────────────────────────────────────────

    const workers = pageRows.map((r) => ({
      workerId: r.worker_id,
      name: `${r.first_name} ${r.middle_name ?? ''} ${r.last_name}`.trim(),
      profileImage: r.profile_image_url,
      rating: Number(r.rate),
      ratingCount: 0, // TODO: Add rating count to query when orders table has ratings
      completedServices: Number(r.completed_jobs_count),
      isAvailableNow: r.is_online,
      ...(r.distance_km !== null ? { distance: Number(Number(r.distance_km).toFixed(1)) } : {}),
    }));

    return {
      workers,
      meta: {
        page: normalizedPage,
        limit: normalizedLimit,
        count: workers.length,
        hasNext,
        hasPrev: normalizedPage > 1,
      },
    };
  }

  async findOccupiedTimeSlots(params: {
    workerId: string;
    selectedDate: string;
  }): Promise<{ startDate: Date; endDate: Date }[]> {
    const workerProfile = await this.prismaClient.workerProfile.findFirst({
      where: { userId: params.workerId },
      select: { id: true },
    });
    if (!workerProfile) return [];

    const dateOnly = new Date(params.selectedDate).toISOString().slice(0, 10);
    const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);

    const slots = await this.prismaClient.workerOccupiedTimeSlot.findMany({
      where: {
        workerProfileId: workerProfile.id,
        startDate: { lt: endOfDay },
        endDate: { gt: startOfDay },
      },
      select: {
        startDate: true,
        endDate: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return slots;
  }

  async replaceWorkingHours(params: {
    workerProfileId: string;
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
  }): Promise<void> {
    try {
      await this.prismaClient.$transaction(async (tx) => {
        // 1. Fetch current working hours
        const currentHours = await tx.workingHours.findUnique({
          where: { workerProfileId: params.workerProfileId },
        });

        const currentDays = currentHours ? currentHours.daysOfWeek : [];

        // Identify which days are being removed from availability
        const removedDays = currentDays.filter((day) => !params.daysOfWeek.includes(day));

        if (removedDays.length > 0) {
          // 2. Check for conflicts BEFORE deleting
          const activeOrders = await tx.order.findMany({
            where: {
              workerProfileId: params.workerProfileId,
              orderStatus: { in: ['TIME_SPECIFIED', 'PRICE_AGREED', 'PAID'] },
            },
            select: { id: true, startDate: true },
          });

          const conflictOrderIds: string[] = [];

          for (const order of activeOrders) {
            // getUTCDay() ensures days are consistently mapped to 0-6 without local server timezone shifts
            const orderDay = order.startDate.getUTCDay().toString();
            if (removedDays.includes(orderDay)) {
              conflictOrderIds.push(order.id);
            }
          }

          // 3. If conflict exists, THROW 409 Conflict
          if (conflictOrderIds.length > 0) {
            throw new AppError(
              'You have active orders on the removed days. Cancel or reschedule them before closing this day.',
              409,
              {
                toJSON: () => ({ conflictOrderIds }),
              }
            );
          }
        }

        // 4. Safe to proceed: Replace-all logic
        await tx.workingHours.deleteMany({
          where: { workerProfileId: params.workerProfileId },
        });

        // Missing days treated as CLOSED (only store if days are provided)
        if (params.daysOfWeek.length > 0) {
          await tx.workingHours.create({
            data: {
              workerProfileId: params.workerProfileId,
              daysOfWeek: params.daysOfWeek,
              startTime: params.startTime,
              endTime: params.endTime,
            },
          });
        }
      });
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error; // Bubble up our custom 409 Conflict Error
      }
      throw handlePrismaError(error as Error, 'replaceWorkingHours');
    }
  }
}
