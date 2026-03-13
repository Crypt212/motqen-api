/**
 * @fileoverview Government Controller - Handle government-related HTTP requests
 * @module controllers/GovernmentController
 */

import { matchedData } from "express-validator";
import AppError from "../errors/AppError.js";
import SuccessResponse from "../responses/successResponse.js";
import { governmentRepository } from "../state.js";
import { asyncHandler } from '../types/asyncHandler.js';

/**
 * Get all governments
 */
export const getGovernments = asyncHandler(async (_, res) => {
  const governments = await governmentRepository.findMany();

  new SuccessResponse(
    "Governments retrieved successfully",
    { governments },
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
 * Get all cities under a specific government
 */
export const getCitiesByGovernment = asyncHandler(async (req, res) => {
    const governmentId = String(req.params.governmentId);

    const government = await governmentRepository.findFirst({ id: governmentId });
    if (!government) {
        throw new AppError('Government not found', 404);
    }

    const cities = await governmentRepository.findCities({ governmentId });

    new SuccessResponse('Cities retrieved', { cities }).send(res);
});
