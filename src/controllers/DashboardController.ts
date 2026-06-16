/**
 * @fileoverview Dashboard Controller - Handle dashboard HTTP requests
 * @module controllers/DashboardController
 */

import AppError from '../errors/AppError.js';
import {
  GetUserResponseDTO,
  UpdateUserResponseDTO,
  GetClientProfileResponseDTO,
  GetWorkerProfileResponseDTO,
  CreateClientProfileResponseDTO,
  CreateWorkerProfileResponseDTO,
  GetUserLocationsResponseDTO,
  AddUserLocationResponseDTO,
  GetWorkerGovernmentsResponseDTO,
  GetWorkerWorkingHoursResponseDTO,
  GetWorkerSpecializationsTreeResponseDTO,
  GetWorkerSpecializationsResponseDTO,
  AddPortfolioImagesResponseDTO,
  GetWorkerOccupiedTimeSlotsResponseDTO,
  GetWorkerOrdersStatisticsResponseDTO,
  AddWorkerDaysWorkingHoursResponseDTO,
  UpdateWorkerProfileResponseDTO,
  UpdateUserLocationResponseDTO,
  GetVerificationResponseDTO,
  ResubmitVerificationResponseDTO,
  CreatePortfolioResponseDTO,
  GetPortfolioResponseDTO,
  UpdatePortfolioResponseDTO,
  RemoveWorkerWorkingDaysResponseDTO,
  AddWorkerGovernmentsResponseDTO,
  DeleteWorkerGovernmentsResponseDTO,
  AddWorkerSpecializationsResponseDTO,
  DeleteWorkerSpecializationsResponseDTO,
  DeleteUserLocationResponseDTO,
  DeletePortfolioImageResponseDTO,
} from '../schemas/responses/dashboard.response.js';
import {
  GetUserRequestDTO,
  GetUserQueryDTO,
  GetUserParamsDTO,
  GetVerificationRequestDTO,
  GetVerificationQueryDTO,
  GetVerificationParamsDTO,
  ResubmitVerificationRequestDTO,
  ResubmitVerificationQueryDTO,
  ResubmitVerificationParamsDTO,
  UpdateUserRequestDTO,
  UpdateUserQueryDTO,
  UpdateUserParamsDTO,
  GetClientProfileRequestDTO,
  GetClientProfileQueryDTO,
  GetClientProfileParamsDTO,
  CreateClientProfileRequestDTO,
  CreateClientProfileQueryDTO,
  CreateClientProfileParamsDTO,
  // UpdateClientProfileDTO,
  AddUserLocationRequestDTO,
  UpdateUserLocationRequestDTO,
  AddWorkerGovernmentsRequestDTO,
  AddWorkerGovernmentsQueryDTO,
  AddWorkerGovernmentsParamsDTO,
  DeleteWorkerGovernmentsRequestDTO,
  AddWorkerSpecializationsRequestDTO,
  AddWorkerSpecializationsQueryDTO,
  AddWorkerSpecializationsParamsDTO,
  DeleteWorkerSpecializationsRequestDTO,
  GetWorkerGovernmentsRequestDTO,
  GetWorkerGovernmentsQueryDTO,
  GetWorkerGovernmentsParamsDTO,
  GetWorkerSpecializationsTreeRequestDTO,
  GetWorkerSpecializationsTreeQueryDTO,
  CreateWorkerProfileRequestDTO,
  CreateWorkerProfileQueryDTO,
  CreateWorkerProfileParamsDTO,
  UpdateWorkerProfileRequestDTO,
  UpdateWorkerProfileQueryDTO,
  UpdateWorkerProfileParamsDTO,
  CreatePortfolioRequestDTO,
  CreatePortfolioQueryDTO,
  CreatePortfolioParamsDTO,
  GetPortfolioRequestDTO,
  GetPortfolioQueryDTO,
  GetPortfolioParamsDTO,
  UpdatePortfolioRequestDTO,
  UpdatePortfolioQueryDTO,
  UpdatePortfolioParamsDTO,
  AddPortfolioImagesRequestDTO,
  AddPortfolioImagesQueryDTO,
  AddPortfolioImagesParamsDTO,
  RemoveWorkerWorkingDaysRequestDTO,
  RemoveWorkerWorkingDaysQueryDTO,
  RemoveWorkerWorkingDaysParamsDTO,
  AddWorkerDaysWorkingHoursRequestDTO,
  AddWorkerDaysWorkingHoursQueryDTO,
  AddWorkerDaysWorkingHoursParamsDTO,
  GetWorkerSpecializationsRequestDTO,
  GetWorkerSpecializationsQueryDTO,
  GetWorkerSpecializationsParamsDTO,
  DeleteWorkerGovernmentsQueryDTO,
  DeleteWorkerGovernmentsParamsDTO,
  DeleteWorkerSpecializationsQueryDTO,
  DeleteWorkerSpecializationsParamsDTO,
  DeletePortfolioImageParamsDTO,
  DeletePortfolioImageRequestDTO,
  DeletePortfolioImageQueryDTO,
  GetWorkerOccupiedTimeSlotsRequestDTO,
  GetWorkerOccupiedTimeSlotsQueryDTO,
  GetWorkerOccupiedTimeSlotsParamsDTO,
  GetWorkerProfileRequestDTO,
  GetWorkerProfileQueryDTO,
  GetWorkerProfileParamsDTO,
  GetWorkerOrdersStatisticsRequestDTO,
  GetWorkerOrdersStatisticsQueryDTO,
  GetWorkerOrdersStatisticsParamsDTO,
  GetWorkerSpecializationsTreeParamsDTO,
  UpdateUserLocationParamsDTO,
  DeleteUserLocationParamsDTO,
  GetWorkerWorkingHoursParamsDTO,
  GetWorkerWorkingHoursRequestDTO,
  GetWorkerWorkingHoursQueryDTO,
  GetUserLocationsRequestDTO,
  GetUserLocationsQueryDTO,
  GetUserLocationsParamsDTO,
  AddUserLocationQueryDTO,
  AddUserLocationParamsDTO,
  UpdateUserLocationQueryDTO,
  DeleteUserLocationRequestDTO,
  DeleteUserLocationQueryDTO,
} from '../schemas/requests/dashboard.request.js';
import { clientProfileService, authService, userService, workerProfileService } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQuery } from '../schemas/common.js';
import { LoggedInUser } from 'src/domain/user.entity.js';
import { IDType } from 'src/repositories/interfaces/Repository.js';
import { logger } from 'src/libs/winston.js';

