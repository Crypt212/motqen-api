/**
 * @fileoverview Dashboard Controller - Handle dashboard HTTP requests
 * @module controllers/DashboardController
 */

import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import { clientProfileService, userService, workerProfileService } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQueryParams } from '../schemas/common.js';
import {
  WorkerGovernmentFilterSchema,
  WorkerSpecializationFilterSchema,
} from '../schemas/dashboard.js';
import { buildFilterSchema } from '../schemas/common.js';

export const getUser = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const user = await userService.get({ filter: { id: userId, phoneNumber: undefined } });

  new SuccessResponse('User retrieved successfully', { user }, 200).send(res);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { firstName, middleName, lastName } = req.body;
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
  const userId = req.userState.userId;

  const clientProfile = await clientProfileService.create({
    userId,
    data: {},
  });

  new SuccessResponse('created client profile successfully', { clientProfile }, 200).send(res);
});

export const updateClientProfile = asyncHandler(async (req, res) => {
  const clientProfileId = req.userState.client.id;
  const userId = req.userState.userId;

  const clientProfile = await clientProfileService.update({
    filter: { id: clientProfileId },
    data: {},
    userId,
  });

  new SuccessResponse('updated client profile successfully', { clientProfile }, 200).send(res);
});

export const deleteClientProfile = asyncHandler(async (req, res) => {
  const clientProfile = await clientProfileService.delete({
    filter: { id: req.userState.client.id },
  });

  new SuccessResponse('updated client profile successfully', { clientProfile }, 200).send(res);
});

export const getClientProfile = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;

  const clientProfile = await clientProfileService.get({ userId });

  new SuccessResponse('retrieved client profile successfully', { clientProfile }, 200).send(res);
});

export const createWorkerProfile = asyncHandler(async (req, res) => {
  const {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    specializationsTree: specializationsTree,
    workGovernmentIds,
  } = req.body;
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
    userId,
    workerProfile: {
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
      specializationsTree,
      governmentIds: workGovernmentIds,
      idImageBuffer: images['id_image'].buffer,
      profileWithIdImageBuffer: images['personal_with_id_image'].buffer,
      profileImageBuffer: images['personal_image'].buffer,
    },
  });

  new SuccessResponse('created worker profile successfully', { workerProfile }, 200).send(res);
});

export const getWorkerProfile = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;

  const workerProfile = await workerProfileService.get({ filter: { userId } });

  new SuccessResponse('retrieved worker profile successfully', { workerProfile }, 200).send(res);
});

export const updateWorkerProfile = asyncHandler(async (req, res) => {
  const { experienceYears, isInTeam, acceptsUrgentJobs } = req.body;
  const workerProfile = await workerProfileService.update({
    workerProfileId: req.userState.worker.id,
    data: {
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
    },
  });

  new SuccessResponse('updated worker profile successfully', { workerProfile }, 200).send(res);
});

export const deleteWorkerProfile = asyncHandler(async (req, res) => {
  const workerProfile = await workerProfileService.delete({
    workerProfileId: req.userState.worker.id,
  });

  new SuccessResponse('deleted worker profile successfully', { workerProfile }, 200).send(res);
});

export const getWorkerGovernments = asyncHandler(async (req, res) => {
  const { filter, pagination } = parseQueryParams(req.query, WorkerGovernmentFilterSchema);

  const result = await workerProfileService.getWorkGovernments({
    filter: { id: req.userState.worker.id },
    GovernmentFilter: filter,
    pagination,
  });

  new SuccessResponse('retrieved worker working governments successfully', result, 200).send(res);
});

export const addWorkerGovernments = asyncHandler(async (req, res) => {
  const { governmentIds } = req.body;

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
  const { governmentIds } = req.body;
  const all = req.query.all === 'true';

  if (all)
    await workerProfileService.deleteAllWorkGovernments({
      filter: { id: req.userState.worker.id },
    });
  else if (governmentIds)
    await workerProfileService.deleteWorkGovernments({
      filter: { id: req.userState.worker.id },
      governmentIds,
    });

  new SuccessResponse('deleted worker working governments successfully', null, 200).send(res);
});

export const getWorkerSpecializations = asyncHandler(async (req, res) => {
  const { specializationIds } = req.body;
  const { pagination } = parseQueryParams(req.query, WorkerSpecializationFilterSchema);

  const result = await workerProfileService.getSpecializations({
    filter: { id: req.userState.worker.id },
    pagination,
    mainSpecializationIds: specializationIds,
  });

  new SuccessResponse('retrieved worker specialization tree successfully', result, 200).send(res);
});

/**
 */
export const addWorkerSpecializations = asyncHandler(async (req, res) => {
  const { specializationsTree } = req.body;

  await workerProfileService.addSpecializations({
    filter: { id: req.userState.worker.id },
    specializationsTree,
  });

  new SuccessResponse('added worker specializations successfully', null, 200).send(res);
});

/**
 */
export const deleteWorkerSpecializations = asyncHandler(async (req, res) => {
  const { mainSpecializationIds, specializationsTree } = req.body;
  const all = req.query.all === 'true';

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

  new SuccessResponse('deleted worker specializations successfully', null, 200).send(res);
});

// ============================================
// Locations endpoints
// ============================================

export const getUserLocations = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const { pagination } = parseQueryParams(req.query, buildFilterSchema({}));
  const locationsData = await userService.getLocations({ filter: { userId }, pagination });
  new SuccessResponse('retrieved user locations successfully', locationsData, 200).send(res);
});

export const addUserLocation = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const { governmentId, cityId, address, addressNotes, isMain, long, lat } = req.body;
  const location = await userService.addLocation({
    userId,
    location: { governmentId, cityId, address, addressNotes, isMain, long, lat },
  });
  new SuccessResponse('added location successfully', { location }, 201).send(res);
});

export const updateUserLocation = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const locationId = req.params.locationId as string;
  const locationUpdate = req.body;
  const location = await userService.updateLocation({
    filter: { id: locationId, userId },
    location: locationUpdate,
  });
  new SuccessResponse('updated location successfully', { location }, 200).send(res);
});

export const deleteUserLocation = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const locationId = req.params.locationId as string;
  await userService.deleteLocation({ filter: { id: locationId, userId } });
  new SuccessResponse('deleted location successfully', null, 200).send(res);
});
