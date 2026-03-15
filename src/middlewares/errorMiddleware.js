/**
 * @fileoverview Error Handler Middleware - Global error handling for Express
 * @module middlewares/errorMiddleware
 */

import { logger } from "../libs/winston.js";
import { resolveErrorCode } from '../errors/errorCodes.js';

/**
 * Error handler middleware
 * @type {import("express").ErrorRequestHandler}
 */
export default (err, req, res , next) => {
  err.statusCode = err.statusCode || 500;
  const statusCode = err.statusCode;
  const errorCode = resolveErrorCode(statusCode, err.errorCode);
  const isServerError = statusCode >= 500;

  const retryAfter = err.errors?.retryAfter;
  if (statusCode === 429 && typeof retryAfter === 'number') {
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil(retryAfter))));
  }

  const responsePayload = {
    error_code: errorCode,
    message: isServerError ? 'An unexpected error occurred' : (err.message || 'Request failed'),
  };

  if (!isServerError && err.errors) {
    responsePayload.details = err.errors;
  }

  if (process.env.NODE_ENV === 'development') {
    responsePayload.details = {
      ...(responsePayload.details || {}),
      stack: err.stack,
      cause: err.cause,
    };
  }

  logger.error(err);

  return res.status(statusCode).json(responsePayload);
};
