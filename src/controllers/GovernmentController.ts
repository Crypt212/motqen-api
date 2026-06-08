/**
 * @fileoverview Government Controller - Handle government-related HTTP requests
 * @module controllers/GovernmentController
 */

import {
  GovernmentFilterSchema,
  GovernmentQuery,
  CreateGovernmentDTO,
  UpdateGovernmentDTO,
} from '../schemas/requests/government.request.js';
import {
  GovernmentListResponseDTO,
  GovernmentResponseDTO,
  CityListResponseDTO,
  DeleteGovernmentResponseDTO,
} from '../schemas/responses/government.response.js';
import GovernmentService from '../services/GovernmentService.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQueryParams } from '../schemas/common.js';

export default class GovernmentController {
  private governmentService: GovernmentService;

  private normalizeCoordinate(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      return Number(value.trim());
    }

    return undefined;
  }

  constructor(params: { governmentService: GovernmentService }) {
    this.governmentService = params.governmentService;
  }

  getGovernments = asyncHandler<GovernmentListResponseDTO, any, GovernmentQuery>(async (req, res) => {
    const { filter, pagination, sort } = parseQueryParams(req.parsed!.query!, GovernmentFilterSchema);
    const result = await this.governmentService.getGovernments({
      filter,
      pagination,
      sort,
    });

    res.status(200).send({ status: 'success', message: 'Governments retrieved successfully', data: result });
  });

  getGovernmentById = asyncHandler<GovernmentResponseDTO, any, any, { governmentId: string }>(async (req, res) => {
    const id = req.parsed!.params!.governmentId;

    const government = await this.governmentService.getGovernmentById({ id });

    res.status(200).send({ status: 'success', message: 'Government retrieved successfully', data: { government } });
  });

  createGovernment = asyncHandler<GovernmentResponseDTO, CreateGovernmentDTO>(async (req, res) => {
    const { name, nameAr, long, lat } = req.parsed!.body!;
    const normalizedLong = this.normalizeCoordinate(long);
    const normalizedLat = this.normalizeCoordinate(lat);

    const government = await this.governmentService.createGovernment({
      data: {
        name,
        nameAr,
        long: normalizedLong,
        lat: normalizedLat,
      },
    });

    res.status(201).send({ status: 'success', message: 'Government created successfully', data: { government } });
  });

  updateGovernment = asyncHandler<GovernmentResponseDTO, UpdateGovernmentDTO, any, { governmentId: string }>(async (req, res) => {
    const id = req.parsed!.params!.governmentId;
    const { name, nameAr, long, lat } = req.parsed!.body!;
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

    res.status(200).send({ status: 'success', message: 'Government updated successfully', data: { government } });
  });

  deleteGovernment = asyncHandler<DeleteGovernmentResponseDTO, any, any, { governmentId: string }>(async (req, res) => {
    const id = req.parsed!.params!.governmentId;

    await this.governmentService.deleteGovernment({ id });

    res.status(200).send({ status: 'success', message: 'Government deleted successfully', data: null });
  });

  getCitiesByGovernment = asyncHandler<CityListResponseDTO, any, GovernmentQuery, { governmentId: string }>(async (req, res) => {
    const { filter, pagination, sort } = parseQueryParams(req.parsed!.query!, GovernmentFilterSchema);
    const governmentId = req.parsed!.params!.governmentId;

    const result = await this.governmentService.getCitiesByGovernment({
      governmentId,
      filter,
      pagination,
      sort,
    });

    res.status(200).send({ status: 'success', message: 'Cities retrieved', data: result });
  });
}
