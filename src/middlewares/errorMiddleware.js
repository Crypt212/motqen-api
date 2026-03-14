/**
 * @fileoverview Error Handler Middleware - Global error handling for Express
 * @module middlewares/errorMiddleware
 */

import { logger } from "../libs/winston.js";
import RepositoryError from "../errors/RepositoryError.js";

/**
 * Error handler middleware
 * @type {import("express").ErrorRequestHandler}
 */
export default (err, req, res, next) => {
  logger.info(err);

  // Handle RepositoryError - extract status code from the error
  if (err instanceof RepositoryError) {
    err.code = err.getStatusCode();
    err.status = String(err.statusCode).startsWith('4') ? 'fail' : 'error';
    err.isOperational = true;
  }


  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const retryAfter = err.errors?.retryAfter;
  if (err.statusCode === 429 && typeof retryAfter === 'number') {
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil(retryAfter))));
  }


  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // production
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err.errors || err.info || {},
    });
  }

  logger.error(err);

  // unknown error
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',

  });
};
