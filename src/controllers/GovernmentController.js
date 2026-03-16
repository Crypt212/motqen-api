/**
 * @fileoverview Government Controller - Handle government-related HTTP requests
 * @module controllers/GovernmentController
 */

import { matchedData } from "express-validator";
import AppError from "../errors/AppError.js";
import SuccessResponse from "../responses/successResponse.js";
import { governmentRepository } from "../state.js";
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQueryParams } from '../validators/common.js';

/**
 * Configuration for government query validation
 */
const GOVERNMENT_QUERY_CONFIG = {
  allowedFilterFields: ['name', 'status'],
  filterFieldTypes: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    status: { type: 'enum', enumValues: ['ACTIVE', 'INACTIVE', 'PENDING'] }
  },
  allowedOrderByFields: ['name', 'createdAt', 'updatedAt'],
  allowedSearchFields: ['name']
};

const CITY_QUERY_CONFIG = {
  allowedFilterFields: ['name', 'governmentId'],
  filterFieldTypes: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    governmentId: { type: 'uuid' }
  },
  allowedOrderByFields: ['name', 'createdAt', 'updatedAt'],
  allowedSearchFields: ['name']
};

/**
 * Get all governments with pagination, filtering, and ordering
 */
export const getGovernments = asyncHandler(async (req, res) => {
  const { pagination, filter, orderBy } = parseQueryParams(req.query, GOVERNMENT_QUERY_CONFIG);

  const result = await governmentRepository.findMany({
    where: filter,
    pagination,
    orderBy,
    paginate: true
  });

  new SuccessResponse(
    "Governments retrieved successfully",
    {
      governments: result.data,
      pagination: result.pagination,
    },
    200
  ).send(res);
});

/**
 * Get government by ID
 */
export const getGovernmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const government = await governmentRepository.findFirst({ id });

  if (!government) {
    throw new AppError("Government not found", 404);
  }

  new SuccessResponse(
    "Government retrieved successfully",
    { government },
    200
  ).send(res);
});

/**
 * Create a new government (Admin only)
 */
export const createGovernment = asyncHandler(async (req, res) => {
  const { name } = matchedData(req, { includeOptionals: true });

  const government = await governmentRepository.create({ name });

  new SuccessResponse(
    "Government created successfully",
    { government },
    201
  ).send(res);
});

/**
 * Update government (Admin only)
 */
export const updateGovernment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = matchedData(req, { includeOptionals: true });

  const existing = await governmentRepository.findFirst({ id });
  if (!existing) {
    throw new AppError("Government not found", 404);
  }

  await governmentRepository.updateMany({ name: name }, { id });
  const government = await governmentRepository.findFirst({ id });

  new SuccessResponse(
    "Government updated successfully",
    { government },
    200
  ).send(res);
});

/**
 * Delete government (Admin only)
 */
export const deleteGovernment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await governmentRepository.findFirst({ id });
  if (!existing) {
    throw new AppError("Government not found", 404);
  }

  await governmentRepository.deleteMany({ id });

  new SuccessResponse(
    "Government deleted successfully",
    null,
    200
  ).send(res);
});

/**
 * Get all cities under a specific government with pagination
 */
export const getCitiesByGovernment = asyncHandler(async (req, res) => {
  const governmentId = String(req.params.governmentId);
  const { pagination, filter, orderBy } = parseQueryParams(req.query, CITY_QUERY_CONFIG);

  const government = await governmentRepository.findFirst({ id: governmentId });
  if (!government) {
    throw new AppError('Government not found', 404);
  }

  console.log(government);

  const citiesResult = await governmentRepository.findCities({
    filter: { ...filter, governmentId },
    pagination,
    orderBy,
    paginate: true
  });

  new SuccessResponse('Cities retrieved', {
    cities: citiesResult.data,
    pagination: citiesResult.pagination,
  }).send(res);
});
