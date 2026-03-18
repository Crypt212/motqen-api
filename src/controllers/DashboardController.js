/**
 * @fileoverview Dashboard Controller - Handle dashboard HTTP requests
 * @module controllers/DashboardController
 */

import { matchedData } from 'express-validator';
import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import { clientService, userService, workerService } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { handleManyQuery } from '../utils/handleFilteration.js';

/**
 */
export const getUser = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const user = await userService.get({ userId, phoneNumber: undefined });

  new SuccessResponse('User retrieved successfully', { user }, 200).send(res);
});

/**
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { firstName, middleName, lastName, bio } = matchedData(req, {
    includeOptionals: true,
  });
  const userId = req.userState.userId;
  const image = req.file;

  // If phoneNumber is provided, update user's phone (need additional verification)
  // For now, update other fields only
  await userService.update({
    userId,
    data: {
      firstName,
      middleName,
      lastName,
      bio,
      profileImageBuffer: image.buffer,
    },
  });

  new SuccessResponse('updated user successfully', {}, 200).send(res);
});

/**
 */
export const createClientProfile = asyncHandler(async (req, res) => {
  const { address, addressNotes, governmentId, cityId } = matchedData(req, {
    includeOptionals: true,
  });
  const userId = req.userState.userId;

  const clientProfile = await clientService.create({
    userId,
    data: {
      governmentId,
      cityId,
      address,
      addressNotes,
    },
  });

  new SuccessResponse(
    'created client profile successfully',
    { clientProfile },
    200
  ).send(res);
});

/**
 */
export const updateClientProfile = asyncHandler(async (req, res) => {
  const { address, addressNotes } = matchedData(req, {
    includeOptionals: true,
  });
  const clientProfileId = req.userState.client.id;

  const clientProfile = await clientService.update({
    clientProfileId,
    data: { address, addressNotes },
  });

  new SuccessResponse(
    'updated client profile successfully',
    { clientProfile },
    200
  ).send(res);
});

/**
 */
export const deleteClientProfile = asyncHandler(async (req, res) => {
  const { } = matchedData(req, { includeOptionals: true });

  const clientProfile = await clientService.delete({
    clientProfileId: req.userState.client.id,
  });

  new SuccessResponse(
    'updated client profile successfully',
    { clientProfile },
    200
  ).send(res);
});

/**
 */
export const getClientProfile = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;

  const clientProfile = await clientService.get({ userId });

  new SuccessResponse(
    'retrieved client profile successfully',
    { clientProfile },
    200
  ).send(res);
});

/**
 */
export const createWorkerProfile = asyncHandler(async (req, res) => {
  const {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    specializationsTree: specializationsTree,
    workGovernmentIds,
  } = matchedData(req, { includeOptionals: true });
  const userId = req.userState.userId;
  const images = req.files;

  if (
    !images ||
    !images['personal_image'] ||
    !images['id_image'] ||
    !images['personal_with_id_image']
  )
    throw new AppError('Please upload all required images', 400);

  const workerProfile = await workerService.create(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    specializationsTree,
    governmentIds: workGovernmentIds,
    idImageBuffer: images['id_image'].buffer,
    profileWithIdImageBuffer: images['personal_with_id_image'].buffer,
    profileImageBuffer: images['personal_image'].buffer,
  });

  new SuccessResponse(
    'created worker profile successfully',
    { workerProfile },
    200
  ).send(res);
});

/**
 */
export const getWorkerProfile = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;

  const workerProfile = await workerService.get({ userId });

  new SuccessResponse(
    'retrieved worker profile successfully',
    { workerProfile },
    200
  ).send(res);
});

/**
 */
export const updateWorkerProfile = asyncHandler(async (req, res) => {
  const { experienceYears, isInTeam, acceptsUrgentJobs } = matchedData(req, {
    includeOptionals: true,
  });

  const workerProfile = await workerService.update({
    workerProfileId: req.userState.worker.id,
    data: {
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
    },
  });

  new SuccessResponse(
    'updated worker profile successfully',
    { workerProfile },
    200
  ).send(res);
});

/**
 */
