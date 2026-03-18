/**
 * @fileoverview Government Controller - Handle government-related HTTP requests
 * @module controllers/GovernmentController
 */

import { matchedData } from "express-validator";
import AppError from "../errors/AppError.js";
import SuccessResponse from "../responses/successResponse.js";
import { governmentRepository } from "../state.js";
import { asyncHandler } from '../types/asyncHandler.js';
import { handleManyQuery } from "../utils/handleFilteration.js";

/**
 * Get all governments with pagination, filtering, and ordering
 */
export const getGovernments = asyncHandler(async (req, res) => {
  const { filter, sortBy, sortOrder, page, limit } = matchedData(req, { includeOptionals: true });
  const { finalFilter, paginationResult } = await handleManyQuery({filter, sortBy, sortOrder, page, limit, modelName: "government"});

  const result = await governmentRepository.findMany({ filter: finalFilter});

  new SuccessResponse(
    "Governments retrieved successfully",
    {
      governments: result,
      pagination: paginationResult,
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
  const { filter, sortBy, sortOrder, page, limit } = matchedData(req, { includeOptionals: true });
  let { finalFilter, paginationResult } = await handleManyQuery({filter, sortBy, sortOrder, page, limit, modelName: "city"});

  if (!finalFilter) finalFilter = {};
  if (!finalFilter.where) finalFilter.where = {};
  finalFilter.where.governmentId = req.params.governmentId;

  const citiesResult = await governmentRepository.findCities({
    filter: finalFilter,
  });

  new SuccessResponse('Cities retrieved', {
    cities: citiesResult,
    pagination: paginationResult,
  }).send(res);
});
