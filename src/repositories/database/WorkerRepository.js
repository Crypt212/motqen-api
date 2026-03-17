/**
 * @fileoverview Worker Repository - Handle database operations for workers
 * @module repositories/WorkerRepository
 */

import { Repository } from './Repository.js';
import { PrismaClient } from '@prisma/client';

/** @typedef {import("./Repository.js").IDType} IDType */

/**
 * Worker Repository - Handles all database operations for workers
 * @class
 * @extends Repository
 */
export default class WorkerRepository extends Repository {
  /** @param {PrismaClient} prisma */
  constructor(prisma) {
    super(prisma, 'workerProfile');
  }

/**
 * Search for approved workers with pagination, filtering, and sorting
 * @async
 * @param {Object} params
 * @param {IDType} [params.categoryId] - Filter by category/sub-specialization
 * @param {string} [params.area] - Filter by area/government (ID or name)
 * @param {boolean} [params.availability] - Filter by availability status
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page (max 50)
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
    // Validate and normalize limit and page
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page;
    const normalizedLimit = Math.min(Math.max(parsedLimit || 10, 1), 50);
    const normalizedPage = Math.max(parsedPage || 1, 1);
    const skip = (normalizedPage - 1) * normalizedLimit;

    // Build where clause
    /** @type {any} */
    const whereClause = {
      isApproved: true,
      user: {
        status: 'ACTIVE',
      },
    };

    // Add optional filters
    if (availability !== undefined && availability !== null) {
      whereClause.isAvailableNow = availability === true;
    }

    const selectedSubSpecializationId = subSpecializationId || categoryId;

    if (specializationId || selectedSubSpecializationId) {
      whereClause.chosenSpecializations = {
        some: {
          ...(specializationId ? { mainSpecializationId: specializationId } : {}),
          ...(selectedSubSpecializationId ? { subSpecializationId: selectedSubSpecializationId } : {}),
        },
      };
    }

    if (acceptsUrgentJobs === true) {
      whereClause.acceptsUrgentJobs = true;
    }

    const areaFilter = city || area;

    if (areaFilter) {
      whereClause.governments = {
        some: {
          OR: [
            { governmentId: areaFilter },
            {
              government: {
                name: {
                  equals: areaFilter,
                  mode: 'insensitive',
                },
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
    /** @type {any} */
    const workers = await this.prismaClient.workerProfile.findMany({
      where: whereClause,
      select: {
        id: true,
        experienceYears: true,
        rating: true,
        isAvailableNow: true,
        completedServices: true,
        acceptsUrgentJobs: true,
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
        governments: {
          select: {
            government: {
              select: {
                name: true,
              },
            },
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
      orderBy: highestRated
        ? [{ rating: 'desc' }, { completedServices: 'desc' }, { experienceYears: 'desc' }, { id: 'desc' }]
        : [{ completedServices: 'desc' }, { experienceYears: 'desc' }, { rating: 'desc' }, { id: 'desc' }],
      skip,
      take: normalizedLimit,
    });

    // Transform data to response format
    const data = workers.map((worker) => ({
      workerId: worker.id,
      name: `${worker.user.firstName} ${worker.user.middleName || ''} ${worker.user.lastName}`.trim(),
      profileImage: worker.user.profileImageUrl,
      service_title: worker.chosenSpecializations.length > 0
        ? worker.chosenSpecializations[0].subSpecialization.name
        : null,
      rating: worker.rating,
      area: worker.governments.length > 0 ? worker.governments[0].government.name : null,
      isAvailableNow: worker.isAvailableNow,
      completedServices: worker.completedServices,
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
   * @async
   * @param {Object} params
   * @param {IDType} params.workerId - Worker profile ID
   * @returns {Promise<Object|null>} Worker profile with portfolio and details
   */
  async getWorkerById({ workerId }) {
    /** @type {any} */
    const worker = await this.prismaClient.workerProfile.findUnique({
      where: { id: workerId },
      select: {
        id: true,
        experienceYears: true,
        rating: true,
        servicePrice: true,
        isAvailableNow: true,
        completedServices: true,
        bio: true,
        acceptsUrgentJobs: true,
        isApproved: true,
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
        governments: {
          select: {
            government: {
              select: {
                name: true,
              },
            },
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
        portfolio: {
          select: {
            id: true,
            description: true,
            isApproved: true,
            projectImages: {
              select: {
                imageUrl: true,
              },
            },
          },
        },
        verification: {
          select: {
            status: true,
          },
        },
        badges: {
          select: {
            badgeType: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!worker) {
      return null;
    }

    // Only return approved workers with ACTIVE status
    if (!worker.isApproved || worker.user.status !== 'ACTIVE') {
      return null;
    }

    // Transform portfolio data
    const portfolio = worker.portfolio
      .filter((project) => project.isApproved)
      .map((project) => ({
        id: project.id,
        description: project.description,
        images: project.projectImages.map((img) => img.imageUrl),
      }));

    return {
      workerId: worker.id,
      name: `${worker.user.firstName} ${worker.user.middleName || ''} ${worker.user.lastName}`.trim(),
      profileImage: worker.user.profileImageUrl,
      specializations: worker.chosenSpecializations.map((s) => s.subSpecialization.name),
      rating: worker.rating,
      fee: worker.servicePrice,
      isAvailableNow: worker.isAvailableNow,
      completedServices: worker.completedServices,
      experienceYears: worker.experienceYears,
      area: worker.governments.length > 0 ? worker.governments[0].government.name : null,
      workGovernments: worker.governments.map((g) => g.government.name),
      badges: worker.badges.map((badge) => badge.badgeType),
      verificationStatus: worker.verification?.status || 'PENDING',
      bio: worker.bio,
      workSamples: portfolio,
      portfolio,
    };
  }
}
