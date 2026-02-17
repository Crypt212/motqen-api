/**
 * @fileoverview User Validators - Request validation for user endpoints
 * @module validators/user
 */

import { body } from "express-validator";

/**
 * Validation rules for updating basic user info
 * @returns {Array} Validation chain
 */
export const validateUpdateBasicInfo = [
  body("phoneNumber")
    .optional()
    .trim()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number"),
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be 2-50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be 2-50 characters"),
  body("government")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Government cannot be empty"),
  body("city")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("City cannot be empty"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters"),
];

/**
 * Validation rules for updating worker info
 * @returns {Array} Validation chain
 */
export const validateUpdateWorkerInfo = [
  body("experienceYears")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years must be 0-50"),
  body("isInTeam")
    .optional()
    .isBoolean()
    .withMessage("isInTeam must be a boolean"),
  body("acceptsUrgentJobs")
    .optional()
    .isBoolean()
    .withMessage("acceptsUrgentJobs must be a boolean"),
  body("primarySpecialization")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Primary specialization is required"),
  body("secondarySpecializations")
    .optional()
    .isArray()
    .withMessage("Secondary specializations must be an array"),
  body("governments")
    .optional()
    .isArray()
    .withMessage("Governments must be an array"),
];
