/**
 * @fileoverview User Controllers - Handle user-related HTTP requests
 * @module controllers/UserControllers
 */

import { uploader } from "../configs/cloudinary.js";
import { dataUri } from "../configs/multer.js";
import AppError from "../errors/AppError.js";
import SuccessResponse from "../responses/successResponse.js";
import { userService } from "../state.js";
import { asyncHandler } from '../types/asyncHandler.js';

/** @typedef {import("../types/asyncHandler.js").UserPayload} UserPayload */
/** @template T @typedef {import("../types/asyncHandler.js").RequestHandler<T>} RequestHandler<T> */

/**
 * @type {RequestHandler<UserPayload>}
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { role, firstName, lastName, government, city, bio } = req.body;
  const userId = req.user.id;

  // If phoneNumber is provided, update user's phone (need additional verification)
  // For now, update other fields only
  await userService.updateUser(userId, { role, firstName, lastName, government, city, bio });

  new SuccessResponse("updated user successfully", {}, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await userService.getUser({ id });

  new SuccessResponse("User retrieved successfully", { user }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const createClientProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const clientProfile = await userService.createClientProfile({userId});

  new SuccessResponse("created client profile successfully", { clientProfile }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const updateClientProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const clientProfile = await userService.updateClientProfile(userId, {});

  new SuccessResponse("updated client profile successfully", { clientProfile }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const getClientProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const clientProfile = await userService.getClientProfile(userId);

  new SuccessResponse("retrieved client profile successfully", { clientProfile }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload & import("../types/asyncHandler.js").MulterPayload>}
 */
export const createWorkerProfile = asyncHandler(async (req, res) => {
  const { experienceYears, isInTeam, acceptsUrgentJobs, specializationNames, subSpecializationNames, governmentNames } = req.body;
  const userId = req.user.id;
  const images = req.files;

  const clientProfile = await userService.createWorkerProfile(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    specializationNames,
    subSpecializationNames,
    governmentNames
  });

  if (!images || !images["personal_image"] || !images["id_image"] || !images["personal_with_id_image"])
    throw new AppError("Please upload all required images", 400);

  for (let imageName of ["personal_image", "id_image", "personal_with_id_image"]) {
    const file = dataUri(images[imageName]).content;
    await uploader.upload(file);
  }

  new SuccessResponse("created worker profile successfully", { clientProfile }, 200).send(res);
});
/**
 * @type {RequestHandler<UserPayload>}
 */
export const updateWorkerProfile = asyncHandler(async (req, res) => {
  const { experienceYears, isInTeam, acceptsUrgentJobs } = req.body;
  const userId = req.user.id;

  await userService.updateWorkerProfile(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
  });

  new SuccessResponse("updated worker profile successfully", { userId }, 200).send(res);
});

/**
 * @type {RequestHandler<UserPayload>}
 */
export const getWorkerProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const workerProfile = await userService.getWorkerProfile(userId);

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
  const fileUri = dataUri(image).content;
  const uploadedImage = await uploader.upload(fileUri);

  const profileImage = await userService.updateProfileImage(userId, uploadedImage.secure_url);

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
