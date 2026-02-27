import AppError from "../errors/AppError.js";
import { asyncHandler } from "../types/asyncHandler.js";

/**
 * Disallows client users to access the route
 */
export const unAuthorizeClient = asyncHandler(async (req, _, next) => {

  if (req.access.isClient) throw new AppError("Unauthorized access for client users", 401);

  next();
});

/**
 * Allows only client users to access the route
 */
export const authorizeClient = asyncHandler(async (req, _, next) => {

  if (!req.access.isClient) throw new AppError("Unauthorized access for non-client users", 401);

  next();
});
