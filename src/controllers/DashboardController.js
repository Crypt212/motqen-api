/**
 * @fileoverview Dashboard Controller - Handle dashboard HTTP requests
 * @module controllers/DashboardController
 */


import AppError from "../errors/AppError.js";
import SuccessResponse from "../responses/successResponse.js";
import { clientService, userService, workerService } from "../state.js";
import { asyncHandler } from '../types/asyncHandler.js';

/** @typedef {import("../types/asyncHandler.js").UserPayload} UserPayload */
/** @template T @typedef {import("../types/asyncHandler.js").RequestHandler<T>} RequestHandler<T> */

/**
 * @type {RequestHandler<UserPayload>}
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, governmentId, city, bio } = req.body;
  const userId = req.user.id;

  // If phoneNumber is provided, update user's phone (need additional verification)
  // For now, update other fields only
  await userService.updateUser(userId, { firstName, lastName, governmentId, city, bio });

  new SuccessResponse("updated user successfully", {}, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const getUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await userService.getUser(userId);

  new SuccessResponse("User retrieved successfully", { user }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const createClientProfile = asyncHandler(async (req, res) => {
  const { address, addressNotes } = req.body;
  const userId = req.user.id;

  const clientProfile = await clientService.createClientProfile({
    userId,
    address,
    addressNotes,
    profileImage: null,
  });

  new SuccessResponse("created client profile successfully", { clientProfile }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const updateClientProfile = asyncHandler(async (req, res) => {
  const { address, addressNotes } = req.body;
  const userId = req.user.id;

  const clientProfile = await clientService.updateClientProfile(userId, { address, addressNotes });

  new SuccessResponse("updated client profile successfully", { clientProfile }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const getClientProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const clientProfile = await clientService.getClientProfile(userId);

  new SuccessResponse("retrieved client profile successfully", { clientProfile }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload & import("../types/asyncHandler.js").MulterPayload>}
 */
export const createWorkerProfile = asyncHandler(async (req, res) => {
  const { experienceYears, isInTeam, acceptsUrgentJobs, specializationTree: specializationsTree, workGovernmentIds } = req.body;
  const userId = req.user.id;
  const images = req.files;

  if (!images || !images["personal_image"] || !images["id_image"] || !images["personal_with_id_image"])
    throw new AppError("Please upload all required images", 400);

  const clientProfile = await workerService.createWorkerProfile(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    specializationsTree,
    governmentIds: workGovernmentIds,
    idImage: images["id_image"],
    profileWithIdImage: images["personal_with_id_image"],
    profileImage: images["personal_image"],
  });

  new SuccessResponse("created worker profile successfully", { clientProfile }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const updateWorkerProfile = asyncHandler(async (req, res) => {
  const { experienceYears, isInTeam, acceptsUrgentJobs } = req.body;
  const userId = req.user.id;

  await workerService.updateWorkerProfile(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
  });

  new SuccessResponse("updated worker profile successfully", { userId }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const addWorkerGovernments = asyncHandler(async (req, res) => {
  const { governmentIds } = req.body;
  const userId = req.user.id;

  await workerService.insertWorkerProfileWorkGovernments(userId, governmentIds);

  new SuccessResponse("updated worker profile successfully", { userId }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const deleteWorkerGovernments = asyncHandler(async (req, res) => {
  const { governmentIds } = req.body;
  const userId = req.user.id;

  await workerService.deleteProfileWorkGovernments(userId, governmentIds);

  new SuccessResponse("updated worker profile successfully", { userId }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const addWorkerSpecializations = asyncHandler(async (req, res) => {
  const { specializationTree } = req.body;
  const userId = req.user.id;

  await workerService.insertWorkerProfileSpecializations(userId, specializationTree);

  new SuccessResponse("updated worker profile successfully", { userId }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const deleteWorkerSpecializations = asyncHandler(async (req, res) => {
  const { mainSpecializationIds, specializationTree } = req.body;
  const userId = req.user.id;

  if (mainSpecializationIds)
    await workerService.deleteWorkerProfileMainSpecializations(userId, mainSpecializationIds);

  if (specializationTree)
    await workerService.deleteWorkerProfileSubSpecializations(userId, specializationTree);

  new SuccessResponse("updated worker profile successfully", { userId }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const getWorkerProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const workerProfile = await workerService.getWorkerProfile(userId);

  new SuccessResponse("retrieved worker profile successfully", { workerProfile }, 200).send(res);
});

/**
 * Get user's profile image
 * @type {RequestHandler<UserPayload>}
 */
export const getProfileImage = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const profileImage = await userService.getProfileImage(userId);

  new SuccessResponse("retrieved profile image successfully", { profileImage }, 200).send(res);
});

/**
 * Update user's profile image
 * @type {RequestHandler<UserPayload & import("../types/asyncHandler.js").MulterPayload>}
 * if user is a worker, the image will not be updated until it gets approved by an admin
 */
export const updateProfileImage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const image = req.file;

  if (!image) {
    throw new AppError("Please upload an image", 400);
  }

  // Upload image to cloudinary


  const profileImage = await userService.updateProfileImage(userId, image.buffer);

  new SuccessResponse("updated profile image successfully", { profileImage }, 200).send(res);
});

/**
 * Delete user's profile image
 * @type {RequestHandler<UserPayload>}
 * worker can not use that route, they will not delete their profile image
 */
export const deleteProfileImage = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await userService.deleteProfileImage(userId);

  new SuccessResponse("deleted profile image successfully", {}, 200).send(res);
});
