/**
 * @fileoverview Auth Middleware - Authentication and authorization middleware
 * @module middlewares/authMiddleware
 */

import AppError from "../errors/AppError.js";
import { userService } from "../state.js";
import { asyncHandler } from "../types/asyncHandler.js";
import { verifyAndDecodeToken } from "../utils/tokens.js";


/** @typedef {import("../types/asyncHandler.js").UserPayload} UserPayload */
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
  if (!decoded) throw new AppError("Unauthorized", 401,);

  req.user = {
      id: decoded.userId,
      role: decoded.role,
      ...(await userService.getUserRoles(decoded.userId)),
    };

  next();
});

/**
 * Authorizes the request to ensure the user has ADMIN role
 * @type {RequestHandler<UserPayload>}
 * @throws {AppError} 401 if user is not an ADMIN
 */
export const authorizeAdmin = asyncHandler( async (req, _, next) => {
  if (req.user.role !== "ADMIN") throw new AppError("Unauthorized", 401);
  next();
});
