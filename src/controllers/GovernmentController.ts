/**
 * @fileoverview Government Controller - Handle government-related HTTP requests
 * @module controllers/GovernmentController
 */

import { GovernmentFilterSchema } from '../schemas/governments.js';
import SuccessResponse from '../responses/successResponse.js';
import GovernmentService from '../services/GovernmentService.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQueryParams } from '../schemas/common.js';

export default class GovernmentController {
  private governmentService: GovernmentService;

  private normalizeCoordinate(value: unknown): string | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    return undefined;
  }

  constructor(params: { governmentService: GovernmentService }) {
    this.governmentService = params.governmentService;
  }

  getGovernments = asyncHandler(async (req, res) => {
    const { filter, pagination, sort } = parseQueryParams(req.query, GovernmentFilterSchema);
    const result = await this.governmentService.getGovernments({
      filter,
      pagination,
      sort: sort[0],
    });

    new SuccessResponse('Governments retrieved successfully', result, 200).send(res);
  });

  getGovernmentById = asyncHandler(async (req, res) => {
    const id = req.params.governmentId as string;

    const government = await this.governmentService.getGovernmentById({ id });

    new SuccessResponse('Government retrieved successfully', { government }, 200).send(res);
  });

  createGovernment = asyncHandler(async (req, res) => {
    const { name, nameAr, long, lat } = req.body;
    const normalizedLong = this.normalizeCoordinate(long);
    const normalizedLat = this.normalizeCoordinate(lat);

    const government = await this.governmentService.createGovernment({
      data: {
        name,
        nameAr,
        long: normalizedLong as string,
        lat: normalizedLat as string,
      },
    });

    new SuccessResponse('Government created successfully', { government }, 201).send(res);
  });

  updateGovernment = asyncHandler(async (req, res) => {
    const { name, nameAr, long, lat } = req.body;
    const id = req.params.governmentId as string;
    const normalizedLong = this.normalizeCoordinate(long);
    const normalizedLat = this.normalizeCoordinate(lat);

    const government = await this.governmentService.updateGovernment({
      id,
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(nameAr !== undefined ? { nameAr } : {}),
        ...(normalizedLong !== undefined ? { long: normalizedLong } : {}),
        ...(normalizedLat !== undefined ? { lat: normalizedLat } : {}),
      },
    });

    new SuccessResponse('Government updated successfully', { government }, 200).send(res);
  });

  deleteGovernment = asyncHandler(async (req, res) => {
    const id = req.params.governmentId as string;

    await this.governmentService.deleteGovernment({ id });

    new SuccessResponse('Government deleted successfully', null, 200).send(res);
  });

  getCitiesByGovernment = asyncHandler(async (req, res) => {
    const { filter, pagination, sort } = parseQueryParams(req.query, GovernmentFilterSchema);
    const governmentId = req.params.governmentId as string;

    const result = await this.governmentService.getCitiesByGovernment({
      governmentId,
      filter,
      pagination,
      sort: sort[0],
    });

    new SuccessResponse('Cities retrieved', result).send(res);
  });
}
