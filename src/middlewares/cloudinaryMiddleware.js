import { v2 } from 'cloudinary';
import environment from '../configs/environment.js';

const { config } = v2;


/** @typedef {import("../types/asyncHandler.js").UserPayload} UserPayload */
/** @template T @typedef {import("../types/asyncHandler.js").RequestHandler<T>} RequestHandler<T> */

/**
 * Configures Cloudinary with the provided environment variables
 * @type {RequestHandler<{}>}
 * @throws {AppError} 401 if authorization header is missing or token is invalid
 */
const cloudinaryConfig = (req, res, next) => {
  config(environment.cloudinary);
  next();
}

export default cloudinaryConfig;
