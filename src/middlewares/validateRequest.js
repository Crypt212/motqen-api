/**
 * @fileoverview Validation Middleware - Handle request validation
 * @module middlewares/validateRequest
 */

import { validationResult } from "express-validator";

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

    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
    return;
  }
  next();
};
