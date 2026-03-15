/**
 * @fileoverview Explore Controller - Handle explore-related HTTP requests
 * @module controllers/ExploreController
 */

import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import { userRepository, workerRepository } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';

function getFirstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }

  return undefined;
}

function parseBooleanFlag(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return false;
  }

  return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function parseFlagCollection(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(','));
  }

  if (typeof value === 'string') {
    return value.split(',');
  }

  return [];
}

/**
 * GET /explore
 * Search for approved workers by specialization with optional UI flags.
 * @param {import('../types/asyncHandler.js').Request} req
 * @param {import('../types/asyncHandler.js').Response} res
 */
export const searchWorkers = asyncHandler(async (req, res) => {
  const {
    category_id,
    area,
    availability,
    specializationId,
    specialization_id,
    subSpecializationId,
    sub_specialization_id,
    governmentId,
    acceptsUrgentJobs,
    highestRated,
    topRated,
    nearest,
    nearestFirst,
    filters,
    page,
    limit,
  } = req.query;

  const activeFilters = parseFlagCollection(filters).map((filter) => filter.trim().toLowerCase());
  const mainSpecializationId = getFirstString(specializationId, specialization_id);
  const subSpecId = getFirstString(subSpecializationId, sub_specialization_id, category_id);

  const areaFilter = getFirstString(area, governmentId);

  const availabilityRaw = typeof availability === 'string'
    ? availability
    : (typeof acceptsUrgentJobs === 'string' ? acceptsUrgentJobs : undefined);

  let isAvailableNow;
  if (availabilityRaw !== undefined) {
    const normalized = availabilityRaw.toLowerCase();
    isAvailableNow = ['true', '1', 'yes', 'available', 'now'].includes(normalized)
      ? true
      : (['false', '0', 'no', 'unavailable'].includes(normalized) ? false : undefined);
  }

  const pageNum = typeof page === 'string'
    ? parseInt(page, 10)
    : (typeof page === 'number' ? page : undefined);
  const limitNum = typeof limit === 'string'
    ? parseInt(limit, 10)
    : (typeof limit === 'number' ? limit : undefined);

  const highestRatedFlag =
    parseBooleanFlag(highestRated) ||
    parseBooleanFlag(topRated) ||
    activeFilters.includes('highestrated') ||
    activeFilters.includes('toprated');

  const nearestFlag =
    parseBooleanFlag(nearest) ||
    parseBooleanFlag(nearestFirst) ||
    activeFilters.includes('nearest') ||
    activeFilters.includes('closest');

  if (!mainSpecializationId) {
    throw new AppError('specializationId is required for explore search', 400);
  }

  let customerGovernmentName;
  if (req.userState?.userId) {
    const currentUser = await userRepository.prismaClient.user.findUnique({
      where: { id: req.userState.userId },
      select: {
        government: {
          select: {
            name: true,
          },
        },
      },
    });

    customerGovernmentName = currentUser?.government?.name;
  }

  const result = await workerRepository.searchWorkers({
    specializationId: mainSpecializationId,
    subSpecializationId: subSpecId,
    area: areaFilter,
    availability: isAvailableNow,
    highestRated: highestRatedFlag,
    nearest: nearestFlag,
    customerGovernmentName,
    currentUserId: req.userState?.userId,
    page: pageNum,
    limit: limitNum,
  });

  new SuccessResponse('Explore results retrieved successfully', result, 200).send(res);
});

/**
 * GET /explore/:id
 * Get details of a single explored worker.
 * @param {import('../types/asyncHandler.js').Request} req
 * @param {import('../types/asyncHandler.js').Response} res
 */
export const getWorkerById = asyncHandler(async (req, res) => {
  const workerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const worker = await workerRepository.getWorkerById({ workerId });

  if (!worker) {
    throw new AppError('Worker not found or not approved', 404);
  }

  new SuccessResponse('Explore worker retrieved successfully', worker, 200).send(res);
});
