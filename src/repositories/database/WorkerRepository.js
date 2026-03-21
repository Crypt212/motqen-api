/**
 * @fileoverview WorkerRepository - Database access for worker profiles
 * @module repositories/database/WorkerRepository
 */

import { handlePrismaError, Repository } from './Repository.js';
import * as pkg from '@prisma/client';

/**
 * WorkerRepository — handles database operations for worker profiles
 * @class
 * @extends Repository
 */
export default class WorkerRepository extends Repository {
  /** @param {pkg.PrismaClient} prisma */
  constructor(prisma) {
    super(prisma);
  }

  // ============================================
  // Standard CRUD Operations
  // ============================================

  /**
   * Find worker profile by ID
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.id
   * @returns {Promise<pkg.WorkerProfile | null>}
   */
  async findById({ id }) {
    try {
      return await this.prismaClient.workerProfile.findUnique({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error, 'findById');
    }
  }

  /**
   * Find first worker profile matching the criteria
   * @param {Object} params
   * @param {import('./Repository.js').IDType} [params.userId]
   * @returns {Promise<pkg.WorkerProfile | null>}
   */
  async findFirst({ userId }) {
    try {
      return await this.prismaClient.workerProfile.findFirst({
        where: {
          ...(userId && { userId }),
        },
      });
    } catch (error) {
      handlePrismaError(error, 'findFirst');
    }
  }

  /**
   * Check if worker profile exists
   * @param {Object} params
   * @param {import('./Repository.js').IDType} [params.id]
   * @param {import('./Repository.js').IDType} [params.userId]
   * @returns {Promise<boolean>}
   */
  async exists({ id, userId }) {
    try {
      const count = await this.prismaClient.workerProfile.count({
        where: {
          ...(id && { id }),
          ...(userId && { userId }),
        },
      });
      return count > 0;
    } catch (error) {
      handlePrismaError(error, 'exists');
    }
  }

  /**
   * Find many worker profiles with pagination, filtering, and ordering
   * @param {Object} params
   * @param {pkg.Prisma.WorkerProfileFindManyArgs} [params.filter]
   * @returns {Promise<pkg.WorkerProfile[]>}
   */
  async findMany({ filter = {} }) {
    try {
      const data = await this.prismaClient.workerProfile.findMany(filter);
      return data;
    } catch (error) {
      handlePrismaError(error, 'findMany');
    }
  }

  /**
   * Create a new worker profile
   * @param {Object} params
   * @param {pkg.Prisma.WorkerProfileCreateInput} params.data
   * @returns {Promise<pkg.WorkerProfile>}
   */
  async create({ data }) {
    try {
      return await this.prismaClient.workerProfile.create({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'create');
    }
  }

  /**
   * Create multiple worker profiles (requires userId in each record)
   * @param {Object} params
   * @param {pkg.Prisma.WorkerProfileCreateManyInput} params.data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async createMany({ data }) {
    try {
      return await this.prismaClient.workerProfile.createMany({
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'createMany');
    }
  }

  /**
   * Update a worker profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.id
   * @param {pkg.Prisma.WorkerProfileUpdateInput} params.data
   * @returns {Promise<pkg.WorkerProfile>}
   */
  async update({ id, data }) {
    try {
      return await this.prismaClient.workerProfile.update({
        where: { id },
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'update');
    }
  }

  /**
   * Update many worker profiles
   * @param {Object} params
   * @param {pkg.Prisma.WorkerProfileWhereInput} params.where
   * @param {pkg.Prisma.WorkerProfileUpdateInput} params.data
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async updateMany({ where, data }) {
    try {
      return await this.prismaClient.workerProfile.updateMany({
        where,
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateMany');
    }
  }

  /**
   * Delete a worker profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.id
   * @returns {Promise<pkg.WorkerProfile>}
   */
  async delete({ id }) {
    try {
      return await this.prismaClient.workerProfile.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error, 'delete');
    }
  }

  /**
   * Delete many worker profiles
   * @param {Object} params
   * @param {pkg.Prisma.WorkerProfileWhereInput} params.where
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteMany({ where }) {
    try {
      return await this.prismaClient.workerProfile.deleteMany({
        where,
      });
    } catch (error) {
      handlePrismaError(error, 'deleteMany');
    }
  }

  // ============================================
  // User-based Operations
  // ============================================

  /**
   * Find worker profile by user ID
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @returns {Promise<pkg.WorkerProfile | null>}
   */
  async findByUserId({ userId }) {
    try {
      return await this.prismaClient.workerProfile.findUnique({
        where: { userId },
      });
    } catch (error) {
      handlePrismaError(error, 'findByUserId');
    }
  }

  /**
   * Update worker profile by user ID
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @param {pkg.Prisma.WorkerProfileUpdateInput} params.data
   * @returns {Promise<pkg.WorkerProfile>}
   */
  async updateByUserId({ userId, data }) {
    try {
      return await this.prismaClient.workerProfile.update({
        where: { userId },
        data,
      });
    } catch (error) {
      handlePrismaError(error, 'updateByUserId');
    }
  }

  /**
   * Delete worker profile by user ID
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @returns {Promise<pkg.WorkerProfile>}
   */
  async deleteByUserId({ userId }) {
    try {
      return await this.prismaClient.workerProfile.delete({
        where: { userId },
      });
    } catch (error) {
      handlePrismaError(error, 'deleteByUserId');
    }
  }

  // ============================================
  // Government Operations
  // ============================================

  /**
   * Add working governments for worker profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @param {import('./Repository.js').IDType[]} params.governmentIds
   * @returns {Promise<{ count: number }>}
   */
  async insertWorkingGovernments({ userId, governmentIds }) {
    try {
      const workerProfile = await this.prismaClient.workerProfile.update({
        where: { userId },
        data: {
          workGovernments: {
            connect: governmentIds.map((id) => ({ id })),
          },
        },
        include: { workGovernments: true },
      });
      return { count: workerProfile.workGovernments.length };
    } catch (error) {
      handlePrismaError(error, 'insertWorkerProfileGovernments');
    }
  }

  /**
   * Delete working governments for worker profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @param {import('./Repository.js').IDType[]} [params.governmentIds]
   * @returns {Promise<{ count: number }>}
   */
  async deleteWorkingGovernments({ userId, governmentIds = undefined }) {
    try {
      const workerProfile = await this.prismaClient.workerProfile.update({
        where: { userId },
        data: {
          workGovernments: {
            disconnect: governmentIds
              ? governmentIds.map((id) => ({ id }))
              : [],
          },
        },
        include: { workGovernments: true },
      });
      return { count: workerProfile.workGovernments.length };
    } catch (error) {
      handlePrismaError(error, 'deleteWorkerProfileGovernments');
    }
  }

  /**
   * Find working governments for worker profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @param {pkg.Prisma.GovernmentFindManyArgs} [params.filter]
   * @returns {Promise<pkg.Government[]>}
   */
  async findWorkingGovernments({ userId, filter = {}, }) {
    try {
      if (!filter) filter = {};
      if (!filter.where) filter.where = {};
      filter.where.workers = { some: { userId } };
      const data = await this.prismaClient.government.findMany(filter);
      return data;
    } catch (error) {
      handlePrismaError(error, 'findWorkerProfileGovernments');
    }
  }

  // ============================================
  // Specialization Operations
  // ============================================

  /**
   * Find specializations for worker profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @param {import('./Repository.js').IDType[]} [params.mainSpecializationIds]
   * @param {pkg.Prisma.ChosenSpecializationFindManyArgs} [params.filter]
   * @returns {Promise<{ mainId: import('./Repository.js').IDType, subIds: import('./Repository.js').IDType[] }[]>}
   */
  async findSpecializations({
    userId,
    mainSpecializationIds,
    filter = {},
  }) {
    try {
      filter.where = {
        ...filter.where,
        workerProfile: { userId },
        ...(mainSpecializationIds && {
          specializationId: { in: mainSpecializationIds },
        }),
      };
      const data = await this.prismaClient.chosenSpecialization.findMany(filter);

      const tree = [];
      const map = new Map();
      for (const { subSpecializationId, specializationId } of data) {
        if (!map.has(specializationId)) {
          const branch = { mainId: specializationId, subIds: [] };
          map.set(specializationId, branch);
        }
        map.get(specializationId).subIds.push(subSpecializationId);
      }
      for (const [, branch] of map) {
        tree.push(branch);
      }

      return tree;
    } catch (error) {
      handlePrismaError(error, 'findWorkerProfileSpecializations');
    }
  }

  /**
   * Add specializations for worker profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.workerProfileId
   * @param {{ mainId: import('./Repository.js').IDType, subIds: import('./Repository.js').IDType[] }[]} params.specializationsTree
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async insertSpecializations({
    workerProfileId,
    specializationsTree,
  }) {
    try {
      const data = specializationsTree.reduce((acc, current) => {
        return [
          ...acc,
          ...current.subIds.map((subId) => ({
            specializationId: current.mainId,
            subSpecializationId: subId,
            workerProfileId,
          })),
        ];
      }, []);

      return await this.prismaClient.chosenSpecialization.createMany({
        data,
        skipDuplicates: true,
      });
    } catch (error) {
      handlePrismaError(error, 'insertWorkerProfileSpecializations');
    }
  }

  /**
   * Add sub specializations for worker profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.workerProfileId
   * @param {import('./Repository.js').IDType} params.specializationId
   * @param {import('./Repository.js').IDType[]} params.subSpecializationIds
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async insertSubSpecializations({
    workerProfileId,
    specializationId,
    subSpecializationIds,
  }) {
    try {
      return await this.prismaClient.chosenSpecialization.createMany({
        data: subSpecializationIds.map((subSpecializationId) => ({
          workerProfileId,
          subSpecializationId,
          specializationId,
        })),
        skipDuplicates: true,
      });
    } catch (error) {
      handlePrismaError(error, 'insertWorkerProfileSubSpecializations');
    }
  }

  /**
   * Delete main specializations for worker profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @param {import('./Repository.js').IDType[]} [params.specializationIds]
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteSpecializations({
    userId,
    specializationIds = undefined,
  }) {
    try {
      return await this.prismaClient.chosenSpecialization.deleteMany({
        where: {
          workerProfile: { userId },
          specializationId: specializationIds
            ? { in: specializationIds }
            : undefined,
        },
      });
    } catch (error) {
      handlePrismaError(error, 'deleteWorkerProfileSpecializations');
    }
  }

  /**
   * Delete sub specializations for worker profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @param {import('./Repository.js').IDType} params.specializationId
   * @param {import('./Repository.js').IDType[]} params.subSpecializationIds
   * @returns {Promise<pkg.Prisma.BatchPayload>}
   */
  async deleteSubSpecializations({
    userId,
    specializationId,
    subSpecializationIds,
  }) {
    try {
      return await this.prismaClient.chosenSpecialization.deleteMany({
        where: {
          workerProfile: { userId },
          subSpecializationId: { in: subSpecializationIds },
          specializationId,
        },
      });
    } catch (error) {
      handlePrismaError(error, 'deleteWorkerProfileSubSpecializations');
    }
  }

  /**
   * Find specialization IDs for worker profile
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.userId
   * @returns {Promise<{id: import('./Repository.js').IDType, children: import('./Repository.js').IDType[]}[]>}
   */
  async findSpecializationIds({ userId }) {
    try {
      const chosenSpecializations =
        await this.prismaClient.chosenSpecialization.findMany({
          where: { workerProfile: { userId } },
          select: { specializationId: true },
        });

      const specializationTree = [];
      for (const { specializationId } of chosenSpecializations) {
        const branch = { id: specializationId, children: [] };
        const subSpecializations =
          await this.prismaClient.chosenSpecialization.findMany({
            where: { workerProfile: { userId }, specializationId },
          });
        branch.children = subSpecializations.map(
          ({ subSpecializationId }) => subSpecializationId
        );
        specializationTree.push(branch);
      }
      return specializationTree;
    } catch (error) {
      handlePrismaError(error, 'findWorkerProfileSpecializationIds');
    }
  }

  // ============================================
  // Verification Operations
  // ============================================

  /**
   * Upsert worker profile verification
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.workerProfileId
   * @param {pkg.Prisma.WorkerVerificationCreateInput} params.data
   * @returns {Promise<pkg.WorkerVerification>}
   */
  async upsertVerification({ workerProfileId, data }) {
    try {
      await this.prismaClient.workerVerification.deleteMany({
        where: { workerProfileId },
      });
      return await this.prismaClient.workerVerification.create({
        data: {
          ...data,
          workerProfile: { connect: { id: workerProfileId } },
        },
      });
    } catch (error) {
      handlePrismaError(error, 'upsertWorkerProfileVerification');
    }
  }

  /**
   * Find worker profile verification
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.workerProfileId
   * @returns {Promise<pkg.WorkerVerification | null>}
   */
  async findVerification({ workerProfileId }) {
    try {
      return await this.prismaClient.workerVerification.findFirst({
        where: { workerProfileId },
      });
    } catch (error) {
      handlePrismaError(error, 'findWorkerProfileVerification');
    }
  }

  // ============================================
  // Search Operations
  // ============================================

  /**
   * Search for approved workers with pagination, filtering, and sorting
   * @param {Object} params
   * @param {string} [params.categoryId] - Filter by category/sub-specialization
   * @param {string} [params.area] - Filter by area/government (ID or name)
   * @param {boolean} [params.availability] - Filter by availability status
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page (max 50)
   * @param {boolean} [params.acceptsUrgentJobs] - Filter by urgent jobs
   * @param {boolean} [params.highestRated] - Filter by highest rated
   * @param {boolean} [params.nearest] - Filter by nearest
   * @param {string | undefined} [params.specializationId] - Filter by specialization
   * @param {string | undefined} [params.subSpecializationId] - Filter by sub-specialization
   * @param {string | undefined} [params.city] - Filter by city
   * @returns {Promise<{data: Array, meta: {total: number, page: number, limit: number, totalPages: number}}>}
   */
  async searchWorkers({
    categoryId = undefined,
    specializationId = undefined,
    subSpecializationId = undefined,
    area = undefined,
    city = undefined,
    availability = undefined,
    acceptsUrgentJobs = false,
    highestRated = false,
    nearest = false,
    page = 1,
    limit = 10,
  }) {
    const parsedLimit =
      typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page;
    const normalizedLimit = Math.min(Math.max(parsedLimit || 10, 1), 50);
    const normalizedPage = Math.max(parsedPage || 1, 1);
    const skip = (normalizedPage - 1) * normalizedLimit;

    const whereClause = {
      verification: { status: pkg.VerificationStatus.APPROVED },
      user: { status: pkg.AccountStatus.ACTIVE },
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
            ...(selectedSubSpecializationId ? { subSpecializationId: selectedSubSpecializationId } : {}),
          },
        };
      }
    } catch (error) {
      handlePrismaError(error, 'searchWorkers');
    }