export const getUser = asyncHandler<GetUserResponseDTO, GetUserRequestDTO, GetUserQueryDTO, GetUserParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const user = await userService.get({ filter: { id: userId, phoneNumber: undefined } });

  let clientProfileId: IDType = undefined;
  let workerProfileId: IDType = undefined;

  if (req.userState.client) clientProfileId = req.userState.client.id;
  if (req.userState.worker) workerProfileId = req.userState.worker.id;

  const loggedInUser: LoggedInUser = { ...user, clientProfileId, workerProfileId };

  res.status(200).send({ status: 'success', message: 'User retrieved successfully', data: { user: loggedInUser } });
});

export const updateUser = asyncHandler<UpdateUserResponseDTO, UpdateUserRequestDTO, UpdateUserQueryDTO, UpdateUserParamsDTO>(async (req, res) => {
  const userUpdateBody = req.parsed!.body!;
  const userId = req.userState.userId;
  const image = req.file;

  const updateData = {
    ...userUpdateBody,
    profileImageBuffer: image?.buffer,
  };

  const updatedUser = await userService.update({
    filter: { id: userId },
    data: updateData,
  });

  res.status(200).send({ status: 'success', message: 'updated user successfully', data: { user: updatedUser } });
});

export const createClientProfile = asyncHandler<CreateClientProfileResponseDTO, CreateClientProfileRequestDTO, CreateClientProfileQueryDTO, CreateClientProfileParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const phoneNumber = req.userState.phoneNumber;
  const deviceId = req.deviceId;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const clientProfileBody = req.parsed!.body!;

  const createData = {
  };

  console.log("creating client profile:-");
  console.log("userId: ", userId);
  console.log("data: ", createData);
  const clientProfile = await clientProfileService.create({
    userId,
    data: createData,
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
// export const updateClientProfile = asyncHandler<UpdateClientProfileResponseDTO, UpdateClientProfileRequestDTO>(async (req, res) => {
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

export const getClientProfile = asyncHandler<GetClientProfileResponseDTO, GetClientProfileRequestDTO, GetClientProfileQueryDTO, GetClientProfileParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;

  const clientProfile = await clientProfileService.get({ userId });

  res.status(200).send({ status: 'success', message: 'retrieved client profile successfully', data: { clientProfile } });
});

