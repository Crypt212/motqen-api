/**
 * @fileoverview Repository Error - Custom error for repository layer
 * @module errors/RepositoryError
 */

/**
 * Error types for repository operations
 * @readonly
 * @enum {number}
 */
export const RepositoryErrorType = {
  /** Database connection or query errors */
  DATABASE_ERROR: 1,
  /** Unique constraint violations */
  DUPLICATE_KEY: 2,
  /** Resource not found */
  NOT_FOUND: 3,
  /** Resource already exists */
  ALREADY_EXISTS: 4,
};

/**
 * Custom error class for repository layer errors
 * @class
 * @extends Error
 */
export default class RepositoryError extends Error {
  /**
   * Create a new RepositoryError
   * @constructor
   * @param {string} message - Error message
   * @param {RepositoryErrorType} [errorType=RepositoryErrorType.DATABASE_ERROR] - Type of error
   * @param {Object} [info] - Additional error information
   */
  constructor(message, errorType = RepositoryErrorType.DATABASE_ERROR, info = null) {
    super(message);

    this.errorType = errorType;
    this.info = info;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Get HTTP status code based on error type
   * @returns {number} HTTP status code
   */
  getStatusCode() {
    switch (this.errorType) {
      case RepositoryErrorType.NOT_FOUND:
        return 404;
      case RepositoryErrorType.ALREADY_EXISTS:
        return 409;
      case RepositoryErrorType.DUPLICATE_KEY:
        return 409;
      default:
        return 500;
    }
  }
}