    if (acceptsUrgentJobs === true) {
      whereClause.acceptsUrgentJobs = true;
    }

    const areaFilter = city || area;

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

    // Fetch workers with relations
    const workers = await this.prismaClient.workerProfile.findMany({
      where: whereClause,
      select: /** @type {any} */ ({
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
            name: true,
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
      }),
      orderBy: /** @type {any} */ ([{ experienceYears: 'desc' }, { id: 'desc' }]),
      skip,
      take: normalizedLimit,
    });

    const computedWorkers = /** @type {any[]} */ (workers).map((worker) => {
      const ratedOrders = worker.orders.filter((order) => typeof order.rating === 'number');
      const rating = ratedOrders.length > 0
        ? ratedOrders.reduce((sum, order) => sum + order.rating, 0) / ratedOrders.length
        : 0;
      const completedServices = worker.orders.filter(
        (order) => order.status === pkg.OrderStatus.COMPLETED || order.status === pkg.OrderStatus.REVIEWED
      ).length;

      return {
        worker,
        rating,
        completedServices,
      };
    });

    const sortedWorkers = computedWorkers.sort((a, b) => {
      if (highestRated && b.rating !== a.rating) return b.rating - a.rating;
      if (b.completedServices !== a.completedServices) return b.completedServices - a.completedServices;
      return b.worker.experienceYears - a.worker.experienceYears;
    });

