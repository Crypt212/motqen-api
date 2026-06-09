/**
 * @fileoverview Dashboard Controller - Handle dashboard HTTP requests
 * @module controllers/DashboardController
 */

import AppError from '../errors/AppError.js';
import {
  DashboardUserResponseDTO,
  DashboardUpdateUserResponseDTO,
  DashboardClientProfileResponseDTO,
  DashboardWorkerProfileResponseDTO,
  DashboardClientProfileWithTokensResponseDTO,
  DashboardWorkerProfileWithTokensResponseDTO,
  DashboardLocationsResponseDTO,
  DashboardLocationResponseDTO,
  WorkGovernmentsResponseDTO,
  WorkingHoursResponseDTO,
  SpecializationsWithSubSpecializationsResponseDTO,
  SpecializationIdsResponseDTO,
  PortfolioWithImagesResponseDTO,
  ImagesResponseDTO,
  OccupiedTimeSlotsResponseDTO,
  DashboardWorkerOrdersStatisticsResponseDTO,
} from '../schemas/responses/dashboard.response.js';
import {
  UpdateUserDTO,
  CreateClientProfileDTO,
  // UpdateClientProfileDTO,
  SetWorkingHoursDTO,
  AddLocationDTO,
  UpdateLocationDTO,
  AddWorkerGovernmentsDTO,
  DeleteWorkerGovernmentsDTO,
  AddWorkerSpecializationsDTO,
  DeleteWorkerSpecializationsDTO,
  WorkerGovernmentQuery,
  WorkerSpecializationQuery,
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
  RemoveDaysWorkingHoursDTO,
} from '../schemas/requests/dashboard.request.js';
import {
  CreateWorkerProfileDTO,
  UpdateWorkerProfileDTO,
} from '../schemas/requests/worker-profile.request.js';
import { clientProfileService, authService, userService, workerProfileService } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQueryParams } from '../schemas/common.js';
import {
  WorkerGovernmentFilterSchema,
  WorkerSpecializationFilterSchema,
} from '../schemas/requests/dashboard.request.js';
import { LoggedInUser } from 'src/domain/user.entity.js';

export const getUser = asyncHandler<DashboardUserResponseDTO, any, any>(async (req, res) => {
  const userId = req.userState.userId;
  const user = await userService.get({ filter: { id: userId, phoneNumber: undefined } });

  let isClient = false;
  let isWorker = false;

  if (req.userState.client) isClient = true;
  if (req.userState.worker) isWorker = true;

  const loggedInUser: LoggedInUser = { ...user, isClient, isWorker };

  res.status(200).send({ status: 'success', message: 'User retrieved successfully', data: { user: loggedInUser } });
});

export const updateUser = asyncHandler<DashboardUpdateUserResponseDTO, UpdateUserDTO, any>(async (req, res) => {
  const { firstName, middleName, lastName } = req.parsed!.body!;
  const userId = req.userState.userId;
  const image = req.file;

  // If phoneNumber is provided, update user's phone (need additional verification)
  // For now, update other fields only
  const updatedUser = await userService.update({
    filter: { id: userId },
    data: {
      firstName,
      middleName,
      lastName,
      profileImageBuffer: image?.buffer,
    },
  });

  res.status(200).send({ status: 'success', message: 'updated user successfully', data: { user: updatedUser } });
});

export const createClientProfile = asyncHandler<DashboardClientProfileWithTokensResponseDTO, CreateClientProfileDTO, any>(async (req, res) => {
  const userId = req.userState.userId;
  const phoneNumber = req.userState.phoneNumber;
  const deviceId = req.deviceId;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const clientProfile = await clientProfileService.create({
    userId,
    data: {},
  });

  await authService.logout({ userId, deviceId });

  const { unHashedRefreshToken: refreshToken } = await authService.login({ phoneNumber, deviceId, expiresAt });

  const accessToken = await authService.generateAccessToken({
    deviceId,
    userId,
    isAdmin: req.adminState !== undefined,
    refreshToken,
  });


  res.status(200).send({
    status: 'success',
    message: 'created client profile successfully',
    data: { clientProfile, accessToken, refreshToken },
  });
});

