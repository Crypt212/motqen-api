import { logger } from "../libs/winston.js";
import RepositoryError from "../errors/RepositoryError.js";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import AppError from "src/errors/AppError.js";
import OperationalError from "src/errors/OperationalError.js";
import environment from "src/configs/environment.js";
import ValidationError from "src/errors/ValidationError.js";

const errorHandler: ErrorRequestHandler = function(err: any, _: Request, res: Response, __: NextFunction) {
  logger.info(err);

  if (!(err instanceof Error)) {
    return res.status(500).json({
      status: 'error',
      message: 'Bad error format',
    });
  }

  // Handle RepositoryError - extract status code from the error
  if (err instanceof RepositoryError) {
    return res.status(500).json({
      message: "Database error: " + err.code + environment.nodeEnv === "development" ? " - Details: " + err.message : "",
      stack: environment.nodeEnv === "development" ? err.stack : undefined,
    });
  }

  if (!(err instanceof OperationalError)) {
    // unknown error
    return res.status(500).json({
      message: err.message,
      stack: environment.nodeEnv === "development" ? err.stack : undefined,
    });
  }

  if (err instanceof ValidationError) {
    return res.status(422).json({
      message: err.message,
      issues: err.issues,
      stack: environment.nodeEnv === "development" ? err.stack : undefined,
    });
  } else if (err instanceof AppError) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (err.statusCode === 429) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil(err.retryAfter))));
    }

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: environment.nodeEnv === "development" ? err.stack : undefined,
    });
  }

  return res.status(500).json({
      status: 'error',
      message: 'WTH is this error?!',
    });
};

export default errorHandler;
