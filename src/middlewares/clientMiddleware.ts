import AppError from '../errors/AppError.js';
import { asyncHandler } from '../types/asyncHandler.js';

/**
 * Disallows client users to access the route
 */
export const unAuthorizeClient = asyncHandler(async (req, _, next) => {
  if (req.userState.client) return next(new AppError('Unauthorized access for client users', 403));

  next();
});

/**
 * Allows only client users to access the route
 */
export const authorizeClient = asyncHandler(async (req, _, next) => {
  if (!req.userState.client)
    return next(new AppError('Unauthorized access for non-client users', 403));

  next();
});
