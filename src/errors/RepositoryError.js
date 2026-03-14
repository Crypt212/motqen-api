import AppError from "./AppError.js";

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
  /** Validation errors */
  INVALID: 5,
};

/**
 * Custom error class for repository layer errors
 * @class
 * @extends AppError
 */
export default class RepositoryError extends AppError {
  /**
   * Create a new RepositoryError
   * @constructor
   * @param {string} message - Error message
   * @param {RepositoryErrorType} [code=RepositoryErrorType.DATABASE_ERROR] - Type of error
   * @param {Object} [info] - Additional error information
   */
  constructor(message, code = RepositoryErrorType.DATABASE_ERROR, info = null) {
    super(message);

    this.code = code;
    this.info = info;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Get HTTP status code based on error type
   * @returns {number} HTTP status code
   */
  getStatusCode() {
    switch (this.code) {
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
