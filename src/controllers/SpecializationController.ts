/**
 * @fileoverview Specialization Controller - Handle specialization-related HTTP requests
 * @module controllers/SpecializationController
 */

import { specializationService } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQuery } from '../schemas/common.js';
import {
  GetSpecializationsRequestDTO,
  GetSpecializationsQueryDTO,
  GetSpecializationsParamsDTO,
  GetSpecializationByIdRequestDTO,
  GetSpecializationByIdQueryDTO,
  GetSpecializationByIdParamsDTO,
  GetSubSpecializationsRequestDTO,
  GetSubSpecializationsQueryDTO,
  GetSubSpecializationsParamsDTO,
  CreateSpecializationRequestDTO,
  CreateSpecializationQueryDTO,
  CreateSpecializationParamsDTO,
  UpdateSpecializationRequestDTO,
  UpdateSpecializationQueryDTO,
  UpdateSpecializationParamsDTO,
  DeleteSpecializationRequestDTO,
  DeleteSpecializationQueryDTO,
  DeleteSpecializationParamsDTO,
  CreateSubSpecializationRequestDTO,
  CreateSubSpecializationQueryDTO,
  CreateSubSpecializationParamsDTO,
  DeleteSubSpecializationRequestDTO,
  DeleteSubSpecializationQueryDTO,
  DeleteSubSpecializationParamsDTO
} from '../schemas/requests/specialization.request.js';
import {
  GetSpecializationsResponseDTO,
  GetSpecializationByIdResponseDTO,
  GetSubSpecializationsResponseDTO,
  CreateSpecializationResponseDTO,
  UpdateSpecializationResponseDTO,
  DeleteSpecializationResponseDTO,
  CreateSubSpecializationResponseDTO,
  DeleteSubSpecializationResponseDTO
} from '../schemas/responses/specialization.response.js';

/**
 * Get all specializations with pagination, filtering, and ordering
 */
export const getSpecializations = asyncHandler<GetSpecializationsResponseDTO, GetSpecializationsRequestDTO, GetSpecializationsQueryDTO, GetSpecializationsParamsDTO>(async (req, res) => {
  const { filter, pagination, sort } = parseQuery(req.parsed!.query!);

  const result = await specializationService.getSpecializations({
    specializationFilter: filter,
    pagination,
    sort,
  });

  res.status(200).send({ status: 'success', message: 'Specializations retrieved successfully', data: result });
});

/**
 * Get specialization by ID
 */
export const getSpecializationById = asyncHandler<GetSpecializationByIdResponseDTO, GetSpecializationByIdRequestDTO, GetSpecializationByIdQueryDTO, GetSpecializationByIdParamsDTO>(async (req, res) => {
  const id = req.parsed!.params!.specializationId;
  const specialization = await specializationService.getSpecializationById({ id });

  res.status(200).send({ status: 'success', message: 'Specialization retrieved successfully', data: { specialization } });
});

/**
 * Get sub-specializations by parent ID with pagination
 */
export const getSubSpecializations = asyncHandler<GetSubSpecializationsResponseDTO, GetSubSpecializationsRequestDTO, GetSubSpecializationsQueryDTO, GetSubSpecializationsParamsDTO>(async (req, res) => {
  const { filter, pagination, sort } = parseQuery(req.parsed!.query!);
  const parentId = req.parsed!.params!.specializationId;

  const result = await specializationService.getSubSpecializations({
    parentId,
    filter,
    pagination,
    sort,
  });

  res.status(200).send({ status: 'success', message: 'Sub-specializations retrieved successfully', data: result });
});

/**
 * Create a new specialization (Admin only)
 */
export const createSpecialization = asyncHandler<CreateSpecializationResponseDTO, CreateSpecializationRequestDTO, CreateSpecializationQueryDTO, CreateSpecializationParamsDTO>(async (req, res) => {
  const { name, nameAr, category } = req.parsed!.body!;

  const specialization = await specializationService.createSpecialization({
    input: { name, nameAr, category },
  });

  res.status(201).send({ status: 'success', message: 'Specialization created successfully', data: { specialization } });
});

/**
 * Update specialization (Admin only)
 */
export const updateSpecialization = asyncHandler<UpdateSpecializationResponseDTO, UpdateSpecializationRequestDTO, UpdateSpecializationQueryDTO, UpdateSpecializationParamsDTO>(async (req, res) => {
  const { name, nameAr, category } = req.parsed!.body!;
  const id = req.parsed!.params!.specializationId;

  const specialization = await specializationService.updateSpecialization({
    id,
    input: { name, nameAr, category },
  });

  res.status(200).send({ status: 'success', message: 'Specialization updated successfully', data: { specialization } });
});

/**
 * Delete specialization (Admin only)
 */
export const deleteSpecialization = asyncHandler<DeleteSpecializationResponseDTO, DeleteSpecializationRequestDTO, DeleteSpecializationQueryDTO, DeleteSpecializationParamsDTO>(async (req, res) => {
  const id = req.parsed!.params!.specializationId;

  await specializationService.deleteSpecialization({ id });

  res.status(200).send({ status: 'success', message: 'Specialization deleted successfully', data: null });
});

/**
 * Create a new sub-specialization (Admin only)
 */
export const createSubSpecialization = asyncHandler<CreateSubSpecializationResponseDTO, CreateSubSpecializationRequestDTO, CreateSubSpecializationQueryDTO, CreateSubSpecializationParamsDTO>(async (req, res) => {
  const { name, nameAr } = req.parsed!.body!;
  const id = req.parsed!.params!.specializationId;

  const subSpecialization = await specializationService.createSubSpecialization({
    parentId: id,
    input: { name, nameAr },
  });

  res.status(201).send({ status: 'success', message: 'Sub-specialization created successfully', data: { subSpecialization } });
});

/**
 * Delete sub-specialization (Admin only)
 */
export const deleteSubSpecialization = asyncHandler<DeleteSubSpecializationResponseDTO, DeleteSubSpecializationRequestDTO, DeleteSubSpecializationQueryDTO, DeleteSubSpecializationParamsDTO>(async (req, res) => {
  const subId = req.parsed!.params!.subSpecializationId;
  const id = req.parsed!.params!.specializationId;

  await specializationService.deleteSubSpecialization({ parentId: id, subId });

  res.status(200).send({ status: 'success', message: 'Sub-specialization deleted successfully', data: null });
});