    // Transform data to response format
    const data = sortedWorkers.map(({ worker, rating, completedServices }) => ({
      workerId: worker.id,
      name: `${worker.user.firstName} ${worker.user.middleName || ''} ${worker.user.lastName}`.trim(),
      profileImage: worker.user.profileImageUrl,
      service_title: worker.chosenSpecializations.length > 0
        ? worker.chosenSpecializations[0].subSpecialization.name
        : null,
      rating,
      area: worker.workGovernments.length > 0 ? worker.workGovernments[0].name : null,
      isAvailableNow: worker.user.isOnline,
      completedServices,
      acceptsUrgentJobs: worker.acceptsUrgentJobs,
    }));

    const totalPages = Math.ceil(total / normalizedLimit);

    return {
      data,
      meta: {
        total,
        page: normalizedPage,
        limit: normalizedLimit,
        totalPages,
      },
    };
  }

  /**
   * Get detailed profile of a single worker
   * @param {Object} params
   * @param {import('./Repository.js').IDType} params.workerId - Worker profile ID
   * @returns {Promise<Object|null>} Worker profile with portfolio and details
   */
  async getWorkerById({ workerId }) {
    try {
      const worker = await this.prismaClient.workerProfile.findUnique({
        where: { id: workerId },
        select: {
          id: true,
          experienceYears: true,
          bio: true,
          acceptsUrgentJobs: true,
          user: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              profileImageUrl: true,
              status: true,
            },
          },
          workGovernments: { select: { name: true } },
          chosenSpecializations: {
            select: { subSpecialization: { select: { name: true } } },
          },
          portfolio: {
            select: {
              id: true,
              description: true,
              projectImages: { select: { imageUrl: true } },
            },
          },
          verification: { select: { status: true } },
          badges: {
            select: { badgeType: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!worker || worker.user.status !== 'ACTIVE') {
        return null;
      }

      return {
        workerId: worker.id,
        name: `${worker.user.firstName} ${worker.user.middleName || ''} ${worker.user.lastName}`.trim(),
        profileImage: worker.user.profileImageUrl,
        specializations: worker.chosenSpecializations.map(
          (s) => s.subSpecialization.name
        ),
        experienceYears: worker.experienceYears,
        area:
          worker.workGovernments.length > 0
            ? worker.workGovernments[0].name
            : null,
        workGovernments: worker.workGovernments.map((g) => g.name),
        badges: worker.badges.map((badge) => badge.badgeType),
        verificationStatus: worker.verification?.status || 'PENDING',
        bio: worker.bio,
        portfolio: worker.portfolio,
      };
    } catch (error) {
      handlePrismaError(error, 'getWorkerById');
    }
  }
}
