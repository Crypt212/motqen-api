/**
 * @fileoverview Auth Middleware - Authentication and authorization middleware
 * @module middlewares/authMiddleware
 */

import AppError from "../errors/AppError.js";
import { asyncAuthenticatedHandler } from "../types/asyncHandler.js";
import { verifyAndDecodeToken } from "../utils/tokens.js";


/**
 * Authenticates the request by verifying the access token in the Authorization header
 * @function authenticate
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>} Calls next() with user payload or error
 * @throws {AppError} 401 if authorization header is missing or token is invalid
 */
export const authenticate = asyncAuthenticatedHandler(async (req, _, next) => {

  const authHeader = req.headers.authorization;
  if (!authHeader) throw new AppError("Unauthorized", 401);

  const accessToken = authHeader.split(" ")[1];
  if (!accessToken) throw new AppError("Unauthorized", 401);

  const decoded = verifyAndDecodeToken(accessToken, "access");
  if (!decoded) throw new AppError("Unauthorized", 401,);

  /** @type {import("../types/express.js").AuthenticatedRequest} */
  req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

  next();
});

/**
 * Authorizes the request to ensure the user has ADMIN role
 * @function authorizeAdmin
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>} Calls next() or throws error if not authorized
 * @throws {AppError} 401 if user is not an ADMIN
 */
export const authorizeAdmin = asyncAuthenticatedHandler( async (req, _, next) => {
  if (req.user.role !== "ADMIN") throw new AppError("Unauthorized", 401);
  next();
});
