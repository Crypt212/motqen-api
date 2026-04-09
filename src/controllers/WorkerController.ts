/**
 * @fileoverview Worker Controller - Handle workers-related HTTP requests
 * @module controllers/WorkerController
 */

import AppError from '../errors/AppError.js';
import { logger } from '../libs/winston.js';
import SuccessResponse from '../responses/successResponse.js';
import { userRepository, workerProfileRepository } from '../state.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { ExploreSearchDTO } from '../schemas/workers.js';
import { asyncHandler } from '../types/asyncHandler.js';

type QueryValue = string | number | boolean | null | undefined;
type FlagedFilter = 'availbilty' | 'nearest' | 'acceptUrgentJobs' | 'heasetrated';

function getSingleQueryValue(value: unknown): QueryValue {
  if (Array.isArray(value)) {
    return getSingleQueryValue(value[0]);
  }

  if (
    value === undefined ||
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value as QueryValue;
  }

  return undefined;
}

function parseIntFlag(value: unknown): number | undefined {
  const singleValue = getSingleQueryValue(value);

  if (typeof singleValue === 'number' && Number.isInteger(singleValue)) {
    return singleValue;
  }

  if (typeof singleValue === 'string') {
    const parsed = Number.parseInt(singleValue, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

function parseUuidList(value: unknown): string[] {
  const result = new Set<string>();

  if (value === undefined || value === null || value === '') {
    return [];
  }

  const rawValues = Array.isArray(value) ? value : [value];
  for (const rawValue of rawValues) {
    const list = String(rawValue)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    for (const item of list) {
      result.add(item);
    }
  }

  return [...result];
}

function normalizeFlagedToken(value: string): FlagedFilter | undefined {
  const normalized = value.replace(/[^a-z]/gi, '').toLowerCase();

  if (normalized === 'availbilty' || normalized === 'availability') return 'availbilty';
  if (normalized === 'nearest') return 'nearest';
  if (normalized === 'accepturgentjobs' || normalized === 'acceptsurgentjobs') {
    return 'acceptUrgentJobs';
  }
  if (normalized === 'heasetrated' || normalized === 'highestrated' || normalized === 'toprated') {
    return 'heasetrated';
  }

  return undefined;
}

function parseFlagedFilters(value: unknown): Set<FlagedFilter> {
  const result = new Set<FlagedFilter>();

  if (value === undefined || value === null || value === '') {
    return result;
  }

  const list = Array.isArray(value) ? value : String(value).split(',');
  for (const item of list) {
    const normalized = normalizeFlagedToken(String(item).trim());
    if (normalized) {
      result.add(normalized);
    }
  }

  return result;
}

/**
 * GET /workers
 * Search for approved workers by specialization with optional UI flags.
 */
export const searchWorkers = asyncHandler(async (req, res) => {
  const query = req.query as Partial<ExploreSearchDTO> & Record<string, unknown>;

  if (process.env.WORKER_SEARCH_DEBUG === 'true') {
    logger.info('[workerSearch] incoming query', { query });
  }

  const { specializationId, subSpecializationId, governments, flaged, page, limit } = query;

  const specialization = getSingleQueryValue(specializationId);
  if (typeof specialization !== 'string' || specialization.trim() === '') {
    throw new AppError('specializationId is required for workers search', 400);
  }

  const subSpecId = getSingleQueryValue(subSpecializationId);
  const normalizedSubSpecId =
    typeof subSpecId === 'string' && subSpecId.trim() !== '' ? subSpecId.trim() : undefined;

  const governmentFilterIds = parseUuidList(governments);

  const flagedFilters = parseFlagedFilters(flaged);

  const isAvailableNow = flagedFilters.has('availbilty') ? true : undefined;
  const acceptsUrgentJobsFlag = flagedFilters.has('acceptUrgentJobs');

  const pageNum = parseIntFlag(page) ?? 1;
  const limitNum = parseIntFlag(limit) ?? 10;

  const highestRatedFlag = flagedFilters.has('heasetrated');
  const nearestFlag = flagedFilters.has('nearest');

  let customerLatitude: string | undefined;
  let customerLongitude: string | undefined;

  if (req.userState?.userId) {
    const currentUserSelect: Prisma.UserSelect = {
      id: true,
      locations: {
        where: {
          isMain: true,
        },
        take: 1,
        select: {
          government: {
            select: {
              lat: true,
              long: true,
            },
          },
          city: {
            select: {
              lat: true,
              long: true,
            },
          },
        },
      },
    };

    const currentUser = (await userRepository.prismaClient.user.findUnique({
      where: { id: req.userState.userId },
      select: currentUserSelect,
    })) as {
      locations?: Array<{
        government?: {
          lat?: string | null;
          long?: string | null;
        };
        city?: {
          lat?: string | null;
          long?: string | null;
        };
      }>;
    } | null;

    const mainLocation = currentUser?.locations?.[0];
    customerLatitude = mainLocation?.city?.lat ?? mainLocation?.government?.lat ?? undefined;
    customerLongitude = mainLocation?.city?.long ?? mainLocation?.government?.long ?? undefined;
  }

  const result = await workerProfileRepository.searchWorkers({
    specializationId: specialization,
    subSpecializationId: normalizedSubSpecId,
    governmentIds: governmentFilterIds,
    availability: isAvailableNow,
    acceptsUrgentJobs: acceptsUrgentJobsFlag,
    highestRated: highestRatedFlag,
    nearest: nearestFlag,
    customerLatitude,
    customerLongitude,
    page: pageNum,
    limit: limitNum,
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

  const worker = await workerProfileRepository.findExploreWorkerById(id);

  if (!worker) {
    throw new AppError('Worker not found or not approved', 404);
  }

  new SuccessResponse('Worker retrieved successfully', worker, 200).send(res);
});
