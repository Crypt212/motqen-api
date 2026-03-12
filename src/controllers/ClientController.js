/**
 * @fileoverview Client Controller - Handle client-related HTTP requests
 * @module controllers/ClientController
 */

import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import { userRepository } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';
import uploadToCloudinary from '../providers/cloudinaryProvider.js';

/**
 * GET /client/me
 * Retrieve authenticated user's profile with client information
 * @param {import('../types/asyncHandler.js').Request} req
 * @param {import('../types/asyncHandler.js').Response} res
 */
export const getMe = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;

  const user = await userRepository.prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phoneNumber: true,
      firstName: true,      middleName: true,
      lastName: true,
      profileImageUrl: true,
      clientProfile: {
        select: {
          address: true,
          addressNotes: true,
        }
      }
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const clientProfileData = user.clientProfile || {
    address: null,
    addressNotes: null
  };

  const responseData = {
    id: user.id,
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    clientProfile: {
      address: clientProfileData.address,
      addressNotes: clientProfileData.addressNotes,
    }
  };

  new SuccessResponse('User profile retrieved successfully', responseData, 200).send(res);
});

/**
 * POST /client/me/profile-image
 * Update user's profile image
 * @param {import('../types/asyncHandler.js').Request} req
 * @param {import('../types/asyncHandler.js').Response} res
 */
export const updateProfileImage = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;

  if (!req.file) {
    throw new AppError('Profile image file is required', 400);
  }

  // Upload to Cloudinary
  const { url: profileImageUrl } = await uploadToCloudinary(
    req.file.buffer,
    'Motqen/profiles',
    `user_${userId}_profile`
  );

  // Update user's profile image URL
  await userRepository.updateById(userId, { profileImageUrl });

  new SuccessResponse('Profile image updated successfully', { profileImageUrl }, 200).send(res);
});
