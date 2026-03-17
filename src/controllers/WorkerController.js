/**
 * @fileoverview Worker Controller - Handle worker-related HTTP requests
 * @module controllers/WorkerController
 */

import { matchedData } from 'express-validator';
import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import { workerRepository } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';

/**
 * GET /workers
 * Search for approved workers with filtering and pagination
 * @param {import('../types/asyncHandler.js').Request} req
 * @param {import('../types/asyncHandler.js').Response} res
 */
export const searchWorkers = asyncHandler(async (req, res) => {
  const {
    category_id,
    area,
    availability,
    subSpecializationId,
    acceptsUrgentJobs,
    page,
    limit,
  } = matchedData(req, { includeOptionals: true });

  // Support both new API names and legacy names
  const subSpecId =
    typeof category_id === 'string'
      ? category_id
      : typeof subSpecializationId === 'string'
        ? subSpecializationId
        : undefined;

  const areaFilter = typeof area === 'string' ? area : undefined;

  const availabilityRaw =
    typeof availability === 'string'
      ? availability
      : typeof acceptsUrgentJobs === 'string'
        ? acceptsUrgentJobs
        : undefined;

  let isOnline;
  if (availabilityRaw !== undefined) {
    const normalized = availabilityRaw.toLowerCase();
    isOnline = ['true', '1', 'yes', 'available', 'now'].includes(normalized)
      ? true
      : ['false', '0', 'no', 'unavailable'].includes(normalized)
        ? false
        : undefined;
  }

  const pageNum = typeof page === 'string' ? parseInt(page, 10) : 1;
  const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : 10;

  const result = await workerRepository.searchWorkers({
    categoryId: subSpecId,
    area: areaFilter,
    availability: isOnline,
    page: pageNum,
    limit: limitNum,
  });

  // Sorting: rating desc, completedServices desc, experienceYears desc (applied in repository)

  new SuccessResponse('Workers retrieved successfully', result, 200).send(res);
});

/**
 * GET /workers/:id
 * Get detailed profile of a single worker
 * @param {import('../types/asyncHandler.js').Request} req
 * @param {import('../types/asyncHandler.js').Response} res
 */
export const getWorkerById = asyncHandler(async (req, res) => {
  const { workerId } = matchedData(req, { includeOptionals: true });

  const worker = await workerRepository.getWorkerById({ workerId });

  if (!worker) {
    throw new AppError('Worker not found or not approved', 404);
  }

  new SuccessResponse(
    'Worker profile retrieved successfully',
    worker,
    200
  ).send(res);
});
