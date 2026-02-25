/**
 * @fileoverview Specialization Controller - Handle specialization-related HTTP requests
 * @module controllers/SpecializationController
 */

import AppError from "../errors/AppError.js";
import SuccessResponse from "../responses/successResponse.js";
import { specializationRepository } from "../state.js";
import { asyncHandler } from '../types/asyncHandler.js';

/** @typedef {import("../types/asyncHandler.js").UserPayload} UserPayload */
/** @template T @typedef {import("../types/asyncHandler.js").RequestHandler<T>} RequestHandler<T> */

/**
 * Get all specializations
 * @type {RequestHandler<{}>}
 */
export const getSpecializations = asyncHandler(async (_, res) => {
  const specializations = await specializationRepository.findMany();

  new SuccessResponse(
    "Specializations retrieved successfully",
    { specializations },
    200
  ).send(res);
});

/**
 * Get specialization by ID
 * @type {RequestHandler<{}>}
 */
export const getSpecializationById = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const specialization = await specializationRepository.findOne({ id });

  if (!specialization) {
    throw new AppError("Specialization not found", 404);
  }

  new SuccessResponse(
    "Specialization retrieved successfully",
    { specialization },
    200
  ).send(res);
});

/**
 * Get sub-specializations by parent ID
 * @type {RequestHandler<{}>}
 */
export const getSubSpecializations = asyncHandler(async (req, res) => {
  const id = String(req.params.id);

  const specialization = await specializationRepository.findOne({ id });
  if (!specialization) {
    throw new AppError("Specialization not found", 404);
  }

  const subSpecializations = await specializationRepository.findSubSpecializations({ mainSpecializationId: id });

  new SuccessResponse(
    "Sub-specializations retrieved successfully",
    { subSpecializations },
    200
  ).send(res);
});

/**
 * Create a new specialization (Admin only)
 * @type {RequestHandler<UserPayload>}
 */
export const createSpecialization = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const specialization = await specializationRepository.create({ name });

  new SuccessResponse(
    "Specialization created successfully",
    { specialization },
    201
  ).send(res);
});

/**
 * Update specialization (Admin only)
 * @type {RequestHandler<UserPayload>}
 */
export const updateSpecialization = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const { name } = req.body;

  const existing = await specializationRepository.findOne({ id });
  if (!existing) {
    throw new AppError("Specialization not found", 404);
  }

  const specialization = await specializationRepository.updateById(id, { name });

  new SuccessResponse(
    "Specialization updated successfully",
    { specialization },
    200
  ).send(res);
});

/**
 * Delete specialization (Admin only)
 * @type {RequestHandler<UserPayload>}
 */
export const deleteSpecialization = asyncHandler(async (req, res) => {
  const id = String(req.params.id);

  const existing = await specializationRepository.findOne({ id });
  if (!existing) {
    throw new AppError("Specialization not found", 404);
  }

  await specializationRepository.deleteById(id);

  new SuccessResponse(
    "Specialization deleted successfully",
    null,
    200
  ).send(res);
});

/**
 * Create a new sub-specialization (Admin only)
 * @type {RequestHandler<UserPayload>}
 */
export const createSubSpecialization = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const { name } = req.body;

  const parent = await specializationRepository.findOne({ id });
  if (!parent) {
    throw new AppError("Parent specialization not found", 404);
  }

  const subSpecialization = await specializationRepository.createSubSpecializations(id, [{ name }]);

  new SuccessResponse(
    "Sub-specialization created successfully",
    { subSpecialization },
    201
  ).send(res);
});

/**
 * Delete sub-specialization (Admin only)
 * @type {RequestHandler<UserPayload>}
 */
export const deleteSubSpecialization = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const subId = String(req.params.subId);

  const existing = await specializationRepository.findSubSpecializations({ id: subId });
  if (!existing) {
    throw new AppError("Sub-specialization not found", 404);
  }

  await specializationRepository.deleteSubSpecializations({
    id: subId,
    mainSpecializationId: id
  });

  new SuccessResponse(
    "Sub-specialization deleted successfully",
    null,
    200
  ).send(res);
});
