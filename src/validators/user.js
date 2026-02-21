/**
 * @fileoverview User Validators - Request validation for user endpoints
 * @module validators/user
 */

import { body, param } from "express-validator";

// Validation rules for updating user profile
export const validateUpdateUser = [
  body("firstName")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/)
    .withMessage("First name can only contain letters"),
  body("lastName")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/)
    .withMessage("Last name can only contain letters"),
  body("government")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Government must be between 2 and 100 characters"),
  body("city")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("City must be between 2 and 100 characters"),
  body("bio")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
  body("role")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isIn(["USER", "ADMIN"])
    .withMessage("Role must be either USER or ADMIN"),
];

// Validation rules for creating worker profile
export const validateCreateWorkerProfile = [
  body("experienceYears")
    .notEmpty()
    .withMessage("Experience years is required")
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years must be between 0 and 50"),
  body("isInTeam")
    .notEmpty()
    .withMessage("Team status is required")
    .isBoolean()
    .withMessage("isInTeam must be a boolean value")
    .custom((value) => {
      if (typeof value === "string") {
        const lowerValue = value.toLowerCase();
        if (lowerValue !== "true" && lowerValue !== "false") {
          throw new Error("isInTeam must be a boolean value");
        }
      }
      return true;
    }),
  body("acceptsUrgentJobs")
    .notEmpty()
    .withMessage("Urgent jobs acceptance status is required")
    .isBoolean()
    .withMessage("acceptsUrgentJobs must be a boolean value")
    .custom((value) => {
      if (typeof value === "string") {
        const lowerValue = value.toLowerCase();
        if (lowerValue !== "true" && lowerValue !== "false") {
          throw new Error("acceptsUrgentJobs must be a boolean value");
        }
      }
      return true;
    }),
  body("specializationNames")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage("Specialization names must be an array")
    .custom((value) => {
      if (value && value.length > 0) {
        for (const item of value) {
          if (typeof item !== "string" || item.trim().length === 0) {
            throw new Error("Each specialization name must be a non-empty string");
          }
        }
      }
      return true;
    }),
  body("subSpecializationNames")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage("Sub-specialization names must be an array")
    .custom((value) => {
      if (value && value.length > 0) {
        for (const item of value) {
          if (typeof item !== "string" || item.trim().length === 0) {
            throw new Error("Each sub-specialization name must be a non-empty string");
          }
        }
      }
      return true;
    }),
  body("governmentNames")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage("Government names must be an array")
    .custom((value) => {
      if (value && value.length > 0) {
        for (const item of value) {
          if (typeof item !== "string" || item.trim().length === 0) {
            throw new Error("Each government name must be a non-empty string");
          }
        }
      }
      return true;
    }),
];

// Validation rules for updating worker profile
export const validateUpdateWorkerProfile = [
  body("experienceYears")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years must be between 0 and 50"),
  body("isInTeam")
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean()
    .withMessage("isInTeam must be a boolean value")
    .custom((value) => {
      if (value !== undefined && value !== null) {
        if (typeof value === "string") {
          const lowerValue = value.toLowerCase();
          if (lowerValue !== "true" && lowerValue !== "false") {
            throw new Error("isInTeam must be a boolean value");
          }
        } else if (typeof value !== "boolean") {
          throw new Error("isInTeam must be a boolean value");
        }
      }
      return true;
    }),
  body("acceptsUrgentJobs")
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean()
    .withMessage("acceptsUrgentJobs must be a boolean value")
    .custom((value) => {
      if (value !== undefined && value !== null) {
        if (typeof value === "string") {
          const lowerValue = value.toLowerCase();
          if (lowerValue !== "true" && lowerValue !== "false") {
            throw new Error("acceptsUrgentJobs must be a boolean value");
          }
        } else if (typeof value !== "boolean") {
          throw new Error("acceptsUrgentJobs must be a boolean value");
        }
      }
      return true;
    }),
  body("specializationNames")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage("Specialization names must be an array")
    .custom((value) => {
      if (value && value.length > 0) {
        for (const item of value) {
          if (typeof item !== "string" || item.trim().length === 0) {
            throw new Error("Each specialization name must be a non-empty string");
          }
        }
      }
      return true;
    }),
  body("subSpecializationNames")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage("Sub-specialization names must be an array")
    .custom((value) => {
      if (value && value.length > 0) {
        for (const item of value) {
          if (typeof item !== "string" || item.trim().length === 0) {
            throw new Error("Each sub-specialization name must be a non-empty string");
          }
        }
      }
      return true;
    }),
  body("governmentNames")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage("Government names must be an array")
    .custom((value) => {
      if (value && value.length > 0) {
        for (const item of value) {
          if (typeof item !== "string" || item.trim().length === 0) {
            throw new Error("Each government name must be a non-empty string");
          }
        }
      }
      return true;
    }),
];

// Validation rules for profile image update
export const validateUpdateProfileImage = [
  body("file")
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error("Profile image is required");
      }
      return true;
    }),
];

// Validation rules for validating user ID parameter
export const validateUserIdParam = [
  param("id")
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage("Invalid user ID format"),
];
