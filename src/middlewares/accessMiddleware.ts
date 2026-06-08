import AppError from '../errors/AppError.js';
import { asyncHandler } from '../types/asyncHandler.js';

/**
 * Disallows client access to the route
 */
export const unAuthorizeClient = asyncHandler(async (req, _, next) => {
  if (req.userState.role === 'CLIENT')
    return next(new AppError('Unauthorized access for client users', 403));

  next();
});

/**
 * Allows only client access to the route
 */
export const authorizeClient = asyncHandler(async (req, _, next) => {
  if (req.userState.role !== 'CLIENT')
    return next(new AppError('Only clients are allowed', 403));

  if (!req.userState.client)
    return next(new AppError('Only users with client profile are allowed', 403));

  next();
});


/**
 * Disallows worker access to the route
 */
export const unAuthorizeWorker = asyncHandler(async (req, _, next) => {
  if (req.userState.role === 'WORKER')
    return next(new AppError('Unauthorized access for worker users', 403));

  next();
});

/**
 * Allows only worker access to the route
 */
export const authorizeWorker = asyncHandler(async (req, _, next) => {
  if (req.userState.role !== 'WORKER')
    return next(new AppError('Only workers are allowed', 403));

  if (!req.userState.worker)
    return next(new AppError('Only users with worker profile are allowed', 403));

  next();
});

/**
 * Allows only approved worker access to the route
 */
export const authorizeApprovedWorker = asyncHandler(async (req, _, next) => {
  if (req.userState.role !== 'WORKER')
    return next(new AppError('Only workers are allowed', 403));

  if (!req.userState.worker)
    return next(new AppError('Only users with worker profile are allowed', 403));

  if (req.userState.worker.verification.status !== 'APPROVED')
    return next(new AppError('You are not an approved worker yet', 403));

  next();
});


/**
 * Authorizes the request to ensure the user is admin
 * @throws {AppError} 401 if user has no verified access or refresh token
 * @throws {AppError} 403 if user is not an admin
 */
export const authorizeAdmin = asyncHandler(async (req, _, next) => {
  if (req.userState) {
    if (req.adminState)
      return next(new AppError('Unauthorized access for non-admin users', 403));
  } else return next(new AppError('Not authenticated', 401));
  next();
});