// It does not have updatable data currently
// export const updateClientProfile = asyncHandler<DashboardClientProfileResponseDTO, UpdateClientProfileDTO, any>(async (req, res) => {
//   const clientProfileId = req.userState.client.id;
//   const body = req.parsed!.body!;
//
//   const clientProfile = await clientProfileService.update({
//     filter: { id: clientProfileId },
//     data: body,
//   });
//
//   res.status(200).send({ status: 'success', message: 'updated client profile successfully', data: { clientProfile } });
// });

export const getClientProfile = asyncHandler<DashboardClientProfileResponseDTO, any, any>(async (req, res) => {
  const userId = req.userState.userId;

  const clientProfile = await clientProfileService.get({ userId });

  res.status(200).send({ status: 'success', message: 'retrieved client profile successfully', data: { clientProfile } });
});

export const createWorkerProfile = asyncHandler<DashboardWorkerProfileWithTokensResponseDTO, CreateWorkerProfileDTO, any>(async (req, res) => {
  const {
    workerProfile: requestBodyWorkerProfile  } = req.parsed!.body!;
  const userId = req.userState.userId;
  const images = req.files as { [fieldname: string]: Express.Multer.File[] };
  const phoneNumber = req.userState.phoneNumber;
  const deviceId = req.deviceId;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (
    !images ||
    !images['personal_image'] ||
    !images['id_image'] ||
    !images['personal_with_id_image']
  )
    throw new AppError('Please upload all required images', 400);

  const workerProfileBody = {
    ...requestBodyWorkerProfile,
    idImageBuffer: images['id_image'][0].buffer,
    profileWithIdImageBuffer: images['personal_with_id_image'][0].buffer,
    profileImageBuffer: images['personal_image'][0].buffer,
    governmentIds: requestBodyWorkerProfile.workGovernmentIds,
  }

  const workerProfile = await workerProfileService.create({
    userId,
    workerProfile: workerProfileBody,
  });

  await authService.logout({ userId, deviceId });

  const { unHashedRefreshToken: refreshToken } = await authService.login({ phoneNumber, deviceId, expiresAt });

  const accessToken = await authService.generateAccessToken({
    deviceId,
    userId,
    isAdmin: req.adminState !== undefined,
    refreshToken,
  });

  res.status(200).send({
    status: 'success',
    message: 'created worker profile successfully',
    data: { workerProfile, accessToken, refreshToken },
  });
});

export const getWorkerOrdersCount = asyncHandler<DashboardWorkerOrdersStatisticsResponseDTO>(async (req, res) => {
  const workerProfileId = req.userState.worker?.id;

  const ordersCounts = await workerProfileService.getOrdersStatistics({ workerProfileId });

  res.status(200).send({ status: 'success', message: 'Worker orders count retrieved successfully', data: { ordersCounts } });
});

export const getWorkerProfile = asyncHandler<DashboardWorkerProfileResponseDTO, any, any>(async (req, res) => {
  const userId = req.userState.userId;

  const workerProfile = await workerProfileService.get({ filter: { userId } });

  res.status(200).send({ status: 'success', message: 'retrieved worker profile successfully', data: { workerProfile } });
});

export const getWorkerWorkingHours = asyncHandler<WorkingHoursResponseDTO, any, any>(async (req, res) => {
  const userId = req.userState?.userId || String(req.parsed!.params!.id);
  const workingHours = await workerProfileService.getMyWorkingHours({ userId });

  res.status(200).send({ status: 'success', message: 'retrieved worker working hours successfully', data: { workingHours } });
});

export const addDaysWorkerWorkingHours = asyncHandler<WorkingHoursResponseDTO, SetWorkingHoursDTO, any>(async (req, res) => {
  const workerProfileId = req.userState.worker.id;
  const { schedules: daysWorkingHours } = req.parsed!.body!;

  const workingHours = await workerProfileService.addDaysWorkingHours({
    workerProfileId,
    daysWorkingHours
  });

  res.status(200).send({ status: 'success', message: 'Days working hours added successfully', data: { workingHours } });
});


export const removeWorkerWorkingHours = asyncHandler<any, RemoveDaysWorkingHoursDTO>(async (req, res) => {
  const workerProfileId = req.userState.worker.id;
  const { days } = req.parsed!.body!;

  await workerProfileService.removeDaysWorkingHours({
    workerProfileId,
    days
  });

  res.status(200).send({ status: 'success', message: 'Days working hours removed successfully', data: null });
});

