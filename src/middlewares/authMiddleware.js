/**
 * @fileoverview Auth Middleware - Authentication and authorization middleware
 * @module middlewares/authMiddleware
 */

import AppError from '../errors/AppError.js';
import { userRepository, userService } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { verifyAndDecodeToken } from '../utils/tokens.js';

/** @typedef {import("../types/asyncHandler.js").UserPayload} UserPayload */
/** @typedef {import("../types/asyncHandler.js").PhoneNumberPayload} PhoneNumberPayload */
/** @template T @typedef {import("../types/asyncHandler.js").RequestHandler<T>} RequestHandler<T> */

/**
 * Authenticates the request by verifying the access token in the Authorization header
 * @type {RequestHandler<UserPayload>}
 * @throws {AppError} 401 if authorization header is missing or token is invalid
 */
export const authenticate = asyncHandler(async (req, _, next) => {

  const authHeader = req.headers.authorization;
  if (!authHeader) throw new AppError("Unauthorized", 401);

  const accessToken = authHeader.split(" ")[1];
  if (!accessToken) throw new AppError("Unauthorized", 401);

  const decoded = verifyAndDecodeToken(accessToken, "access");
  if (!decoded) throw new AppError("Unauthorized", 401);

  const user = await userRepository.findOne({ id: decoded.userId });
  if (user.status !== "ACTIVE")
    throw new AppError("Not Active", 401);

  req.user = {
      id: decoded.userId,
      role: decoded.role,
      ...(await userService.getUserRoles(decoded.userId)),
    };

  next();
});

/**
 * Authenticates the login request by verifying the login token in the Authorization header
 * @type {RequestHandler<PhoneNumberPayload>}
 * @throws {AppError} 401 if authorization header is missing or token is invalid
 */
export const authenticateLogin = asyncHandler(async (req, _, next) => {

  const authHeader = req.headers.authorization;
  if (!authHeader) throw new AppError("Unauthorized", 401);

  const token = authHeader.split(" ")[1];
  if (!token) throw new AppError("Unauthorized", 401);

  const decoded = verifyAndDecodeToken(token, "login");
  if (!decoded) throw new AppError("Unauthorized", 401,);

  req.phoneNumber = decoded.phoneNumber;

  next();
});

/**
 * Authenticates the registeration request by verifying the register token in the Authorization header
 * @type {RequestHandler<PhoneNumberPayload>}
 * @throws {AppError} 401 if authorization header is missing or token is invalid
 */
export const authenticateRegister = asyncHandler(async (req, _, next) => {

  const authHeader = req.headers.authorization;
  if (!authHeader) throw new AppError("Unauthorized", 401);

  const token = authHeader.split(" ")[1];
  if (!token) throw new AppError("Unauthorized", 401);

  const decoded = verifyAndDecodeToken(token, "register");
  if (!decoded) throw new AppError("Unauthorized", 401,);

  req.phoneNumber = decoded.phoneNumber;

  next();
});

/**
 * Authorizes the request to ensure the user has ADMIN role
 * @type {RequestHandler<UserPayload>}
 * @throws {AppError} 401 if user is not an ADMIN
 */
export const authorizeAdmin = asyncHandler(async (req, _, next) => {
  if (req.user.role !== 'ADMIN') throw new AppError('Unauthorized', 401);
  next();
});
