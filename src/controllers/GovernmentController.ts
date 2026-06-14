/**
 * @fileoverview Government Controller - Handle government-related HTTP requests
 * @module controllers/GovernmentController
 */

import {
  GetGovernmentsRequestDTO,
  GetGovernmentsQueryDTO,
  GetGovernmentsParamsDTO,
  GetGovernmentByIdRequestDTO,
  GetGovernmentByIdQueryDTO,
  GetGovernmentByIdParamsDTO,
  CreateGovernmentRequestDTO,
  CreateGovernmentQueryDTO,
  CreateGovernmentParamsDTO,
  UpdateGovernmentRequestDTO,
  UpdateGovernmentQueryDTO,
  UpdateGovernmentParamsDTO,
  DeleteGovernmentRequestDTO,
  DeleteGovernmentQueryDTO,
  DeleteGovernmentParamsDTO,
  GetCitiesByGovernmentRequestDTO,
  GetCitiesByGovernmentQueryDTO,
  GetCitiesByGovernmentParamsDTO,
  GetCityByIdRequestDTO,
  GetCityByIdQueryDTO,
  GetCityByIdParamsDTO,
  CreateCityRequestDTO,
  CreateCityQueryDTO,
  CreateCityParamsDTO,
  UpdateCityRequestDTO,
  UpdateCityQueryDTO,
  UpdateCityParamsDTO,
  DeleteCityRequestDTO,
  DeleteCityQueryDTO,
  DeleteCityParamsDTO,
} from '../schemas/requests/government.request.js';
import {
  GetGovernmentsResponseDTO,
  GetGovernmentByIdResponseDTO,
  CreateGovernmentResponseDTO,
  UpdateGovernmentResponseDTO,
  DeleteGovernmentResponseDTO,
  GetCitiesByGovernmentResponseDTO,
  GetCityByIdResponseDTO,
  CreateCityResponseDTO,
  UpdateCityResponseDTO,
  DeleteCityResponseDTO,
} from '../schemas/responses/government.response.js';
import GovernmentService from '../services/GovernmentService.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQuery } from '../schemas/common.js';

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

  getGovernments = asyncHandler<GetGovernmentsResponseDTO, GetGovernmentsRequestDTO, GetGovernmentsQueryDTO, GetGovernmentsParamsDTO>(async (req, res) => {
    const { filter, pagination, sort } = parseQuery(req.parsed!.query!);
    console.log(sort);
    const result = await this.governmentService.getGovernments({
      filter,
      pagination,
      sort
    });

    res.status(200).send({ status: 'success', message: 'Governments retrieved successfully', data: result });
  });

  getGovernmentById = asyncHandler<GetGovernmentByIdResponseDTO, GetGovernmentByIdRequestDTO, GetGovernmentByIdQueryDTO, GetGovernmentByIdParamsDTO>(async (req, res) => {
    const id = req.parsed!.params!.governmentId;

    const government = await this.governmentService.getGovernmentById({ id });

    res.status(200).send({ status: 'success', message: 'Government retrieved successfully', data: { government } });
  });

  createGovernment = asyncHandler<CreateGovernmentResponseDTO, CreateGovernmentRequestDTO, CreateGovernmentQueryDTO, CreateGovernmentParamsDTO>(async (req, res) => {
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

  updateGovernment = asyncHandler<UpdateGovernmentResponseDTO, UpdateGovernmentRequestDTO, UpdateGovernmentQueryDTO, UpdateGovernmentParamsDTO>(async (req, res) => {
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

  deleteGovernment = asyncHandler<DeleteGovernmentResponseDTO, DeleteGovernmentRequestDTO, DeleteGovernmentQueryDTO, DeleteGovernmentParamsDTO>(async (req, res) => {
    const id = req.parsed!.params!.governmentId;

    await this.governmentService.deleteGovernment({ id });

    res.status(200).send({ status: 'success', message: 'Government deleted successfully', data: null });
  });

  getCitiesByGovernment = asyncHandler<GetCitiesByGovernmentResponseDTO, GetCitiesByGovernmentRequestDTO, GetCitiesByGovernmentQueryDTO, GetCitiesByGovernmentParamsDTO>(async (req, res) => {
    const { filter: cityFilter, pagination, sort } = parseQuery(req.parsed!.query!);
    const governmentId = req.parsed!.params!.governmentId;

    const result = await this.governmentService.getCitiesByGovernment({
      governmentId,
      cityFilter,
      pagination,
      sort,
    });

    res.status(200).send({ status: 'success', message: 'Cities retrieved', data: result });
  });

  getCityById = asyncHandler<GetCityByIdResponseDTO, GetCityByIdRequestDTO, GetCityByIdQueryDTO, GetCityByIdParamsDTO>(async (req, res) => {
    const id = req.parsed!.params!.cityId;
    const city = await this.governmentService.getCityById({ id });
    res.status(200).send({ status: 'success', message: 'City retrieved successfully', data: { city } });
  });

  createCity = asyncHandler<CreateCityResponseDTO, CreateCityRequestDTO, CreateCityQueryDTO, CreateCityParamsDTO>(async (req, res) => {
    const governmentId = req.parsed!.params!.governmentId;
    const { name, nameAr, long, lat } = req.parsed!.body!;

    const normalizedLong = this.normalizeCoordinate(long);
    const normalizedLat = this.normalizeCoordinate(lat);

    const city = await this.governmentService.createCity({
      governmentId,
      data: {
        name,
        nameAr,
        long: normalizedLong,
        lat: normalizedLat,
      },
    });

    res.status(201).send({ status: 'success', message: 'City created successfully', data: { city } });
  });

  updateCity = asyncHandler<UpdateCityResponseDTO, UpdateCityRequestDTO, UpdateCityQueryDTO, UpdateCityParamsDTO>(async (req, res) => {
    const id = req.parsed!.params!.cityId;
    const { name, nameAr, long, lat } = req.parsed!.body!;

    const normalizedLong = this.normalizeCoordinate(long);
    const normalizedLat = this.normalizeCoordinate(lat);

    const city = await this.governmentService.updateCity({
      id,
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(nameAr !== undefined ? { nameAr } : {}),
        ...(normalizedLong !== undefined ? { long: normalizedLong } : {}),
        ...(normalizedLat !== undefined ? { lat: normalizedLat } : {}),
      },
    });

    res.status(200).send({ status: 'success', message: 'City updated successfully', data: { city } });
  });

  deleteCity = asyncHandler<DeleteCityResponseDTO, DeleteCityRequestDTO, DeleteCityQueryDTO, DeleteCityParamsDTO>(async (req, res) => {
    const id = req.parsed!.params!.cityId;
    await this.governmentService.deleteCity({ id });
    res.status(200).send({ status: 'success', message: 'City deleted successfully', data: null });
  });
}
