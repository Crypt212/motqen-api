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
import { Repository } from "../repositories/database/Repository.js";

/**
 * Configuration for government query validation
 */
const GOVERNMENT_QUERY_CONFIG = {
  allowedFilterFields: ['name', 'nameAr', 'long', 'lat'],
  filterFieldTypes: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    nameAr: { type: 'string', minLength: 2, maxLength: 100 },
    long: { type: 'string', minLength: 2, maxLength: 100 },
    lat: { type: 'string', minLength: 2, maxLength: 100 },
  },
  allowedOrderByFields: ['name', 'nameAr', 'long', 'lat', 'createdAt', 'updatedAt'],
  allowedSearchFields: ['name', 'nameAr', 'long', 'lat']
};

const CITY_QUERY_CONFIG = {
  allowedFilterFields: ['name', 'nameAr', 'long', 'lat', 'governmentId'],
  filterFieldTypes: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    nameAr: { type: 'string', minLength: 2, maxLength: 100 },
    long: { type: 'string', minLength: 2, maxLength: 100 },
    lat: { type: 'string', minLength: 2, maxLength: 100 },
    governmentId: { type: 'uuid' }
  },
  allowedOrderByFields: ['name', 'nameAr', 'long', 'lat', 'createdAt', 'updatedAt'],
  allowedSearchFields: ['name', 'nameAr', 'long', 'lat']
};

/**
 * Get all governments with pagination, filtering, and ordering
 */
export const getGovernments = asyncHandler(async (req, res) => {
  const { pagination, filter, orderBy } = matchedData(req, { includeOptionals: true });

  const orderByClause = Repository.handleOrder(orderBy);
  filter.orderBy = orderByClause;
  const result = await governmentRepository.findMany({
    filter,
    pagination,
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
  const { id } = matchedData(req, { includeOptionals: true });
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
  const { name, nameAr, long, lat } = matchedData(req, { includeOptionals: true });

  const government = await governmentRepository.create({ name, nameAr, long, lat });

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
  const { id, name, nameAr, long, lat } = matchedData(req, { includeOptionals: true });

  const existing = await governmentRepository.findFirst({ id });
  if (!existing) {
    throw new AppError("Government not found", 404);
  }

  await governmentRepository.updateMany({ name, nameAr, long, lat }, { id });
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
  const { id } = matchedData(req, { includeOptionals: true });

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
  const { governmentId, pagination, filter, orderBy } = matchedData(req, { includeOptionals: true });

  const government = await governmentRepository.findFirst({ id: governmentId });
  if (!government) {
    throw new AppError('Government not found', 404);
  }

  filter.where = { governmentId };
  filter.orderBy = Repository.handleOrder(orderBy);
  const citiesResult = await governmentRepository.findCities({
    filter,
    pagination,
  });

  new SuccessResponse('Cities retrieved', {
    cities: citiesResult.data,
    pagination: citiesResult.pagination,
  }).send(res);
});
