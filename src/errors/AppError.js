/**
 * @fileoverview AppError - Custom error class for application errors
 * @module errors/AppError
 */

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
   * @param {Object|null} [errors=null] - Additional error data
   */
  constructor(message, statusCode = 500, errors = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
