/**
 * @fileoverview Specialization Controller - Handle specialization-related HTTP requests
 * @module controllers/SpecializationController
 */

import { matchedData } from "express-validator";
import AppError from "../errors/AppError.js";
import SuccessResponse from "../responses/successResponse.js";
import { specializationRepository } from "../state.js";
import { asyncHandler } from '../types/asyncHandler.js';
import { handleManyQuery } from "../utils/handleFilteration.js";

/**
 * Get all specializations with pagination, filtering, and ordering
 */
export const getSpecializations = asyncHandler(async (req, res) => {
  const { filter, sortBy, sortOrder, page, limit } = matchedData(req, { includeOptionals: true });
  const { finalFilter, paginationResult } = await handleManyQuery({filter, sortBy, sortOrder, page, limit, modelName: "specialization"});

  const result = await specializationRepository.findMany({
    filter: finalFilter,
  });

  new SuccessResponse(
    "Specializations retrieved successfully",
    {
      specializations: result,
      pagination: paginationResult,
    },
    200
  ).send(res);
});

/**
 * Get specialization by ID
 */
export const getSpecializationById = asyncHandler(async (req, res) => {
  const { id } = matchedData(req, { includeOptionals: true });
  const specialization = await specializationRepository.findFirst({ where: { id } });

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
 * Get sub-specializations by parent ID with pagination
 */
export const getSubSpecializations = asyncHandler(async (req, res) => {
  const { id, page, limit, sortBy, sortOrder, filter} = matchedData(req, { includeOptionals: true });

  const specialization = await specializationRepository.findFirst({ where: { id } });
  if (!specialization) {
    throw new AppError("Specialization not found", 404);
  }
  filter.mainSpecializationId = id;
  const { finalFilter, paginationResult } = await handleManyQuery({filter, sortBy, sortOrder, page, limit, modelName: "subSpecialization"});
  const subSpecializationsResult = await specializationRepository.findSubSpecializations({
    filter: finalFilter,
  });

  new SuccessResponse(
    "Sub-specializations retrieved successfully",
    {
      subSpecializations: subSpecializationsResult,
      pagination: paginationResult,
    },
    200
  ).send(res);
});

/**
 * Create a new specialization (Admin only)
 */
export const createSpecialization = asyncHandler(async (req, res) => {
  const { name, nameAr, category } = matchedData(req, { includeOptionals: true });

  const specialization = await specializationRepository.create({ name, nameAr, category });

  new SuccessResponse(
    "Specialization created successfully",
    { specialization },
    201
  ).send(res);
});

/**
 * Update specialization (Admin only)
 */
export const updateSpecialization = asyncHandler(async (req, res) => {
  const { name, nameAr, category } = matchedData(req, { includeOptionals: true });
  const id = String(req.params.id);

  const existing = await specializationRepository.findFirst({ where: { id } });
  if (!existing) {
    throw new AppError("Specialization not found", 404);
  }

  const specialization = await specializationRepository.update({ where: { id }, data: { name, nameAr, category } });

  new SuccessResponse(
    "Specialization updated successfully",
    { specialization },
    200
  ).send(res);
});

/**
 * Delete specialization (Admin only)
 */
export const deleteSpecialization = asyncHandler(async (req, res) => {
  const id = String(req.params.id);

  const existing = await specializationRepository.findFirst({ where: { id } });
  if (!existing) {
    throw new AppError("Specialization not found", 404);
  }

  await specializationRepository.delete({ where: { id } });

  new SuccessResponse(
    "Specialization deleted successfully",
    null,
    200
  ).send(res);
});

/**
 * Create a new sub-specialization (Admin only)
 */
export const createSubSpecialization = asyncHandler(async (req, res) => {
  const { name, nameAr } = matchedData(req, { includeOptionals: true });
  const id = String(req.params.id);

  const parent = await specializationRepository.findFirst({ where: { id } });
  if (!parent) {
    throw new AppError("Parent specialization not found", 404);
  }

  const subSpecialization = await specializationRepository.createSubSpecialization(id, { name, nameAr, mainSpecialization: { connect: { id } } });

  new SuccessResponse(
    "Sub-specialization created successfully",
    { subSpecialization },
    201
  ).send(res);
});

/**
 * Delete sub-specialization (Admin only)
 */
export const deleteSubSpecialization = asyncHandler(async (req, res) => {
  const subId = String(req.params.subId);
  const id = String(req.params.id);


  const existing = await specializationRepository.findSubSpecialization({ filter: { where: { id: subId } } });
  if (!existing) {
    throw new AppError("Sub-specialization not found", 404);
  }

  await specializationRepository.deleteSubSpecialization({
    where: {
      id: subId,
      mainSpecializationId: id
    }
  });

  new SuccessResponse(
    "Sub-specialization deleted successfully",
    null,
    200
  ).send(res);
});
