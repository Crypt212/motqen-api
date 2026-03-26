/**
 * @fileoverview Specialization Controller - Handle specialization-related HTTP requests
 * @module controllers/SpecializationController
 */

import SuccessResponse from '../responses/successResponse.js';
import { specializationService } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQueryParams } from '../schemas/common.js';
import {
  SpecializationFilterSchema,
  SubSpecializationFilterSchema,
} from '../schemas/specializations.js';

/**
 * Get all specializations with pagination, filtering, and ordering
 */
export const getSpecializations = asyncHandler(async (req, res) => {
  const { filter, pagination, sort } = parseQueryParams(req.query, SpecializationFilterSchema);

  const result = await specializationService.getSpecializations({
    filter,
    pagination,
    sort: sort[0],
  });

  new SuccessResponse('Specializations retrieved successfully', result, 200).send(res);
});

/**
 * Get specialization by ID
 */
export const getSpecializationById = asyncHandler(async (req, res) => {
  const id = req.params.specializationId as string;
  const specialization = await specializationService.getSpecializationById({ id });

  new SuccessResponse('Specialization retrieved successfully', { specialization }, 200).send(res);
});

/**
 * Get sub-specializations by parent ID with pagination
 */
export const getSubSpecializations = asyncHandler(async (req, res) => {
  const { filter, pagination, sort } = parseQueryParams(req.query, SubSpecializationFilterSchema);
  const parentId = String(req.params.specializationId);

  const result = await specializationService.getSubSpecializations({
    parentId,
    filter,
    pagination,
    sort: sort[0],
  });

  new SuccessResponse('Sub-specializations retrieved successfully', result, 200).send(res);
});

/**
 * Create a new specialization (Admin only)
 */
export const createSpecialization = asyncHandler(async (req, res) => {
  const { name, nameAr, category } = req.body;

  const specialization = await specializationService.createSpecialization({
    input: { name, nameAr, category },
  });

  new SuccessResponse('Specialization created successfully', { specialization }, 201).send(res);
});

/**
 * Update specialization (Admin only)
 */
export const updateSpecialization = asyncHandler(async (req, res) => {
  const { name, nameAr, category } = req.body;
  const id = req.params.specializationId as string;

  const specialization = await specializationService.updateSpecialization({
    id,
    input: { name, nameAr, category },
  });

  new SuccessResponse('Specialization updated successfully', { specialization }, 200).send(res);
});

/**
 * Delete specialization (Admin only)
 */
export const deleteSpecialization = asyncHandler(async (req, res) => {
  const id = req.params.specializationId as string;

  await specializationService.deleteSpecialization({ id });

  new SuccessResponse('Specialization deleted successfully', null, 200).send(res);
});

/**
 * Create a new sub-specialization (Admin only)
 */
export const createSubSpecialization = asyncHandler(async (req, res) => {
  const { name, nameAr } = req.body;
  const id = String(req.params.specializationId);

  const subSpecialization = await specializationService.createSubSpecialization({
    parentId: id,
    input: { name, nameAr },
  });

  new SuccessResponse('Sub-specialization created successfully', { subSpecialization }, 201).send(
    res
  );
});

/**
 * Delete sub-specialization (Admin only)
 */
export const deleteSubSpecialization = asyncHandler(async (req, res) => {
  const subId = req.params.subSpecializationId as string;
  const id = req.params.specializationId as string;

  await specializationService.deleteSubSpecialization({ parentId: id, subId });

  new SuccessResponse('Sub-specialization deleted successfully', null, 200).send(res);
});