export const createWorkerProfile = asyncHandler<CreateWorkerProfileResponseDTO, CreateWorkerProfileRequestDTO, CreateWorkerProfileQueryDTO, CreateWorkerProfileParamsDTO>(async (req, res) => {
  const {
    workerProfile: requestBodyWorkerProfile } = req.parsed!.body!;
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

export const getWorkerOrdersStatistics = asyncHandler<GetWorkerOrdersStatisticsResponseDTO, GetWorkerOrdersStatisticsRequestDTO, GetWorkerOrdersStatisticsQueryDTO, GetWorkerOrdersStatisticsParamsDTO>(async (req, res) => {
  const workerProfileId = req.userState.worker?.id;

  const ordersCounts = await workerProfileService.getOrdersStatistics({ workerProfileId });

  res.status(200).send({ status: 'success', message: 'Worker orders count retrieved successfully', data: { ordersCounts } });
});

export const getWorkerProfile = asyncHandler<GetWorkerProfileResponseDTO, GetWorkerProfileRequestDTO, GetWorkerProfileQueryDTO, GetWorkerProfileParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;

  const workerProfile = await workerProfileService.get({ filter: { userId } });

  res.status(200).send({ status: 'success', message: 'retrieved worker profile successfully', data: { workerProfile } });
});

export const getWorkerWorkingHours = asyncHandler<GetWorkerWorkingHoursResponseDTO, GetWorkerWorkingHoursRequestDTO, GetWorkerWorkingHoursQueryDTO, GetWorkerWorkingHoursParamsDTO>(async (req, res) => {
  const userId = req.userState?.userId;
  const workingHours = await workerProfileService.getMyWorkingHours({ userId });

  res.status(200).send({ status: 'success', message: 'retrieved worker working hours successfully', data: { workingHours } });
});

export const addWorkerDaysWorkingHours = asyncHandler<AddWorkerDaysWorkingHoursResponseDTO, AddWorkerDaysWorkingHoursRequestDTO, AddWorkerDaysWorkingHoursQueryDTO, AddWorkerDaysWorkingHoursParamsDTO>(async (req, res) => {
  const workerProfileId = req.userState.worker.id;
  const { schedules: daysWorkingHours } = req.parsed!.body!;

  const workingHours = await workerProfileService.addDaysWorkingHours({
    workerProfileId,
    daysWorkingHours
  });

  res.status(200).send({ status: 'success', message: 'Days working hours added successfully', data: { workingHours } });
});


export const removeWorkerWorkingDays = asyncHandler<RemoveWorkerWorkingDaysResponseDTO, RemoveWorkerWorkingDaysRequestDTO, RemoveWorkerWorkingDaysQueryDTO, RemoveWorkerWorkingDaysParamsDTO>(async (req, res) => {
  const workerProfileId = req.userState.worker.id;
  const { days } = req.parsed!.body!;

  await workerProfileService.removeWorkingDays({
    workerProfileId,
    days
  });

  res.status(200).send({ status: 'success', message: 'Days working hours removed successfully', data: null });
});

export const updateWorkerProfile = asyncHandler<UpdateWorkerProfileResponseDTO, UpdateWorkerProfileRequestDTO, UpdateWorkerProfileQueryDTO, UpdateWorkerProfileParamsDTO>(async (req, res) => {
  const requestBodyWorkerProfile = req.parsed!.body!;

  const workerProfileBody = {
    ...requestBodyWorkerProfile,
  }

  const workerProfile = await workerProfileService.update({
    workerProfileId: req.userState.worker.id,
    data: workerProfileBody,
  });

  res.status(200).send({ status: 'success', message: 'updated worker profile successfully', data: { workerProfile } });
});

