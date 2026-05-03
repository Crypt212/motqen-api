/**
 * @fileoverview Auth Middleware - Authentication and authorization middleware
 * @module middlewares/authMiddleware
 */

import AppError from '../errors/AppError.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { verifyHeaderToken } from '../utils/tokens.js';
import { getHeaderValue } from '../utils/HTTTHeaders.js';
import { userService } from '../state.js';
import { redisClearCache, redisRetreiveOrCache } from '../utils/redis.js';

/**
 * Helper function to handle JWT Errors and map them to 401 Unauthorized
 * This covers Points 2, 3, and 9
 */
const handleJWTError = (err: any, next: any) => {
  if (err.name === 'TokenExpiredError') {
    return next(new AppError('Unauthorized: Token has expired', 401));
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    return next(new AppError('Unauthorized: Invalid or tampered token', 401));
  }
  // If it's a generic AppError or something else, pass it as is
  return next(err);
};

/**
 */
export const verifyDeviceId = asyncHandler(async (req, _, next) => {
  req.deviceId = getHeaderValue(req.headers['x-device-fingerprint']);
  if (!req.deviceId) {
    next(new AppError('Device ID is required', 401));
    return;
  }

  // TODO: DeviceID needs to be verified here

  next();
});

/**
 */
export const authenticateLogin = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers.authorization;
  
  // Point 1: Reject missing JWT
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: Missing or invalid authorization header', 401));
  }

  try {
    verifyHeaderToken(authHeader, 'login');
  } catch (err: unknown) {
    return handleJWTError(err, next);
  }
  next();
});

/**
 */
export const authenticateRegister = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers.authorization;

  // Point 1: Reject missing JWT
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: Missing or invalid authorization header', 401));
  }

  try {
    verifyHeaderToken(authHeader, 'register');
  } catch (err: unknown) {
    return handleJWTError(err, next);
  }
  next();
});

/**
 */
export const authenticateAccess = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers.authorization;

  // Point 1: Reject missing JWT
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: Missing or invalid authorization header', 401));
  }

  try {
    const payload = verifyHeaderToken(authHeader, 'access');
    req.userState = await redisRetreiveOrCache('access:' + payload.userId, async () => {
      return await userService.getStatus({ filter: { id: payload.userId } });
    });
  } catch (err: unknown) {
    return handleJWTError(err, next);
  }

  next();
});

/**
 */
export const authenticateRefresh = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers.authorization;

  // Point 1: Reject missing JWT
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: Missing or invalid authorization header', 401));
  }

  try {
    const payload = verifyHeaderToken(authHeader, 'refresh');
    req.userState = await redisRetreiveOrCache('access:' + payload.userId, async () => {
      return await userService.getStatus({ filter: { id: payload.userId } });
    });
  } catch (err: unknown) {
    return handleJWTError(err, next);
  }

  next();
});

export const clearCacheAuthenticationState = asyncHandler(async (req, _, next) => {
  try {
    await redisClearCache('access:' + req.userState.userId);
  } catch (err: unknown) {
    return next(err);
  }

  next();
});

/**
 * Authenticates the request by verifying that the user has verified access or refresh token and is active
 * @throws {AppError} 401 if user has no verified access or refresh token
 * @throws {AppError} 403 if user has an inactive account
 */
export const isActive = asyncHandler(async (req, _, next) => {
  if (req.userState) {
    if (req.userState.accountStatus !== 'ACTIVE')
      return next(new AppError('Unauthorized access for users with no active account', 403));
  } else return next(new AppError('Not authenticated', 401));

  next();
});

/**
 * Authorizes the request to ensure the user has ADMIN role
 * @throws {AppError} 401 if user has no verified access or refresh token
 * @throws {AppError} 403 if user is not an admin
 */
export const authorizeAdmin = asyncHandler(async (req, _, next) => {
  if (req.userState) {
    if (req.userState.role !== 'ADMIN')
      return next(new AppError('Unauthorized access for non-admins users', 403));
  } else return next(new AppError('Not authenticated', 401));
  next();
});