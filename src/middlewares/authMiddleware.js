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
  if (!req.deviceId) throw new AppError("Device ID is required", 401);

  // TODO: DeviceID needs to be verified here

  next();
});

/**
 */
export const authenticateLogin = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers.authorization;

  verifyHeaderToken(authHeader, "login");
  next();
});

/**
 */
export const authenticateRegister = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers.authorization;

  verifyHeaderToken(authHeader, "register");
  next();
});

/**
 */
export const authenticateAccess = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers.authorization;
  const payload = verifyHeaderToken(authHeader, "access");

  req.userState = (await redisRetreiveOrCache("access:" + payload.userId, async () => {
    return await userService.getStatus({ userId: payload.userId });
  }));

  next();
});

/**
 */
export const authenticateRefresh = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers.authorization;
  const payload = verifyHeaderToken(authHeader, "refresh");

  req.userState = (await redisRetreiveOrCache("access:" + payload.userId, async () => {
    return await userService.getStatus({ userId: payload.userId });
  }));

  next();
});

/**
 * Authenticates the request by verifying that the user has verfied access or refresh token and is active
 * @throws {AppError} 401 if user has not verified access or refresh token or is not active
 */
export const isActive = asyncHandler(async (req, _, next) => {
  if (req.userState) {
    if (req.userState.accountStatus !== "ACTIVE")
      throw new AppError("Not Active", 401);
  } else
    throw new AppError("Unauthorized", 401);

  next();
});

/**
 * Authorizes the request to ensure the user has ADMIN role
 * @throws {AppError} 401 if user is not an ADMIN
 */
export const authorizeAdmin = asyncHandler(async (req, _, next) => {
  if (req.userState) {
    if (req.userState.role !== 'ADMIN') throw new AppError('Unauthorized', 401);
  } else
    throw new AppError("Unauthorized", 401);
  next();
});
