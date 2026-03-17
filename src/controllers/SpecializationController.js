/**
 * @fileoverview Specialization Controller - Handle specialization-related HTTP requests
 * @module controllers/SpecializationController
 */

import { matchedData } from "express-validator";
import AppError from "../errors/AppError.js";
import SuccessResponse from "../responses/successResponse.js";
import { specializationRepository } from "../state.js";
import { asyncHandler } from '../types/asyncHandler.js';
import { Repository } from "../repositories/database/Repository.js";

/**
 * Get all specializations with pagination, filtering, and ordering
 */
export const getSpecializations = asyncHandler(async (req, res) => {
  const { pagination, filter, orderBy } = matchedData(req, { includeOptionals: true });

  filter.orderBy = Repository.handleOrder(orderBy);

  const result = await specializationRepository.findMany({
    filter,
    pagination,
    paginate: true
  });

  new SuccessResponse(
    "Specializations retrieved successfully",
    {
      specializations: result.data,
      pagination: result.pagination,
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
  const { id, pagination, filter, orderBy } = matchedData(req, { includeOptionals: true });

  const specialization = await specializationRepository.findFirst({ where: { id } });
  if (!specialization) {
    throw new AppError("Specialization not found", 404);
  }

  filter.mainSpecializationId = id;
  filter.orderBy = Repository.handleOrder(orderBy);
  const subSpecializationsResult = await specializationRepository.findSubSpecializations({
    filter,
    pagination,
    paginate: true
  });

  new SuccessResponse(
    "Sub-specializations retrieved successfully",
    {
      subSpecializations: subSpecializationsResult.data,
      pagination: subSpecializationsResult.pagination,
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
  const { id, name, nameAr, category } = matchedData(req, { includeOptionals: true });

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
  const { id } = matchedData(req, { includeOptionals: true });

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
  const { id, name, nameAr } = matchedData(req, { includeOptionals: true });

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
  const { id, subId } = matchedData(req, { includeOptionals: true });

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
