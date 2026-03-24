/**
 * @fileoverview Dashboard Controller - Handle dashboard HTTP requests
 * @module controllers/DashboardController
 */

import { matchedData } from 'express-validator';
import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import { clientProfileService, userService, workerProfileService } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';

export const getUser = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const user = await userService.get({ filter: { id: userId, phoneNumber: undefined } });

  new SuccessResponse('User retrieved successfully', { user }, 200).send(res);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { firstName, middleName, lastName } = matchedData(req, {
    includeOptionals: true,
  });
  const userId = req.userState.userId;
  const image = req.file;

  // If phoneNumber is provided, update user's phone (need additional verification)
  // For now, update other fields only
  await userService.update({
    filter: { id: userId },
    data: {
      firstName,
      middleName,
      lastName,
      profileImageBuffer: image.buffer,
    },
  });

  new SuccessResponse('updated user successfully', {}, 200).send(res);
});

export const createClientProfile = asyncHandler(async (req, res) => {
  const { address, addressNotes, governmentId, cityId } = matchedData(req, {
    includeOptionals: true,
  });
  const userId = req.userState.userId;

  const clientProfile = await clientProfileService.create({
    userId,
    data: {
      location: {
        governmentId,
        cityId,
        address,
        addressNotes,
        isMain: true,
      }
    },
  });

  new SuccessResponse(
    'created client profile successfully',
    { clientProfile },
    200
  ).send(res);
});

export const updateClientProfile = asyncHandler(async (req, res) => {
  const { address, addressNotes } = matchedData(req, {
    includeOptionals: true,
  });
  const clientProfileId = req.userState.client.id;

  const clientProfile = await clientProfileService.update({
    filter: { id: clientProfileId },
    data: { location: { address, addressNotes } },
  });

  new SuccessResponse(
    'updated client profile successfully',
    { clientProfile },
    200
  ).send(res);
});

export const deleteClientProfile = asyncHandler(async (req, res) => {
  const clientProfile = await clientProfileService.delete({
    filter: { id: req.userState.client.id }
  });

  new SuccessResponse(
    'updated client profile successfully',
    { clientProfile },
    200
  ).send(res);
});

export const getClientProfile = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;

  const clientProfile = await clientProfileService.get({ userId });

  new SuccessResponse(
    'retrieved client profile successfully',
    { clientProfile },
    200
  ).send(res);
});

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

  const workerProfile = await workerProfileService.create({
    userId, workerProfile: {
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
      specializationsTree,
      governmentIds: workGovernmentIds,
      idImageBuffer: images['id_image'].buffer,
      profileWithIdImageBuffer: images['personal_with_id_image'].buffer,
      profileImageBuffer: images['personal_image'].buffer,
    }
  });

  new SuccessResponse(
    'created worker profile successfully',
    { workerProfile },
    200
  ).send(res);
});

export const getWorkerProfile = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;

  const workerProfile = await workerProfileService.get({ filter: { userId } });

  new SuccessResponse(
    'retrieved worker profile successfully',
    { workerProfile },
    200
  ).send(res);
});

export const updateWorkerProfile = asyncHandler(async (req, res) => {
  const { experienceYears, isInTeam, acceptsUrgentJobs } = matchedData(req, {
    includeOptionals: true,
  });

  const workerProfile = await workerProfileService.update({
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

export const deleteWorkerProfile = asyncHandler(async (req, res) => {
  const workerProfile = await workerProfileService.delete({
    workerProfileId: req.userState.worker.id,
  });

  new SuccessResponse(
    'deleted worker profile successfully',
    { workerProfile },
    200
  ).send(res);
});

export const getWorkerGovernments = asyncHandler(async (req, res) => {
  const { filter, page, limit } = matchedData(req, { includeOptionals: true });

  const result = await workerProfileService.getWorkGovernments({
    filter: { id: req.userState.worker.id },
    GovernmentFilter: filter,
    pagination: { page, limit },
  });

  new SuccessResponse(
    'retrieved worker working governments successfully',
    result,
    200
  ).send(res);
});

export const addWorkerGovernments = asyncHandler(async (req, res) => {
  const { governmentIds } = matchedData(req, { includeOptionals: true });

  const addedGovernmentsCount = await workerProfileService.insertWorkGovernments({
    filter: { id: req.userState.worker.id },
    governmentIds,
  });

  new SuccessResponse(
    'added worker working governments successfully',
    { addedGovernmentsCount },
    200
  ).send(res);
});

export const deleteWorkerGovernments = asyncHandler(async (req, res) => {
  const { governmentIds, all } = matchedData(req, { includeOptionals: true });

  if (all)
    await workerProfileService.deleteAllWorkGovernments({
      filter: { workerProfileId: req.userState.worker.id },
    });
  else if (governmentIds)
    await workerProfileService.deleteWorkGovernments({
      filter: { workerProfileId: req.userState.worker.id },
      governmentIds,
    });

  new SuccessResponse(
    'deleted worker working governments successfully',
    200
  ).send(res);
});

export const getWorkerSpecializations = asyncHandler(async (req, res) => {
  const { specializationIds, page, limit } = matchedData(req, { includeOptionals: true, });

  const result = await workerProfileService.getSpecializations({
    filter: { id: req.userState.worker.id },
    pagination: { page, limit },
    mainSpecializationIds: specializationIds,
  });

  new SuccessResponse(
    'retrieved worker specialization tree successfully',
    result,
    200
  ).send(res);
});

/**
 */
export const addWorkerSpecializations = asyncHandler(async (req, res) => {
  const { specializationsTree } = matchedData(req, { includeOptionals: true });

  await workerProfileService.addSpecializations({
    filter: { workerProfileId: req.userState.worker.id },
    specializationsTree,
  });

  new SuccessResponse(
    'added worker specializations successfully',
    200
  ).send(res);
});

/**
 */
export const deleteWorkerSpecializations = asyncHandler(async (req, res) => {
  const { mainSpecializationIds, specializationsTree, all } = matchedData(req, {
    includeOptionals: true,
  });

  if (all)
    await workerProfileService.deleteAllSpecializations({
      userId: req.userState.userId,
    });
  else {
    if (mainSpecializationIds)
      await workerProfileService.deleteSpecializations({
        userId: req.userState.userId,
        mainSpecializationIds,
      });

    if (specializationsTree)
      await workerProfileService.deleteSubSpecializations({
        userId: req.userState.userId,
        specializationsTree,
      });
  }

  new SuccessResponse(
    'deleted worker specializations successfully',
    200
  ).send(res);
});