export const deleteWorkerProfile = asyncHandler(async (req, res) => {
  const { } = matchedData(req, { includeOptionals: true });

  const workerProfile = await workerService.delete({
    workerProfileId: req.userState.worker.id,
  });

  new SuccessResponse(
    'deleted worker profile successfully',
    { workerProfile },
    200
  ).send(res);
});

/**
 */
export const getWorkerGovernments = asyncHandler(async (req, res) => {
  const { filter, sortBy, sortOrder, page, limit } = matchedData(req, { includeOptionals: true });

  const { finalFilter, paginationResult } = await handleManyQuery({ filter, sortBy, sortOrder, page, limit, modelName: "government" });

  const result = await workerService.getWorkGovernments({
    userId: req.userState.userId,
    filter: finalFilter,
  });

  new SuccessResponse(
    'retrieved worker working governments successfully',
    { governments: result, pagination: paginationResult },
    200
  ).send(res);
});

/**
 */
export const addWorkerGovernments = asyncHandler(async (req, res) => {
  const { governmentIds } = matchedData(req, { includeOptionals: true });

  const addedGovernmentsCount = await workerService.addWorkGovernments({
    workerProfileId: req.userState.worker.id,
    governmentIds,
  });

  new SuccessResponse(
    'added worker working governments successfully',
    { addedGovernmentsCount },
    200
  ).send(res);
});

/**
 */
export const deleteWorkerGovernments = asyncHandler(async (req, res) => {
  const { governmentIds, all } = matchedData(req, { includeOptionals: true });

  let deletedGovernmentsCount = 0;
  if (all)
    deletedGovernmentsCount = (await workerService.deleteWorkGovernments({
      workerProfileId: req.userState.worker.id,
      governmentIds,
    })).count;
  else if (governmentIds)
    deletedGovernmentsCount = (await workerService.deleteWorkGovernments({
      workerProfileId: req.userState.worker.id,
      governmentIds,
    })).count;

  new SuccessResponse(
    'deleted worker working governments successfully',
    { deletedGovernmentsCount },
    200
  ).send(res);
});

/**
 */
export const getWorkerSpecializations = asyncHandler(async (req, res) => {
  const { specializationIds, page, limit, sortBy, sortOrder, filter } = matchedData(req, { includeOptionals: true, });
  const { finalFilter, paginationResult } = await handleManyQuery({ filter, sortBy, sortOrder, page, limit, modelName: "specialization" });

  const result = await workerService.getSpecializations({
    mainSpecializationIds: specializationIds,
    userId: req.userState.userId,
    filter: finalFilter,
  });

  new SuccessResponse(
    'retrieved worker specialization tree successfully',
    { specializationsTree: result, pagination: paginationResult },
    200
  ).send(res);
});

/**
 */
export const addWorkerSpecializations = asyncHandler(async (req, res) => {
  const { specializationsTree } = matchedData(req, { includeOptionals: true });

  const addedSpecializationsCount = await workerService.addSpecializations({
    workerProfileId: req.userState.worker.id,
    specializationsTree,
  });

  new SuccessResponse(
    'added worker specializations successfully',
    { addedSpecializationsCount },
    200
  ).send(res);
});

/**
 */
export const deleteWorkerSpecializations = asyncHandler(async (req, res) => {
  const { mainSpecializationIds, specializationsTree, all } = matchedData(req, {
    includeOptionals: true,
  });

  let deletedSpecializationsCount = 0;
  if (all)
    deletedSpecializationsCount = (await workerService.deleteSpecializations({
      userId: req.userState.userId,
      mainSpecializationIds: undefined,
    })).count;
  else {
    if (mainSpecializationIds)
      deletedSpecializationsCount += (await workerService.deleteSpecializations({
        userId: req.userState.userId,
        mainSpecializationIds,
      })).count;

    if (specializationsTree)
      deletedSpecializationsCount +=
        (await workerService.deleteSubSpecializations({
          userId: req.userState.userId,
          specializationsTree,
        })).count;
  }

  new SuccessResponse(
    'deleted worker specializations successfully',
    { deletedSpecializationsCount },
    200
  ).send(res);
});
