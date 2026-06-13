/**
 * @fileoverview Worker Controller - Handle workers-related HTTP requests
 * @module controllers/WorkerController
 */

import {
  locationRepository,
  workerProfileService,
  workerProfileRepository
} from '../state.js';
import {
  SearchWorkersRequestDTO,
  SearchWorkersQueryDTO,
  SearchWorkersParamsDTO,
  GetWorkerByIdRequestDTO,
  GetWorkerByIdQueryDTO,
  GetWorkerByIdParamsDTO,
  GetWorkerOccupiedTimeSlotsRequestDTO,
  GetWorkerOccupiedTimeSlotsQueryDTO,
  GetWorkerOccupiedTimeSlotsParamsDTO
} from '../schemas/requests/worker-explore.request.js';
import {
  SearchWorkersResponseDTO,
  GetWorkerByIdResponseDTO,
  GetWorkerOccupiedTimeSlotsResponseDTO
} from '../schemas/responses/worker-explore.response.js';

import { asyncHandler } from '../types/asyncHandler.js';
import AppError from 'src/errors/AppError.js';

export const searchWorkers = asyncHandler<SearchWorkersResponseDTO, SearchWorkersRequestDTO, SearchWorkersQueryDTO, SearchWorkersParamsDTO>(async (req, res) => {
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
  } = req.parsed!.query!;

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

  res.status(200).send({ status: 'success', message: 'Workers results retrieved successfully', data: result });
});

/**
 * GET /workers/:id
 * Get details of a single explored worker.
 * @param {import('../types/asyncHandler.js').Request} req
 * @param {import('express').Response} res
 */
export const getWorkerById = asyncHandler<GetWorkerByIdResponseDTO, GetWorkerByIdRequestDTO, GetWorkerByIdQueryDTO, GetWorkerByIdParamsDTO>(async (req, res) => {
  const id = req.parsed!.params!.id;

  const worker = await workerProfileService.getExploreWorkerById({ userId: id });

  if (!worker) {
    throw new AppError('Worker not found or not approved', 404);
  }

  res.status(200).send({ status: 'success', message: 'Worker retrieved successfully', data: { worker } });
});

export const getWorkerOccupiedTimeSlots = asyncHandler<GetWorkerOccupiedTimeSlotsResponseDTO, GetWorkerOccupiedTimeSlotsRequestDTO, GetWorkerOccupiedTimeSlotsQueryDTO, GetWorkerOccupiedTimeSlotsParamsDTO>(async (req, res) => {
  const workerUserId = req.parsed!.params!.id;
  const { selectedDate } = req.parsed!.query!;

  const slots = await workerProfileRepository.findOccupiedTimeSlots({
    workerId: workerUserId,
    selectedDate,
  });

  res.status(200).send({ status: 'success', message: 'Occupied time slots retrieved successfully', data: { occupiedSlots: slots } });
});
