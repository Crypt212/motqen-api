/**
 * @fileoverview User Validators - Request validation for user endpoints
 * @module validators/user
 */

import { body, param } from "express-validator";

/**
 * Validation rules for updating user basic info
 */
export const updateUserValidators = [
  body("role")
    .optional()
    .isIn(["USER", "ADMIN"])
    .withMessage("Role must be either USER or ADMIN"),
  body("firstName")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("First name must be between 1 and 100 characters"),
  body("lastName")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Last name must be between 1 and 100 characters"),
  body("government")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Government name is required"),
  body("city")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("City name is required"),
  body("bio")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters"),
];

/**
 * Validation rules for updating worker profile
 */
export const updateWorkerProfileValidators = [
  body("experienceYears")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years must be between 0 and 50"),
  body("isInTeam")
    .optional()
    .isBoolean()
    .withMessage("isInTeam must be a boolean"),
  body("acceptsUrgentJobs")
    .optional()
    .isBoolean()
    .withMessage("acceptsUrgentJobs must be a boolean"),
];

/**
 * Validation rules for creating worker profile
 */
export const createWorkerProfileValidators = [
  body("experienceYears")
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years is required and must be between 0 and 50"),
  body("isInTeam")
    .isBoolean()
    .withMessage("isInTeam is required and must be a boolean"),
  body("acceptsUrgentJobs")
    .isBoolean()
    .withMessage("acceptsUrgentJobs is required and must be a boolean"),
  body("specializationNames")
    .isArray({ min: 1 })
    .withMessage("specializationNames is required and must be a non-empty array"),
  body("specializationNames.*")
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Each specialization name must be a non-empty string"),
  body("subSpecializationNames")
    .optional()
    .isArray()
    .withMessage("subSpecializationNames must be an array"),
  body("subSpecializationNames.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Each sub-specialization name must be a non-empty string"),
  body("governmentNames")
    .isArray({ min: 1 })
    .withMessage("governmentNames is required and must be a non-empty array"),
  body("governmentNames.*")
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Each government name must be a non-empty string"),
];

/**
 * Validation rules for creating client profile
 * (Currently no required fields for client profile)
 */
export const createClientProfileValidators = [];

/**
 * Validation rules for updating client profile
 * (Currently no fields to update)
 */
export const updateClientProfileValidators = [];

/**
 * Validation rules for profile image upload
 */
export const updateProfileImageValidators = [
  param("userId")
    .optional()
    .isUUID()
    .withMessage("User ID must be a valid UUID"),
];
