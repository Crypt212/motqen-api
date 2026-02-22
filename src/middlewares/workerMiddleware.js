
/** @typedef {import("../types/asyncHandler.js").UserPayload} UserPayload */
/** @template T @typedef {import("../types/asyncHandler.js").RequestHandler<T>} RequestHandler<T> */

import AppError from "../errors/AppError.js";
import { asyncHandler } from "../types/asyncHandler.js";

/**
 * Disallows worker users to access the route
 * @type {RequestHandler<UserPayload>}
 */
export const unAuthorizeWorker = asyncHandler(async (req, _, next) => {

  if (req.user.isWorker) throw new AppError("Unauthorized access for worker users", 401);

  next();
});

/**
 * Allows only worker users to access the route
 * @type {RequestHandler<UserPayload>}
 */
export const authorizeWorker = asyncHandler(async (req, _, next) => {

  if (!req.user.isWorker) throw new AppError("Unauthorized access for non-worker users", 401);

  next();
});
