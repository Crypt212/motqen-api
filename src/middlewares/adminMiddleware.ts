import AppError from "src/errors/AppError.js";
import { asyncHandler } from "src/types/asyncHandler.js";


/**
 * Authorizes the request to ensure the user has ADMIN role
 * @throws {AppError} 401 if user has no verified access or refresh token
 * @throws {AppError} 403 if user is not an admin
 */
export const authorizeAdmin = asyncHandler(async (req, _, next) => {
  if (req.userState) {
    if (req.userState.role !== 'ADMIN')
      return next(new AppError('Unauthorized access for non-admin users', 403));
  } else return next(new AppError('Not authenticated', 401));
  next();
});
