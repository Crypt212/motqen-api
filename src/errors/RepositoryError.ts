/**
 * Error types for repository operations
 * @readonly
 * @enum {number}
 */
export enum RepositoryErrorType {
  /** Database connection or query errors */
  "DATABASE_ERROR",
  /** Unique constraint violations */
  "DUPLICATE_KEY",
  /** Resource not found */
  "NOT_FOUND",
  /** Resource already exists */
  "ALREADY_EXISTS",
  /** Validation errors */
  "INVALID",
};

/**
 * Custom error class for repository layer errors
 */
export default class RepositoryError extends Error {
  public code: RepositoryErrorType;
  constructor(message: string, code: RepositoryErrorType = RepositoryErrorType.DATABASE_ERROR) {
    super(message);

    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
