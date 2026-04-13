import { logger } from '../libs/winston.js';
import RepositoryError from '../errors/RepositoryError.js';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import AppError from '../errors/AppError.js';
import OperationalError from '../errors/OperationalError.js';
import environment from '../configs/environment.js';
import ValidationError from '../errors/ValidationError.js';

const errorHandler: ErrorRequestHandler = function (
  err: unknown,
  _: Request,
  res: Response,
  __: NextFunction
) {
  logger.info(err);

  if (!(err instanceof Error)) {
    return res.status(500).json({
      status: 'error',
      message: 'Bad error format',
      details: null,
    });
  }

  // Handle RepositoryError - extract status code from the error
  if (err instanceof RepositoryError) {
    return res.status(500).json({
      status: 'error',
      message:
        'Database error: ' +
        err.code +
        (environment.nodeEnv === 'development' ? ' - Details: ' + err.message : ''),
      details: null,
      stack: environment.nodeEnv === 'development' ? err.stack : undefined,
    });
  }

  if (!(err instanceof OperationalError)) {
    // unknown error
    return res.status(500).json({
      status: 'error',
      message: err.message,
      details: null,
      stack: environment.nodeEnv === 'development' ? err.stack : undefined,
    });
  }

  if (err instanceof ValidationError) {
    return res.status(422).json({
      status: 'error',
      message: err.message,
      details: null,
      stack: environment.nodeEnv === 'development' ? err.stack : undefined,
    });
  } else if (err instanceof AppError) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (err.statusCode === 429) {
      const details = err.details && err.details.toJSON();
      if (details && 'retryAfter' in details && typeof details.retryAfter === 'number') {
        res.setHeader('Retry-After', String(Math.max(1, Math.ceil(details.retryAfter))));
      }
    }

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      details: err.details && err.details.toJSON(),
      stack: environment.nodeEnv === 'development' ? err.stack : undefined,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Bad Error format',
    details: null,
  });
};

export default errorHandler;
