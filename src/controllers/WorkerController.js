/**
 * @fileoverview Worker Controller - Handle worker-related HTTP requests
 * @module controllers/WorkerController
 */

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
    subSpecializationId,
    governmentId,
    acceptsUrgentJobs,
    page,
    limit,
  } = req.query;

  // Safely cast query parameters to appropriate types
  const subSpecId = typeof subSpecializationId === 'string' ? subSpecializationId : undefined;
  const govId = typeof governmentId === 'string' ? governmentId : undefined;
  const urgentJobs = typeof acceptsUrgentJobs === 'string' ? acceptsUrgentJobs === 'true' : undefined;
  const pageNum = typeof page === 'string' ? parseInt(page, 10) : 1;
  const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : 10;

  const result = await workerRepository.searchWorkers({
    subSpecializationId: subSpecId,
    governmentId: govId,
    acceptsUrgentJobs: urgentJobs,
    page: pageNum,
    limit: limitNum,
  });

  new SuccessResponse('Workers retrieved successfully', result, 200).send(res);
});

/**
 * GET /workers/:id
 * Get detailed profile of a single worker
 * @param {import('../types/asyncHandler.js').Request} req
 * @param {import('../types/asyncHandler.js').Response} res
 */
export const getWorkerById = asyncHandler(async (req, res) => {
  const workerId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const worker = await workerRepository.getWorkerById({ workerId });

  if (!worker) {
    throw new AppError('Worker not found or not approved', 404);
  }

  new SuccessResponse('Worker profile retrieved successfully', worker, 200).send(res);
});