export const updateWorkerProfile = asyncHandler<DashboardWorkerProfileResponseDTO, UpdateWorkerProfileDTO, any>(async (req, res) => {
  const requestBodyWorkerProfile = req.parsed!.body!;

  const workerProfileBody = {
    ...requestBodyWorkerProfile,
    governmentIds: requestBodyWorkerProfile.workGovernmentIds,
  }

  const workerProfile = await workerProfileService.update({
    workerProfileId: req.userState.worker.id,
    data: workerProfileBody,
  });

  res.status(200).send({ status: 'success', message: 'updated worker profile successfully', data: { workerProfile } });
});

export const getWorkerGovernments = asyncHandler<WorkGovernmentsResponseDTO, any, WorkerGovernmentQuery>(async (req, res) => {
  const { filter, pagination } = parseQueryParams(req.parsed!.query!, WorkerGovernmentFilterSchema);

  const result = await workerProfileService.getWorkGovernments({
    workerProfileFilter: { id: req.userState.worker.id },
    governmentFilter: filter,
    pagination,
  });

  res.status(200).send({ status: 'success', message: 'retrieved worker working governments successfully', data: result });
});

export const addWorkerGovernments = asyncHandler<any, AddWorkerGovernmentsDTO, any>(async (req, res) => {
  const { workGovernments } = req.parsed!.body!;

  await workerProfileService.insertWorkGovernments({
    filter: { id: req.userState.worker.id },
    governmentIds: workGovernments,
  });

  res.status(200).send({
    status: 'success',
    message: 'added worker working governments successfully',
    data: null,
  });
});

export const deleteWorkerGovernments = asyncHandler<any, DeleteWorkerGovernmentsDTO, any>(async (req, res) => {
  const { workGovernments: governmentIds } = req.parsed!.body!;
  const all = req.parsed!.query!.all === 'true';

  if (all)
    await workerProfileService.deleteAllWorkGovernments({
      filter: { id: req.userState.worker.id },
    });
  else if (governmentIds)
    await workerProfileService.deleteWorkGovernments({
      filter: { id: req.userState.worker.id },
      governmentIds,
    });

  res.status(200).send({ status: 'success', message: 'deleted worker working governments successfully', data: null });
});

export const getWorkerSpecializationsTree = asyncHandler<SpecializationsWithSubSpecializationsResponseDTO, any, WorkerSpecializationQuery>(async (req, res) => {
  const workerUserId = req.userState?.userId || String(req.parsed!.params!.id);

  const result = await workerProfileService.getSpecializationsTree({
    filter: { userId: workerUserId },
  });

  res.status(200).send({ status: 'success', message: 'retrieved worker specialization tree successfully', data: result });
});

export const getWorkerSpecializations = asyncHandler<SpecializationIdsResponseDTO, any, WorkerSpecializationQuery>(async (req, res) => {
  const { specializationIds } = req.parsed!.body!;
  const { pagination } = parseQueryParams(req.parsed!.query!, WorkerSpecializationFilterSchema);

  const result = await workerProfileService.getSpecializations({
    filter: { id: req.userState.worker.id },
    pagination,
    mainSpecializationIds: specializationIds,
  });

  res.status(200).send({ status: 'success', message: 'retrieved worker specialization tree successfully', data: result });
});

export const addWorkerSpecializations = asyncHandler<any, AddWorkerSpecializationsDTO, any>(async (req, res) => {
  const { specializationsTree } = req.parsed!.body!;

  await workerProfileService.addSpecializations({
    filter: { id: req.userState.worker.id },
    specializationsTree,
  });

  res.status(200).send({ status: 'success', message: 'added worker specializations successfully', data: null });
});

/**
 */
export const deleteWorkerSpecializations = asyncHandler<any, DeleteWorkerSpecializationsDTO, any>(async (req, res) => {
  const { mainSpecializationIds, specializationsTree } = req.parsed!.body!;
  const all = req.parsed!.query!.all === 'true';

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

  res.status(200).send({ status: 'success', message: 'deleted worker specializations successfully', data: null });
});

