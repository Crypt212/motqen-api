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
 * @param {IDType} [params.subSpecializationId] - Filter by sub-specialization
 * @param {IDType} [params.governmentId] - Filter by government
 * @param {boolean} [params.acceptsUrgentJobs] - Filter by urgent jobs acceptance
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=10] - Items per page (max 50)
 * @returns {Promise<{data: Array, meta: {total: number, page: number, limit: number, totalPages: number}}>}
 */
  async searchWorkers({
    subSpecializationId = undefined,
    governmentId = undefined,
    acceptsUrgentJobs = undefined,
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
    if (acceptsUrgentJobs !== undefined && acceptsUrgentJobs !== null) {
      whereClause.acceptsUrgentJobs = acceptsUrgentJobs === true;
    }

    if (subSpecializationId) {
      whereClause.chosenSpecializations = {
        some: {
          subSpecializationId,
        },
      };
    }

    if (governmentId) {
      whereClause.governments = {
        some: {
          governmentId,
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
        acceptsUrgentJobs: true,
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
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
      orderBy: [
        { experienceYears: 'desc' },
      ],
      skip,
      take: normalizedLimit,
    });

    // Transform data to response format
    const data = workers.map((worker) => ({
      workerId: worker.id,
      fullName: `${worker.user.firstName} ${worker.user.middleName || ''} ${worker.user.lastName}`.trim(),
      experienceYears: worker.experienceYears,
      acceptsUrgentJobs: worker.acceptsUrgentJobs,
      governments: worker.governments.map((g) => g.government.name),
      specializations: worker.chosenSpecializations.map((s) => s.subSpecialization.name),
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
        acceptsUrgentJobs: true,
        isApproved: true,
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
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
            projectImages: {
              select: {
                imageUrl: true,
              },
            },
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
    const portfolio = worker.portfolio.map((project) => ({
      id: project.id,
      description: project.description,
      images: project.projectImages.map((img) => img.imageUrl),
    }));

    return {
      workerId: worker.id,
      fullName: `${worker.user.firstName} ${worker.user.middleName || ''} ${worker.user.lastName}`.trim(),
      experienceYears: worker.experienceYears,
      acceptsUrgentJobs: worker.acceptsUrgentJobs,
      governments: worker.governments.map((g) => g.government.name),
      specializations: worker.chosenSpecializations.map((s) => s.subSpecialization.name),
      portfolio,
    };
  }
}
