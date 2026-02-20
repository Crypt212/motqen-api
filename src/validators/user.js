/**
 * @fileoverview User Validators - Request validation for user endpoints
 * @module validators/user
 */

import { body } from "express-validator";

/**
 * Validation rules for updating user basic info
 * @constant {Array<import('express-validator').ValidationChain>}
 */
export const updateUserValidator = [
  body('role')
    .optional()
    .isIn(['USER', 'ADMIN'])
    .withMessage('Role must be either USER or ADMIN'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .isAlpha('ar-EG', { ignore: ' ' })
    .withMessage('First name must contain only letters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .isAlpha('ar-EG', { ignore: ' ' })
    .withMessage('Last name must contain only letters'),
  body('government')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Government must be a valid UUID'),
  body('city')
    .optional()
    .trim()
    .isUUID()
    .withMessage('City must be a valid UUID'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
];

/**
 * Validation rules for updating worker info
 * @constant {Array<import('express-validator').ValidationChain>}
 */
export const updateWorkerInfoValidator = [
  body('experienceYears')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be between 0 and 50'),
  body('isInTeam')
    .optional()
    .isBoolean()
    .withMessage('isInTeam must be a boolean'),
  body('acceptsUrgentJobs')
    .optional()
    .isBoolean()
    .withMessage('acceptsUrgentJobs must be a boolean'),
];
