/**
 * @fileoverview User Validators - Request validation for user endpoints
 * @module validators/user
 */

import { body, param } from "express-validator";
import { isValidUUID } from "./common.js";

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
  body("governmentId")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && !isValidUUID(value)) {
        throw new Error("governmentId must be a valid UUID");
      }
      return true;
    }),
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
  body("specializationsTree")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage("specialization tree must be an array of { mainId: string, subIds: string[] }")
    .custom((value) => {
      let valid = true;
      if (!value || value.length == 0) valid = false;

      for (const item of value) {
        if (!item) { valid = false; break; }
        if (!("mainId" in Object.keys(item)) || typeof item.mainId !== "string" || item.mainId.trim().length === 0) { valid = false; break; }

        if (!("subIds" in Object.keys(item)) || !Array.isArray(item.subIds)) { valid = false; break; }
        for (const subId of item.subIds) {
          if (typeof subId !== "string" || subId.trim().length === 0) { valid = false; break; }
        }
      }
      if (!valid) {
        throw new Error("specialization tree must be an array of { mainId: string, subIds: string[] }");
      }
      return true;
    }),
  body("workGovernmentIds")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage("Work government names must be an array")
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
  body("specializationsTree")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage("specialization tree must be an array of { mainId: string, subIds: string[] }")
    .custom((value) => {
      let valid = true;
      if (!value || value.length == 0) valid = false;

      for (const item of value) {
        if (!item) { valid = false; break; }
        if (!("mainId" in Object.keys(item)) || typeof item.mainId !== "string" || item.mainId.trim().length === 0) { valid = false; break; }

        if (!("subIds" in Object.keys(item)) || !Array.isArray(item.subIds)) { valid = false; break; }
        for (const subId of item.subIds) {
          if (typeof subId !== "string" || subId.trim().length === 0) { valid = false; break; }
        }
      }
      if (!valid) {
        throw new Error("specialization tree must be an array of { mainId: string, subIds: string[] }");
      }
      return true;
    }),
  body("workGovernmentIds")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage("Work government names must be an array")
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

// Validation rules for creating client profile
export const validateCreateClientProfile = [
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Address must be between 5 and 500 characters"),
  body("addressNotes")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address notes cannot exceed 500 characters"),
];

// Validation rules for updating client profile
export const validateUpdateClientProfile = [
  body("address")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Address must be between 5 and 500 characters"),
  body("addressNotes")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address notes cannot exceed 500 characters"),
];

// Validation rules for adding worker governments
export const validateAddWorkerGovernments = [
  body("governmentIds")
    .isArray({ min: 1 })
    .withMessage("governmentIds must be a non-empty array")
    .custom((value) => {
      for (let i = 0; i < value.length; i++) {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value[i])) {
          throw new Error(`governmentIds[${i}] must be a valid UUID`);
        }
      }
      return true;
    }),
];

// Validation rules for deleting worker governments
export const validateDeleteWorkerGovernments = validateAddWorkerGovernments;

// Validation rules for adding worker specializations
export const validateAddWorkerSpecializations = [
  body("specializationTree")
    .isArray({ min: 1 })
    .withMessage("specializationTree must be a non-empty array")
    .custom((value) => {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!item || typeof item !== 'object') {
          throw new Error(`specializationTree[${i}] must be an object`);
        }
        if (!item.mainId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.mainId)) {
          throw new Error(`specializationTree[${i}].mainId must be a valid UUID`);
        }
        if (item.subIds) {
          if (!Array.isArray(item.subIds)) {
            throw new Error(`specializationTree[${i}].subIds must be an array`);
          }
          for (let j = 0; j < item.subIds.length; j++) {
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.subIds[j])) {
              throw new Error(`specializationTree[${i}].subIds[${j}] must be a valid UUID`);
            }
          }
        }
      }
      return true;
    }),
];

// Validation rules for deleting worker specializations
export const validateDeleteWorkerSpecializations = [
  body("mainSpecializationIds")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage("mainSpecializationIds must be an array")
    .custom((value) => {
      if (value) {
        for (let i = 0; i < value.length; i++) {
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value[i])) {
            throw new Error(`mainSpecializationIds[${i}] must be a valid UUID`);
          }
        }
      }
      return true;
    }),
  body("specializationTree")
    .optional({ nullable: true, checkFalsy: true })
    .isArray()
    .withMessage("specializationTree must be an array")
    .custom((value) => {
      if (value) {
        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          if (!item || typeof item !== 'object') {
            throw new Error(`specializationTree[${i}] must be an object`);
          }
          if (!item.mainId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.mainId)) {
            throw new Error(`specializationTree[${i}].mainId must be a valid UUID`);
          }
          if (item.subIds) {
            if (!Array.isArray(item.subIds)) {
              throw new Error(`specializationTree[${i}].subIds must be an array`);
            }
            for (let j = 0; j < item.subIds.length; j++) {
              if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.subIds[j])) {
                throw new Error(`specializationTree[${i}].subIds[${j}] must be a valid UUID`);
              }
            }
          }
        }
      }
      return true;
    }),
];
