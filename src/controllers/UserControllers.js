/**
 * @fileoverview User Controllers - Handle user-related HTTP requests
 * @module controllers/UserControllers
 */

import SuccessResponse from "../responses/successResponse.js";
import { userService } from "../state.js";
import { asyncAuthenticatedHandler } from '../types/asyncHandler.js';

/**
 * Update user's basic information
 * @async
 * @function updateBasicInfo
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Updates the basic profile information for a user
 */
export const updateBasicInfo = asyncAuthenticatedHandler(async (req, res) => {
  const { role, firstName, lastName, government, city, bio } = req.body;
  const userId = req.user.id;

  // If phoneNumber is provided, update user's phone (need additional verification)
  // For now, update other fields only
  await userService.updateBasicInfoById(userId, { role, firstName, lastName, government, city, bio });

  new SuccessResponse("updated user successfully", {}, 200).send(res);
});

/**
 * Update worker's profile information
 * @async
 * @function updateWorkerInfo
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Updates the professional profile information for a worker
 */
export const updateWorkerInfo = asyncAuthenticatedHandler(async (req, res) => {
  const { experienceYears, isInTeam, acceptsUrgentJobs, primarySpecialization, secondarySpecializations, governments } = req.body;
  const userId = req.user.id;

  await userService.updateWorkerInfoById(userId, {
    experienceYears,
    isInTeam,
    acceptsUrgentJobs,
    primarySpecialization,
    secondarySpecializations,
    governments
  });

  new SuccessResponse("updated worker profile successfully", { userId }, 200).send(res);
});

/**
 * Get current authenticated user's profile
 * @async
 * @function getMe
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Retrieves the profile information of the currently authenticated user
 */
export const getMe = asyncAuthenticatedHandler(async (req, res) => {
  const { id: userId } = req.user;
  const user = await userService.getUserById(userId);

  new SuccessResponse("User retrieved successfully", { user }, 200).send(res);
});