export const getWorkerGovernments = asyncHandler<GetWorkerGovernmentsResponseDTO, GetWorkerGovernmentsRequestDTO, GetWorkerGovernmentsQueryDTO, GetWorkerGovernmentsParamsDTO>(async (req, res) => {

  const { filter, pagination } = parseQuery(req.parsed!.query!);

  const result = await workerProfileService.getWorkGovernments({
    workerProfileFilter: { id: req.userState.worker.id },
    governmentFilter: filter,
    pagination,
  });

  res.status(200).send({ status: 'success', message: 'retrieved worker working governments successfully', data: result });
});

export const addWorkerGovernments = asyncHandler<AddWorkerGovernmentsResponseDTO, AddWorkerGovernmentsRequestDTO, AddWorkerGovernmentsQueryDTO, AddWorkerGovernmentsParamsDTO>(async (req, res) => {
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

export const deleteWorkerGovernments = asyncHandler<DeleteWorkerGovernmentsResponseDTO, DeleteWorkerGovernmentsRequestDTO, DeleteWorkerGovernmentsQueryDTO, DeleteWorkerGovernmentsParamsDTO>(async (req, res) => {
  const { workGovernments: governmentIds } = req.parsed!.body!;
  const all = req.parsed!.query!.all;

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

export const getWorkerSpecializationsTree = asyncHandler<GetWorkerSpecializationsTreeResponseDTO, GetWorkerSpecializationsTreeRequestDTO, GetWorkerSpecializationsTreeQueryDTO, GetWorkerSpecializationsTreeParamsDTO>(async (req, res) => {
  const workerUserId = req.userState?.userId || String(req.parsed!.params!.id);
  const { filter, } = parseQuery(req.parsed!.query!);

  const result = await workerProfileService.getSpecializationsTree({
    filter: { ...filter, userId: workerUserId },
  });

  res.status(200).send({ status: 'success', message: 'retrieved worker specialization tree successfully', data: result });
});

export const getWorkerSpecializations = asyncHandler<GetWorkerSpecializationsResponseDTO, GetWorkerSpecializationsRequestDTO, GetWorkerSpecializationsQueryDTO, GetWorkerSpecializationsParamsDTO>(async (req, res) => {
  const { specializationIds } = req.parsed!.body!;
  const { filter, pagination } = parseQuery(req.parsed!.query!);

  const result = await workerProfileService.getSpecializations({
    workerProileFilter: { ...filter, id: req.userState.worker.id },
    pagination,
    mainSpecializationIds: specializationIds,
  });

  res.status(200).send({ status: 'success', message: 'retrieved worker specialization tree successfully', data: result });
});

export const addWorkerSpecializations = asyncHandler<AddWorkerSpecializationsResponseDTO, AddWorkerSpecializationsRequestDTO, AddWorkerSpecializationsQueryDTO, AddWorkerSpecializationsParamsDTO>(async (req, res) => {
  const { specializationsTree } = req.parsed!.body!;

  await workerProfileService.addSpecializations({
    filter: { id: req.userState.worker.id },
    specializationsTree,
  });

  res.status(200).send({ status: 'success', message: 'added worker specializations successfully', data: null });
});

/**
 */
export const deleteWorkerSpecializations = asyncHandler<DeleteWorkerSpecializationsResponseDTO, DeleteWorkerSpecializationsRequestDTO, DeleteWorkerSpecializationsQueryDTO, DeleteWorkerSpecializationsParamsDTO>(async (req, res) => {
  const { mainSpecializationIds, specializationsTree } = req.parsed!.body!;
  const all = req.parsed!.query!.all;

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

export const getUserLocations = asyncHandler<GetUserLocationsResponseDTO, GetUserLocationsRequestDTO, GetUserLocationsQueryDTO, GetUserLocationsParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const locations = await userService.getLocations({ filter: { userId } });
  res.status(200).send({ status: 'success', message: 'retrieved user locations successfully', data: { locations } });
});

export const addUserLocation = asyncHandler<AddUserLocationResponseDTO, AddUserLocationRequestDTO, AddUserLocationQueryDTO, AddUserLocationParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const { governmentId, cityId, address, addressNotes, isMain, long, lat } = req.parsed!.body!;
  const location = await userService.addLocation({
    userId,
    location: { governmentId, cityId, address, addressNotes, isMain, long, lat },
  });
  res.status(201).send({ status: 'success', message: 'added location successfully', data: { location } });
});

export const updateUserLocation = asyncHandler<UpdateUserLocationResponseDTO, UpdateUserLocationRequestDTO, UpdateUserLocationQueryDTO, UpdateUserLocationParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const locationId = req.parsed!.params!.locationId;
  const locationUpdate = req.parsed!.body!;
  const location = await userService.updateLocation({
    filter: { id: locationId, userId },
    location: locationUpdate,
  });
  res.status(200).send({ status: 'success', message: 'updated location successfully', data: { location } });
});

