/**
 * @fileoverview Explore Controller - Handle explore-related HTTP requests
 * @module controllers/ExploreController
 */

import { matchedData } from 'express-validator';
import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import { userRepository, workerProfileRepository } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';

function getFirstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }

  return undefined;
}

function getFirstDefinedValue(...values) {
  for (const value of values) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'string' && value.trim() === '') {
      continue;
    }

    return value;
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

/**
 * GET /explore
 * Search for approved workers by specialization with optional UI flags.
 * @param {import('../types/asyncHandler.js').Request} req
 * @param {import('express').Response} res
 */
export const searchWorkers = asyncHandler(async (req, res) => {
  const {
    category_id,
    city,
    availability,
    availableNow,
    AvailableNow,
    AvailbleNow,
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
    page,
    limit,
  } = matchedData(req, { includeOptionals: true });

  const mainSpecializationId = getFirstString(specializationId, specialization_id);
  const subSpecId = getFirstString(subSpecializationId, sub_specialization_id, category_id);

  const areaFilter = getFirstString(city, governmentId);

  const availabilityFilter = getFirstDefinedValue(
    availableNow,
    AvailableNow,
    AvailbleNow,
    availability,
  );
  const isAvailableNow = availabilityFilter === undefined
    ? undefined
    : parseBooleanFlag(availabilityFilter);

  const acceptsUrgentJobsFlag = parseBooleanFlag(acceptsUrgentJobs);

  const pageNum = typeof page === 'string'
    ? parseInt(page, 10)
    : (typeof page === 'number' ? page : undefined);
  const limitNum = typeof limit === 'string'
    ? parseInt(limit, 10)
    : (typeof limit === 'number' ? limit : undefined);

  const highestRatedFlag =
    parseBooleanFlag(highestRated) ||
    parseBooleanFlag(topRated);

  const nearestFlag =
    parseBooleanFlag(nearest) ||
    parseBooleanFlag(nearestFirst);

  if (!mainSpecializationId) {
    throw new AppError('specializationId is required for explore search', 400);
  }

  let customerGovernmentName;
  let customerGovernmentLatitude;
  let customerGovernmentLongitude;
  if (req.userState?.userId) {
    const currentUser = await userRepository.prismaClient.user.findUnique({
      where: { id: req.userState.userId },
      select: /** @type {import('@prisma/client').Prisma.UserSelect} */ ({
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        profileImageUrl: true,
        isOnline: true,
        clientProfile: {
          select: {
            locations: {
              where: {
                isMain: true,
              },
              take: 1,
              select: {
                government: {
                  select: {
                    name: true,
                    lat: true,
                    long: true,
                  },
                },
              },
            },
          },
        },
      }),
    });

    customerGovernmentName = /** @type {any} */ (currentUser)?.clientProfile?.locations?.[0]?.government?.name;
    customerGovernmentLatitude = /** @type {any} */ (currentUser)?.clientProfile?.locations?.[0]?.government?.lat;
    customerGovernmentLongitude = /** @type {any} */ (currentUser)?.clientProfile?.locations?.[0]?.government?.long;
  }

  const result = await workerProfileRepository.searchWorkers(/** @type {any} */ ({
    specializationId: mainSpecializationId,
    subSpecializationId: subSpecId,
    city: areaFilter,
    availability: isAvailableNow,
    acceptsUrgentJobs: acceptsUrgentJobsFlag,
    highestRated: highestRatedFlag,
    nearest: nearestFlag,
    customerGovernmentName,
    customerGovernmentLatitude,
    customerGovernmentLongitude,
    currentUserId: req.userState?.userId,
    page: pageNum,
    limit: limitNum,
  }));

  new SuccessResponse('Explore results retrieved successfully', result, 200).send(res);
});

/**
 * GET /explore/:id
 * Get details of a single explored worker.
 * @param {import('../types/asyncHandler.js').Request} req
 * @param {import('../types/asyncHandler.js').Response} res
 */
export const getWorkerById = asyncHandler(async (req, res) => {
  const { id: workerId } = matchedData(req, { includeOptionals: true });

  const worker = await workerProfileRepository.getWorkerById({ workerId });

  if (!worker) {
    throw new AppError('Worker not found or not approved', 404);
  }

  new SuccessResponse('Explore worker retrieved successfully', worker, 200).send(res);
});
