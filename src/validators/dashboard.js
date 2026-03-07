/**
 * @fileoverview User Validators - Request validation for user endpoints
 * @module validators/user
 */

import { param, query } from "express-validator";
import { clientProfileValidation, userDataValidation, specializationsTreeValidation, workerProfileValidation, workGovernmentsValidation, mainSpecializationValidation, paginationValidation } from "./common.js";

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetUser = [];

/** @type {import('express-validator').ValidationChain[]} */
export const validateUpdateUser = [
  ...userDataValidation("", false)
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetWorkerProfile = [
  ...paginationValidation(),
  query("fields")
    .optional()
    .isString()
    .withMessage("fields must be a comma-separated string")
    .customSanitizer((value) => value ? value.split(",").map(f => f.trim()) : undefined),
  query("include")
    .optional()
    .isString()
    .withMessage("include must be a comma-separated string")
    .customSanitizer((value) => value ? value.split(",").map(i => i.trim()) : undefined),
];

export const validateCreateWorkerProfile = [
  ...workerProfileValidation("", true)
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateDeleteWorkerProfile = [];

/** @type {import('express-validator').ValidationChain[]} */
export const validateUpdateWorkerProfile = [
  ...workerProfileValidation("", false)
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetClientProfile = [];

/** @type {import('express-validator').ValidationChain[]} */
export const validateCreateClientProfile = [
  ...clientProfileValidation("", true)
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateUpdateClientProfile = [
  ...clientProfileValidation("", false)
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetWorkerGovernments = [
  ...paginationValidation(),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateAddWorkerGovernments = [
  workGovernmentsValidation("", false)
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateDeleteWorkerGovernments = [
  param("all").optional().isBoolean(),
  workGovernmentsValidation("", false)
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateDeleteClientProfile = [];

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetWorkerSpecializations = [
  ...paginationValidation(),
  mainSpecializationValidation("", false),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateAddWorkerSpecializations = [
  specializationsTreeValidation("", false)
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateDeleteWorkerSpecializations = [
  param("all").optional().isBoolean(),
  param("allSub").optional().isBoolean(),
  mainSpecializationValidation("", false),
  specializationsTreeValidation("", false),
];