export const deleteUserLocation = asyncHandler<DeleteUserLocationResponseDTO, DeleteUserLocationRequestDTO, DeleteUserLocationQueryDTO, DeleteUserLocationParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const locationId = req.parsed!.params!.locationId;
  await userService.deleteLocation({ filter: { id: locationId, userId } });
  res.status(200).send({ status: 'success', message: 'deleted location successfully', data: null });
});

export const getVerification = asyncHandler<GetVerificationResponseDTO, GetVerificationRequestDTO, GetVerificationQueryDTO, GetVerificationParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const verification = await workerProfileService.getVerification({ filter: { userId } });
  if (!verification) throw new AppError('Verification not found', 404);
  res.status(200).send({ status: 'success', message: 'Verification status retrieved', data: { verification } });
});

export const resubmitVerification = asyncHandler<ResubmitVerificationResponseDTO, ResubmitVerificationRequestDTO, ResubmitVerificationQueryDTO, ResubmitVerificationParamsDTO>(async (req, res) => {
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

export const createPortfolio = asyncHandler<CreatePortfolioResponseDTO, CreatePortfolioRequestDTO, CreatePortfolioQueryDTO, CreatePortfolioParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const { description } = req.parsed!.body!;
  const portfolio = await workerProfileService.createPortfolio({ userId, description });
  res.status(201).send({ status: 'success', message: 'Portfolio created', data: { portfolio } });
});

export const getPortfolio = asyncHandler<GetPortfolioResponseDTO, GetPortfolioRequestDTO, GetPortfolioQueryDTO, GetPortfolioParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const portfolio = await workerProfileService.getPortfolio({ userId });
  res.status(200).send({ status: 'success', message: 'Portfolio retrieved', data: { portfolio } });
});

export const updatePortfolio = asyncHandler<UpdatePortfolioResponseDTO, UpdatePortfolioRequestDTO, UpdatePortfolioQueryDTO, UpdatePortfolioParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const { description } = req.parsed!.body!;
  const portfolio = await workerProfileService.updatePortfolio({ userId, description });
  res.status(200).send({ status: 'success', message: 'Portfolio updated', data: { portfolio } });
});

export const addPortfolioImages = asyncHandler<AddPortfolioImagesResponseDTO, AddPortfolioImagesRequestDTO, AddPortfolioImagesQueryDTO, AddPortfolioImagesParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new AppError('No images provided', 400);
  }
  const images = await workerProfileService.addPortfolioImages({ userId, files });
  res.status(201).send({ status: 'success', message: 'Images uploaded', data: { images } });
});

export const deletePortfolioImage = asyncHandler<DeletePortfolioImageResponseDTO, DeletePortfolioImageRequestDTO, DeletePortfolioImageQueryDTO, DeletePortfolioImageParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const imageId = req.parsed!.params!.imageId;
  await workerProfileService.deletePortfolioImage({ userId, imageId });
  res.status(200).send({ status: 'success', message: 'Image deleted', data: null });
});

export const getWorkerOccupiedTimeSlots = asyncHandler<GetWorkerOccupiedTimeSlotsResponseDTO, GetWorkerOccupiedTimeSlotsRequestDTO, GetWorkerOccupiedTimeSlotsQueryDTO, GetWorkerOccupiedTimeSlotsParamsDTO>(async (req, res) => {
  const userId = req.userState.userId;
  const selectedDate = req.parsed!.query!.selectedDate;
  const occupiedSlots = await workerProfileService.getWorkerOccupiedTimeSlots({ userId, selectedDate });
  res.status(200).send({ status: 'success', message: 'Occupied time slots retrieved', data: { occupiedSlots } });
});
