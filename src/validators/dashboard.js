/**
 * @fileoverview User Validators - Request validation for user endpoints
 * @module validators/user
 */

import { param } from "express-validator";
import { clientProfileValidation, optionalClientProfileValidation, optionalMainSpecializationValidation, optionalSpecializationsTreeValidation, optionalUserDataValidation, optionalWorkerProfileValidation, optionalWorkGovernmentsValidation, specializationsTreeValidation, workerProfileValidation, workGovernmentsValidation } from "./common.js";

export const validateGetUser = [];

export const validateUpdateUser = [
  ...optionalUserDataValidation
];

export const validateGetWorkerProfile = [];

export const validateCreateWorkerProfile = [
  ...workerProfileValidation
];

export const validateDeleteWorkerProfile = [];

export const validateUpdateWorkerProfile = [
  ...optionalWorkerProfileValidation
];

export const validateGetClientProfile = [];

export const validateCreateClientProfile = [
  ...clientProfileValidation
];

export const validateUpdateClientProfile = [
  ...optionalClientProfileValidation
];

export const validateGetWorkerGovernments = [
];

export const validateAddWorkerGovernments = [
  workGovernmentsValidation()
];

export const validateDeleteWorkerGovernments = [
  param("all").optional().isBoolean(),
  optionalWorkGovernmentsValidation()
];

export const validateDeleteClientProfile = [];

export const validateGetWorkerSpecializations = [
];

export const validateAddWorkerSpecializations = [
  specializationsTreeValidation()
];

export const validateDeleteWorkerSpecializations = [
  param("all").optional().isBoolean(),
  param("allSub").optional().isBoolean(),
  optionalMainSpecializationValidation(),
  optionalSpecializationsTreeValidation(),
];
