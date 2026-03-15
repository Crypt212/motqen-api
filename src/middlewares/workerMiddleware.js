import AppError from "../errors/AppError.js";
import { asyncHandler } from "../types/asyncHandler.js";

/**
 * Disallows worker users to access the route
 */
export const unAuthorizeWorker = asyncHandler(async (req, _, next) => {

  if (!req.userState.worker) throw new AppError("Unauthorized access for worker users", 403);

  next();
});

/**
 * Allows only worker users to access the route
 */
export const authorizeWorker = asyncHandler(async (req, _, next) => {

  if (!req.userState.worker) throw new AppError("Unauthorized access for non-worker users", 403);
  if (req.userState.worker.verification.status !== "APPROVED") throw new AppError("You are not approved yet" + req.userState.worker.verification.status, 403);
  next();
});