// ============================================
// Locations endpoints
// ============================================

export const getUserLocations = asyncHandler<DashboardLocationsResponseDTO, any, any>(async (req, res) => {
  const userId = req.userState.userId;
  const locations = await userService.getLocations({ filter: { userId } });
  res.status(200).send({ status: 'success', message: 'retrieved user locations successfully', data: { locations } });
});

export const addUserLocation = asyncHandler<DashboardLocationResponseDTO, AddLocationDTO, any>(async (req, res) => {
  const userId = req.userState.userId;
  const { governmentId, cityId, address, addressNotes, isMain, long, lat } = req.parsed!.body!;
  const location = await userService.addLocation({
    userId,
    location: { governmentId, cityId, address, addressNotes, isMain, long, lat },
  });
  res.status(201).send({ status: 'success', message: 'added location successfully', data: { location } });
});

export const updateUserLocation = asyncHandler<DashboardLocationResponseDTO, UpdateLocationDTO, any>(async (req, res) => {
  const userId = req.userState.userId;
  const locationId = req.parsed!.params!.locationId as string;
  const locationUpdate = req.parsed!.body!;
  const location = await userService.updateLocation({
    filter: { id: locationId, userId },
    location: locationUpdate,
  });
  res.status(200).send({ status: 'success', message: 'updated location successfully', data: { location } });
});

export const deleteUserLocation = asyncHandler<any>(async (req, res) => {
  const userId = req.userState.userId;
  const locationId = req.parsed!.params!.locationId as string;
  await userService.deleteLocation({ filter: { id: locationId, userId } });
  res.status(200).send({ status: 'success', message: 'deleted location successfully', data: null });
});

export const getVerification = asyncHandler<any>(async (req, res) => {
  const userId = req.userState.userId;
  const verification = await workerProfileService.getVerification({ filter: { userId } });
  if (!verification) throw new AppError('Verification not found', 404);
  res.status(200).send({ status: 'success', message: 'Verification status retrieved', data: { verification } });
});

export const resubmitVerification = asyncHandler<any>(async (req, res) => {
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

  res.status(200).send({ status: 'success', message: 'Verification documents resubmitted', data: { verification } });
});

export const createPortfolio = asyncHandler<PortfolioWithImagesResponseDTO, CreatePortfolioDTO, any>(async (req, res) => {
  const userId = req.userState.userId;
  const { description } = req.parsed!.body!;
  const portfolio = await workerProfileService.createPortfolio({ userId, description });
  res.status(201).send({ status: 'success', message: 'Portfolio created', data: { portfolio } });
});

export const getPortfolio = asyncHandler<PortfolioWithImagesResponseDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const portfolio = await workerProfileService.getPortfolio({ userId });
  res.status(200).send({ status: 'success', message: 'Portfolio retrieved', data: { portfolio } });
});

export const updatePortfolio = asyncHandler<PortfolioWithImagesResponseDTO, UpdatePortfolioDTO, any>(async (req, res) => {
  const userId = req.userState.userId;
  const { description } = req.parsed!.body!;
  const portfolio = await workerProfileService.updatePortfolio({ userId, description });
  res.status(200).send({ status: 'success', message: 'Portfolio updated', data: { portfolio } });
});

export const addPortfolioImages = asyncHandler<ImagesResponseDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new AppError('No images provided', 400);
  }
  const images = await workerProfileService.addPortfolioImages({ userId, files });
  res.status(201).send({ status: 'success', message: 'Images uploaded', data: { images } });
});

export const deletePortfolioImage = asyncHandler<any>(async (req, res) => {
  const userId = req.userState.userId;
  const imageId = req.parsed!.params!.imageId as string;
  await workerProfileService.deletePortfolioImage({ userId, imageId });
  res.status(200).send({ status: 'success', message: 'Image deleted', data: null });
});

export const getWorkerOccupiedTimeSlots = asyncHandler<OccupiedTimeSlotsResponseDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const selectedDate = req.parsed!.query!.selectedDate as string;
  const occupiedSlots = await workerProfileService.getWorkerOccupiedTimeSlots({ userId, selectedDate });
  res.status(200).send({ status: 'success', message: 'Occupied time slots retrieved', data: { occupiedSlots } });
});
