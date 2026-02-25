/**
 * @fileoverview Government Controller - Handle government-related HTTP requests
 * @module controllers/GovernmentController
 */

import AppError from "../errors/AppError.js";
import SuccessResponse from "../responses/successResponse.js";
import { governmentRepository } from "../state.js";
import { asyncHandler } from '../types/asyncHandler.js';

/** @typedef {import("../types/asyncHandler.js").UserPayload} UserPayload */
/** @template T @typedef {import("../types/asyncHandler.js").RequestHandler<T>} RequestHandler<T> */

/**
 * Get all governments
 * @type {RequestHandler<{}>}
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
 * @type {RequestHandler<{}>}
 */
export const getGovernmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const government = await governmentRepository.findOne({ id });

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
 * @type {RequestHandler<UserPayload>}
 */
export const createGovernment = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const government = await governmentRepository.create({ name });

  new SuccessResponse(
    "Government created successfully",
    { government },
    201
  ).send(res);
});

/**
 * Update government (Admin only)
 * @type {RequestHandler<UserPayload>}
 */
export const updateGovernment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const existing = await governmentRepository.findOne({ id });
  if (!existing) {
    throw new AppError("Government not found", 404);
  }

  await governmentRepository.update({ name: name }, { id });
  const government = await governmentRepository.findOne({ id });

  new SuccessResponse(
    "Government updated successfully",
    { government },
    200
  ).send(res);
});

/**
 * Delete government (Admin only)
 * @type {RequestHandler<UserPayload>}
 */
export const deleteGovernment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await governmentRepository.findOne({ id });
  if (!existing) {
    throw new AppError("Government not found", 404);
  }

  await governmentRepository.delete({ id });

  new SuccessResponse(
    "Government deleted successfully",
    null,
    200
  ).send(res);
});
