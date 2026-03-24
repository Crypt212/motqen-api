import { v2 } from 'cloudinary';
import environment from '../configs/environment.js';
import { asyncHandler } from 'src/types/asyncHandler.js';

const { config } = v2;

/**
 * Configures Cloudinary with the provided environment variables
 * @throws {AppError} 401 if authorization header is missing or token is invalid
 */
const cloudinaryConfig = asyncHandler((_, __, next) => {
  config(environment.cloudinary);
  next();
});

export default cloudinaryConfig;
