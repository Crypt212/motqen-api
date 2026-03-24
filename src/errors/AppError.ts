/**
 * @fileoverview AppError - Custom error class for application errors
 * @module errors/AppError
 */

import OperationalError from './OperationalError.js';

/**
 * Custom error class for operational errors
 * @class
 * @extends Error
 */
export default class AppError extends OperationalError {
  public statusCode: number;
  public status: 'fail' | 'error';
  public retryAfter: number = 0; // for rate limit errors
  public details: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);

    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
