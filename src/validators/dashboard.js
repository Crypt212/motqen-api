/**
 * @fileoverview User Validators - Request validation for user endpoints
 * @module validators/user
 */

import { body, param } from "express-validator";
import { optionalMainSpecializationValidation, optionalSpecializationsTreeValidation, optionalUserDataValidation, optionalWorkerProfileValidation, optionalWorkGovernmentsValidation, specializationsTreeValidation, workerProfileValidation, workGovernmentsValidation } from "./common.js";

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
  body("address")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body("clientProfile.address")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body().custom((_, { req }) => {
    const flatAddress = req.body?.address;
    const nestedAddress = req.body?.clientProfile?.address;

    if (!flatAddress && !nestedAddress) {
      throw new Error("address is required");
    }

    return true;
  }),
  body("addressNotes")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body("clientProfile.addressNotes")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
];

export const validateUpdateClientProfile = [
  body("address")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body("clientProfile.address")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body("addressNotes")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body("clientProfile.addressNotes")
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
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
