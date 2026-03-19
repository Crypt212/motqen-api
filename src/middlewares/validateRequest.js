/**
 * @fileoverview Validation Middleware - Handle request validation
 * @module middlewares/validateRequest
 */

import { validationResult } from "express-validator";
import { logger } from "../libs/winston.js";

/**
 * Middleware to validate request using express-validator
 * @function validateRequest
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
export const validateRequest = (req, res, next) => {
  
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      type: err.type,
      message: err.msg,
    }));

    logger.info({code: 422, errors: formattedErrors });
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
    return;
  }
  next();
};
