import AppError from "../errors/AppError.js";
import { userRepository } from "../state.js";
import { asyncHandler } from "../types/asyncHandler.js";

/**
 * Disallows worker users to access the route
 */
export const unAuthorizeWorker = asyncHandler(async (req, _, next) => {

  if (req.access.isWorker) throw new AppError("Unauthorized access for worker users", 401);

  next();
});

/**
 * Allows only worker users to access the route
 */
export const authorizeWorker = asyncHandler(async (req, _, next) => {

  if (!req.access.isWorker) throw new AppError("Unauthorized access for non-worker users", 401);
  const workerProfile = await userRepository.get(req.access.userId);

  if (!workerProfile.isApproved) throw new AppError("You are not approved yet", 401);
  next();
});
