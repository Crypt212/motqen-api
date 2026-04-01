/**
 * @fileoverview Worker Controller - Handle workers-related HTTP requests
 * @module controllers/WorkerController
 */

import type { Response } from 'express';
import type { Prisma } from '../generated/prisma/client.js';
import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import { userRepository, workerProfileRepository } from '../state.js';
import { asyncHandler, type Request } from '../types/asyncHandler.js';
import type { WorkerSearchFlag, WorkerSearchInput } from '../domain/workerProfile.entity.js';

function getFirstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }

  return undefined;
}

function getFirstDefinedValue(...values: unknown[]): unknown {
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

function parseBooleanFlag(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return false;
  }

  return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function normalizeFlagName(value: string): WorkerSearchFlag | undefined {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'availability' || normalized === 'availbilty') {
    return 'availability';
  }

  if (normalized === 'nearest') {
    return 'nearest';
  }

  if (normalized === 'acceptsurgentjobs' || normalized === 'accepturgentjobs') {
    return 'acceptsUrgentJobs';
  }

  if (
    normalized === 'highestrated' ||
    normalized === 'highest_rated' ||
    normalized === 'heasetrated'
  ) {
    return 'highestRated';
  }

  return undefined;
}

function parseFlaggedFilters(value: unknown): Set<WorkerSearchFlag> {
  if (value === undefined || value === null) {
    return new Set();
  }

  const rawValues: string[] = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return rawValues.reduce((acc, raw) => {
    const normalized = normalizeFlagName(raw);
    if (normalized) {
      acc.add(normalized);
    }
    return acc;
  }, new Set<WorkerSearchFlag>());
}

/**
 * GET /workers
 * Search for approved workers by specialization with optional UI flags.
 */
export const searchWorkers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as Record<string, unknown>;
  const flagged = parseFlaggedFilters(query.flagged ?? query.flaged ?? query.Flaged);

  const mainSpecializationId = getFirstString(query.specializationId, query.specialization_id);
  const subSpecId = getFirstString(
    query.subSpecializationId,
    query.sub_specialization_id,
    query.category_id
  );

  const governmentFilter = getFirstString(query.governmentId, query.government_id, query.city);

  const availabilityFilter = getFirstDefinedValue(
    query.availableNow,
    query.AvailableNow,
    query.AvailbleNow,
    query.availability
  );
  const isAvailableNow =
    availabilityFilter === undefined
      ? flagged.has('availability')
        ? true
        : undefined
      : parseBooleanFlag(availabilityFilter);

  const acceptsUrgentJobsFlag =
    parseBooleanFlag(query.acceptsUrgentJobs) || flagged.has('acceptsUrgentJobs');

  const page = query.page;
  const limit = query.limit;
  const pageNum = typeof page === 'string' ? parseInt(page, 10) : undefined;
  const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : undefined;

  const highestRatedFlag =
    parseBooleanFlag(query.highestRated) ||
    parseBooleanFlag(query.topRated) ||
    flagged.has('highestRated');

  const nearestFlag =
    parseBooleanFlag(query.nearest) ||
    parseBooleanFlag(query.nearestFirst) ||
    flagged.has('nearest');

  if (!mainSpecializationId) {
    throw new AppError('specializationId is required for workers search', 400);
  }

  let customerGovernmentName: string | undefined;
  let customerGovernmentLatitude: string | number | undefined;
  let customerGovernmentLongitude: string | number | undefined;

  if (req.userState?.userId) {
    const currentUser = await userRepository.prismaClient.user.findUnique({
      where: { id: req.userState.userId },
      select: {
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
      } satisfies Prisma.UserSelect,
    });

    customerGovernmentName = currentUser?.clientProfile?.locations?.[0]?.government?.name;
    customerGovernmentLatitude = currentUser?.clientProfile?.locations?.[0]?.government?.lat;
    customerGovernmentLongitude = currentUser?.clientProfile?.locations?.[0]?.government?.long;
  }

  const searchInput: WorkerSearchInput = {
    specializationId: mainSpecializationId,
    subSpecializationId: subSpecId,
    governmentId: governmentFilter,
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
  };

  const result = await workerProfileRepository.searchWorkers(searchInput);

  new SuccessResponse('Workers results retrieved successfully', result, 200).send(res);
});

/**
 * GET /workers/:id
 * Get details of a single explored worker.
 */
export const getWorkerById = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const worker = await workerProfileRepository.find({ workerFilter: { id } });

  if (!worker) {
    throw new AppError('Worker not found or not approved', 404);
  }

  new SuccessResponse('worker retrieved successfully', worker, 200).send(res);
});
