/**
 * @fileoverview Worker Controller - Handle workers-related HTTP requests
 * @module controllers/WorkerController
 */

import SuccessResponse from '../responses/successResponse.js';
import { locationRepository, workerProfileService, workerProfileRepository } from '../state.js';
import { ExploreSearchSchema } from '../schemas/requests/worker-explore.request.js';

import { asyncHandler } from '../types/asyncHandler.js';
import AppError from 'src/errors/AppError.js';

export const searchWorkers = asyncHandler(async (req, res) => {
  const {
    specializationId,
    subSpecializationId,
    governmentId,
    highestRated,
    nearest,
    availableNow,
    acceptsUrgentJobs,
    page,
    limit,
    'location[latitude]': latitude,
    'location[longitude]': longitude,
  } = ExploreSearchSchema.parse(req.query);

  let customerLatitude = latitude;
  let customerLongitude = longitude;

  if ((!customerLatitude || !customerLongitude) && req.userState?.userId) {
    const mainLocation = await locationRepository.findMainLocationByUserId({ userId: req.userState.userId });
    customerLatitude = mainLocation?.latitude ?? undefined;
    customerLongitude = mainLocation?.longitude ?? undefined;
  }

  const hasValidLocation =
    typeof customerLatitude === 'number' && typeof customerLongitude === 'number';

  const result = await workerProfileRepository.searchWorkers({
    specializationId,
    subSpecializationId,
    governmentId,
    availability: availableNow ? true : undefined,
    acceptsUrgentJobs: acceptsUrgentJobs ? true : undefined,
    highestRated,
    nearest,
    location: hasValidLocation
      ? {
        latitude: customerLatitude!,
        longitude: customerLongitude!,
      }
      : undefined,
    page,
    limit,
    excludeUserId: req.userState?.userId,
  });

  new SuccessResponse('Workers results retrieved successfully', result, 200).send(res);
});

/**
 * GET /workers/:id
 * Get details of a single explored worker.
 * @param {import('../types/asyncHandler.js').Request} req
 * @param {import('express').Response} res
 */
export const getWorkerById = asyncHandler(async (req, res) => {
  const id = String(req.params.id);

  const worker = await workerProfileService.getExploreWorkerById({ userId: id });

  if (!worker) {
    throw new AppError('Worker not found or not approved', 404);
  }

  new SuccessResponse('Worker retrieved successfully', worker, 200).send(res);
});

export const getWorkerOccupiedTimeSlots = asyncHandler(async (req, res) => {
  const workerProfileId = String(req.params.id);
  const { selectedDate } = req.query as { selectedDate: string };

  const slots = await workerProfileRepository.findOccupiedTimeSlots({
    workerId: workerProfileId,
    selectedDate,
  });

  new SuccessResponse(
    'Occupied time slots retrieved successfully',
    { occupiedSlots: slots },
    200
  ).send(res);
});
