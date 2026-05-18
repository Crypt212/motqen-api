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
} from '../schemas/requests/dashboard.request.js';

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

  const clientProfile = await clientProfileService.update({
    filter: { id: clientProfileId },
    data: {},
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

export const getWorkerWorkingHours = asyncHandler(async (req, res) => {
  const userId = req.userState?.userId || String(req.params.id);
  const workingHours = await workerProfileService.getMyWorkingHours({ userId });

  new SuccessResponse('retrieved worker working hours successfully', { workingHours }, 200).send(res);
});

export const addDaysWorkerWorkingHours = asyncHandler(async (req, res) => {
  const workerProfileId = req.userState.worker.id;
  const { schedules: daysWorkingHours } = req.body;

  const workingHours = await workerProfileService.addDaysWorkingHours({
    workerProfileId,
    daysWorkingHours
  });

  new SuccessResponse('Days working hours added successfully', { workingHours }, 200).send(res);
});


export const removeWorkerWorkingHours = asyncHandler(async (req, res) => {
  const workerProfileId = req.userState.worker.id;
  const { days } = req.body;

  await workerProfileService.removeDaysWorkingHours({
    workerProfileId,
    days
  });

  new SuccessResponse('Days working hours removed successfully', null, 200).send(res);
});

export const updateWorkerProfile = asyncHandler(async (req, res) => {
  const { experienceYears, isInTeam, acceptsUrgentJobs, bio } = req.body;
  const workerProfile = await workerProfileService.update({
    workerProfileId: req.userState.worker.id,
    data: {
      experienceYears,
      isInTeam,
      acceptsUrgentJobs,
      bio,
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
  const { workGovernments } = req.body;

  const addedGovernmentsCount = await workerProfileService.insertWorkGovernments({
    filter: { id: req.userState.worker.id },
    governmentIds: workGovernments,
  });

  new SuccessResponse(
    'added worker working governments successfully',
    { addedGovernmentsCount },
    200
  ).send(res);
});

export const deleteWorkerGovernments = asyncHandler(async (req, res) => {
  const { workGovernments: governmentIds } = req.body;
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

export const getWorkerSpecializationsTree = asyncHandler(async (req, res) => {
  const workerUserId = req.userState?.userId || String(req.params.id);

  const result = await workerProfileService.getSpecializationsTree({
    filter: { userId: workerUserId },
  });

  new SuccessResponse('retrieved worker specialization tree successfully', result, 200).send(res);
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
  const locations = await userService.getLocations({ filter: { userId } });
  new SuccessResponse('retrieved user locations successfully', { locations }, 200).send(res);
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

export const getVerification = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const verification = await workerProfileService.getVerification({ filter: { userId } });
  if (!verification) throw new AppError('Verification not found', 404);
  new SuccessResponse('Verification status retrieved', { verification }, 200).send(res);
});

export const resubmitVerification = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  if (!files || !files.id_image || !files.personal_with_id_image) {
    throw new AppError('Missing required files', 400);
  }
  const idImageBuffer = files.id_image[0].buffer;
  const profileWithIdImageBuffer = files.personal_with_id_image[0].buffer;

  const verification = await workerProfileService.resubmitVerification({
    userId,
    idImageBuffer,
    profileWithIdImageBuffer,
  });

  new SuccessResponse('Verification documents resubmitted', { verification }, 200).send(res);
});

export const createPortfolio = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const { description } = req.body;
  const portfolio = await workerProfileService.createPortfolio({ userId, description });
  new SuccessResponse('Portfolio created', { portfolio }, 201).send(res);
});

export const getPortfolio = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const portfolio = await workerProfileService.getPortfolio({ userId });
  new SuccessResponse('Portfolio retrieved', { portfolio }, 200).send(res);
});

export const updatePortfolio = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const { description } = req.body;
  const portfolio = await workerProfileService.updatePortfolio({ userId, description });
  new SuccessResponse('Portfolio updated', { portfolio }, 200).send(res);
});

export const addPortfolioImages = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new AppError('No images provided', 400);
  }
  const images = await workerProfileService.addPortfolioImages({ userId, files });
  new SuccessResponse('Images uploaded', { images }, 201).send(res);
});

export const deletePortfolioImage = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const imageId = req.params.imageId as string;
  await workerProfileService.deletePortfolioImage({ userId, imageId });
  new SuccessResponse('Image deleted', null, 200).send(res);
});

export const getWorkerOccupiedTimeSlots = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const selectedDate = req.query.selectedDate as string;
  const occupiedSlots = await workerProfileService.getWorkerOccupiedTimeSlots({ userId, selectedDate });
  new SuccessResponse('Occupied time slots retrieved', { occupiedSlots }, 200).send(res);
});
