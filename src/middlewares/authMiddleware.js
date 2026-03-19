/**
 * @fileoverview Auth Middleware - Authentication and authorization middleware
 * @module middlewares/authMiddleware
 */

import AppError from '../errors/AppError.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { verifyHeaderToken } from '../utils/tokens.js';
import { getHeaderValue } from '../utils/HTTTHeaders.js';
import { userService } from '../state.js';
import { redisRetreiveOrCache } from '../utils/redis.js';

/** @template T @typedef {import("../types/asyncHandler.js").RequestHandler} RequestHandler */
/** @typedef {import('express').Request} Request */

/**
 */
export const verifyDeviceId = asyncHandler(async (req, _, next) => {
  req.deviceId = getHeaderValue(req.headers['x-device-fingerprint']);
  if (!req.deviceId) return next(new AppError("Device ID is required", 401));

  // TODO: DeviceID needs to be verified here

  next();
});

/**
 */
export const authenticateLogin = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers.authorization;
console.log(authHeader)
  try {
    verifyHeaderToken(authHeader, "login");
  } catch (err) {
    return next(new AppError("Invalid login token", 401));
  }
  next();
});

/**
 */
export const authenticateRegister = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers.authorization;

  try {
    verifyHeaderToken(authHeader, "register");
  } catch (err) {
    return next(new AppError("Invalid register token", 401));
  }
  next();
});

/**
 */
export const authenticateAccess = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers.authorization;
  try {
    const payload = verifyHeaderToken(authHeader, "access");
    req.userState = await redisRetreiveOrCache("access:" + payload.userId, async () => {
      return await userService.getStatus({ userId: payload.userId });
    });
  } catch (err) {
    return next(new AppError("Invalid access token", 401));
  }


  next();
});

/**
 */
export const authenticateRefresh = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers.authorization;
  try {
    const payload = verifyHeaderToken(authHeader, "refresh");
    req.userState = (await redisRetreiveOrCache("access:" + payload.userId, async () => {
      return await userService.getStatus({ userId: payload.userId });
    }));
  } catch (err) {
    return next(new AppError("Invalid refresh token", 401));
  }


  next();
});

/**
 * Authenticates the request by verifying that the user has verfied access or refresh token and is active
 * @throws {AppError} 401 if user has no verified access or refresh token
 * @throws {AppError} 403 if user has an inactive account
 */
export const isActive = asyncHandler(async (req, _, next) => {
  if (req.userState) {
    if (req.userState.accountStatus !== "ACTIVE")
      return next(new AppError("Unauthorized access for users with no active account", 403));
  } else
    return next(new AppError("Not authenticated", 401));

  next();
});

/**
 * Authorizes the request to ensure the user has ADMIN role
 * @throws {AppError} 401 if user has no verified access or refresh token
 * @throws {AppError} 403 if user is not an admin
 */
export const authorizeAdmin = asyncHandler(async (req, _, next) => {
  if (req.userState) {
    if (req.userState.role !== 'ADMIN') return next(new AppError('Unauthorized access for non-admins users', 403));
  } else
    return next(new AppError("Not authenticated", 401));
  next();
});
