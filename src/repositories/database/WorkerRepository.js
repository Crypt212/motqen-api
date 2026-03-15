/**
 * @fileoverview Worker Repository - Handle database operations for workers
 * @module repositories/WorkerRepository
 */

import { Repository } from './Repository.js';
import { PrismaClient } from '@prisma/client';
import { getNearestGovernmentDistanceKm } from '../../utils/governmentDistance.js';

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
   * Search for approved workers with explore-oriented filters.
   * @async
   * @param {Object} params
   * @param {IDType} [params.specializationId]
   * @param {IDType} [params.subSpecializationId]
   * @param {string} [params.area]
   * @param {boolean} [params.availability]
   * @param {boolean} [params.highestRated]
   * @param {boolean} [params.nearest]
   * @param {string} [params.customerGovernmentName]
  * @param {IDType} [params.currentUserId]
   * @param {number} [params.page=1]
   * @param {number} [params.limit=10]
   * @returns {Promise<{data: Array, meta: {total: number, page: number, limit: number, totalPages: number}}>}
   */
  async searchWorkers({
    specializationId = undefined,
    subSpecializationId = undefined,
    area = undefined,
    availability = undefined,
    highestRated = false,
    nearest = false,
    customerGovernmentName = undefined,
    currentUserId = undefined,
    page = undefined,
    limit = undefined,
  }) {
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page;
    const normalizedLimit = Math.min(Math.max(parsedLimit, 1), 50);
    const normalizedPage = Math.max(parsedPage, 1);

    /** @type {any} */
    const whereClause = {
      isApproved: true,
      user: {
        status: 'ACTIVE',
      },
    };

    if (availability !== undefined && availability !== null) {
      whereClause.isAvailableNow = availability === true;
    }

    if (specializationId || subSpecializationId) {
      whereClause.chosenSpecializations = {
        some: {
          ...(specializationId ? { specializationId } : {}),
          ...(subSpecializationId ? { subSpecializationId } : {}),
        },
      };
    }

    if (area) {
      whereClause.governments = {
        some: {
          OR: [
            { governmentId: area },
            {
              government: {
                name: {
                  equals: area,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
      };
    }

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
        reviews: {
          select: {
            id: true,
            userId: true,
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
            specializationId: true,
            subSpecializationId: true,
            specialization: {
              select: {
                name: true,
              },
            },
            subSpecialization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const mappedWorkers = workers.map((worker) => {
      const matchingSpecialization = worker.chosenSpecializations.find((item) => {
        if (subSpecializationId) {
          return item.subSpecializationId === subSpecializationId;
        }

        if (specializationId) {
          return item.specializationId === specializationId;
        }

        return true;
      }) || worker.chosenSpecializations[0];

      const workGovernments = worker.governments.map((government) => government.government.name);
      const distanceKm = customerGovernmentName
        ? getNearestGovernmentDistanceKm(customerGovernmentName, workGovernments)
        : null;
      const ratingCount = worker.reviews.length;
      const hasCurrentUserRated = currentUserId
        ? worker.reviews.some((review) => review.userId === currentUserId)
        : false;

      return {
        workerId: worker.id,
        name: `${worker.user.firstName} ${worker.user.middleName || ''} ${worker.user.lastName}`.trim(),
        image: worker.user.profileImageUrl,
        profileImage: worker.user.profileImageUrl,
        specialization: matchingSpecialization?.specialization?.name || null,
        service_title: matchingSpecialization?.subSpecialization?.name || null,
        rating: worker.rating,
        ratingCount,
        hasRatings: ratingCount > 0 || worker.rating > 0,
        hasCurrentUserRated,
        distance: distanceKm,
        distanceKm,
        area: workGovernments[0] || null,
        workGovernments,
        isAvailableNow: worker.isAvailableNow,
        completedServices: worker.completedServices,
        acceptsUrgentJobs: worker.acceptsUrgentJobs,
        experienceYears: worker.experienceYears,
      };
    });

    const sortedWorkers = mappedWorkers.sort((leftWorker, rightWorker) => {
      if (nearest) {
        const leftDistance = leftWorker.distanceKm ?? Number.MAX_SAFE_INTEGER;
        const rightDistance = rightWorker.distanceKm ?? Number.MAX_SAFE_INTEGER;

        if (leftDistance !== rightDistance) {
          return leftDistance - rightDistance;
        }
      }

      if (highestRated) {
        if (rightWorker.rating !== leftWorker.rating) {
          return rightWorker.rating - leftWorker.rating;
        }

        if (rightWorker.ratingCount !== leftWorker.ratingCount) {
          return rightWorker.ratingCount - leftWorker.ratingCount;
        }
      }

      if (rightWorker.completedServices !== leftWorker.completedServices) {
        return rightWorker.completedServices - leftWorker.completedServices;
      }

      if (rightWorker.experienceYears !== leftWorker.experienceYears) {
        return rightWorker.experienceYears - leftWorker.experienceYears;
      }

      return rightWorker.rating - leftWorker.rating;
    });

    const total = sortedWorkers.length;
    const totalPages = Math.ceil(total / normalizedLimit);
    const skip = (normalizedPage - 1) * normalizedLimit;
    const data = sortedWorkers.slice(skip, skip + normalizedLimit);


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
