/**
 * @fileoverview AppError - Custom error class for application errors
 * @module errors/AppError
 */

import { resolveErrorCode } from './errorCodes.js';

/**
 * Custom error class for operational errors
 * @class
 * @extends Error
 */
export default class AppError extends Error {
  /**
   * Creates a new AppError instance
   * @constructor
   * @param {string} message - Error message
   * @param {number} [statusCode=500] - HTTP status code
   * @param {Object|null} [errors=null] - Additional error details
   * @param {string|null} [errorCode=null] - Machine-readable error code
   */
  constructor(message, statusCode = 500, errors = null, errorCode = null) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.errorCode = resolveErrorCode(statusCode, errorCode);
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
