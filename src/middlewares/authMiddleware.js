/**
 * @fileoverview Auth Middleware - Authentication and authorization middleware
 * @module middlewares/authMiddleware
 */

import AppError from '../errors/AppError.js';
import { userService } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { verifyAndDecodeToken } from '../utils/tokens.js';

/** @typedef {import("../types/asyncHandler.js").UserPayload} UserPayload */
/** @template T @typedef {import("../types/asyncHandler.js").RequestHandler<T>} RequestHandler<T> */

export const authenticate = function (type) {
  /**
   * Authenticates the request by verifying the access token in the Authorization header
   * @type {RequestHandler<UserPayload>}
   * @throws {AppError} 401 if authorization header is missing or token is invalid
   */
  return  (req, _, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new AppError('Unauthorized', 401);

    const Token = authHeader.split(' ')[1].trim();
    if (!Token) throw new AppError('Unauthorized', 401);
console.log(Token)
    const decoded = verifyAndDecodeToken(Token, type);
    if (!decoded) throw new AppError('Unauthorized', 401);

    req.user = {
      ...decoded,
    };

    next();
  };
};

/**
 * Authorizes the request to ensure the user has ADMIN role
 * @type {RequestHandler<UserPayload>}
 * @throws {AppError} 401 if user is not an ADMIN
 */
export const authorizeAdmin = asyncHandler(async (req, _, next) => {
  if (req.user.role !== 'ADMIN') throw new AppError('Unauthorized', 401);
  next();
});
