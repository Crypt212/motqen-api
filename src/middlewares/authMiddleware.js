/**
 * @fileoverview Auth Middleware - Authentication and authorization middleware
 * @module middlewares/authMiddleware
 */

import AppError from '../errors/AppError.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { verifyAndDecodeToken } from '../utils/tokens.js';
import { getHeaderValue } from '../utils/HTTTHeaders.js';

/** @template T @typedef {import("../types/asyncHandler.js").RequestHandler} RequestHandler */
/** @typedef {import('express').Request} Request */


/**
 * Verifies and decodes the token from the Authorization header
 * @template {keyof import('../types/tokens.js').TokenTypeMap} T
 * @param {Request} req - Express request object
 * @param {keyof import('../types/tokens.js').TokenTypeMap} type - Token type
 */
export const verifyHeaderToken = function(req, type) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new AppError("Unauthorized", 401);

  const token = authHeader.split(" ")[1];
  if (!token) throw new AppError("Unauthorized", 401);

  const decoded = verifyAndDecodeToken(token, type);
  if (!decoded) throw new AppError("Unauthorized", 401);
  req[type] = decoded;
  req[type].type = undefined;
}

/**
 * Verifies the device
 * @param {(keyof import('../types/tokens.js').TokenTypeMap)[]} tokenTypes
 * @throws {AppError} 401 if authorization header is missing or token is invalid
 */
export const verifyDeviceId = asyncHandler(async (req, _, next) => {
  req.deviceId = getHeaderValue(req.headers['x-device-fingerprint']);
  if (!req.deviceId) throw new AppError("Device ID is required", 401);

  // TODO: DeviceID needs to be verified here


  next();
});

/**
 * Returns a middleware that verifies bearer tokens of the given types and attachs its corresponding request payload to request
 * @param {(keyof import('../types/tokens.js').TokenTypeMap)[]} tokenTypes
 * @throws {AppError} 401 if authorization header is missing or token is invalid
 */
export const authenticateTokens = (tokenTypes) => {
  return asyncHandler(async (req, _, next) => {

    tokenTypes.forEach(type => {
      verifyHeaderToken(req, type);
    });

    next();
  });
}

/**
 * Authenticates the request by verifying that the user has verfied access or refresh token and is active
 * @throws {AppError} 401 if user has not verified access or refresh token or is not active
 */
export const authenticateActive = asyncHandler(async (req, _, next) => {
  if ("access" in Object.keys(req)) {
    if (!req.access.isActive)
      throw new AppError("Not Active", 401);
  } else if ("refresh" in Object.keys(req)) {
    if (!req.refresh.isActive)
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
  if (req.access.role !== 'ADMIN') throw new AppError('Unauthorized', 401);
  next();
});
