/**
 * @fileoverview Auth Validators - Request validation for auth endpoints
 * @module validators/auth
 */

import { body, header } from "express-validator";
import { validateImageFile, validateJSONField, isValidUUID, validateToken, validateDeviceFingerprint } from "./common.js";

// Validation rules for OTP request
export const validateRequestOTP = [
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("ar-EG")
    .withMessage("Please provide a valid Egyptian phone number"),
  body("method")
    .trim()
    .notEmpty()
    .withMessage("OTP method is required")
    .isIn(["SMS", "WhatsApp"])
    .withMessage("Method must be either SMS or WhatsApp"),
];

// Validation rules for OTP verification
export const validateVerifyOTP = [
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("ar-EG")
    .withMessage("Please provide a valid Egyptian phone number"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP must be between 4 and 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
  body("method")
    .trim()
    .notEmpty()
    .withMessage("OTP method is required")
    .isIn(["SMS", "WhatsApp"])
    .withMessage("Method must be either SMS or WhatsApp"),
];

const userDataValidation = [
  body('userData.firstName')
    .trim()
    .notEmpty()
    .withMessage("userData.firstName is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("userData.firstName must be at least 2 characters long"),
  body('userData.middleName')
    .trim()
    .notEmpty()
    .withMessage("userData.middleName is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("userData.middleName must be at least 2 characters long"),
  body('userData.lastName')
    .trim()
    .notEmpty()
    .withMessage("userData.lastName is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("userData.lastName must be at least 2 characters long"),
  body('userData.governmentId')
    .trim()
    .notEmpty()
    .withMessage("userData.governmentId is required")
    .isUUID()
    .withMessage("userData.governmentId must be a valid UUID")
    .isLength({ min: 2, max: 50 })
    .withMessage("userData.governmentId must be at least 2 characters long"),
  body('userData.city')
    .trim()
    .notEmpty()
    .withMessage("userData.city is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("userData.city must be at least 2 characters long"),
];

const clientProfileValidation = [
  body('clientProfile.address')
    .trim()
    .notEmpty()
    .withMessage("clientProfile.address is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("clientProfile.address must be at least 2 characters long"),

  body('clientProfile.addressNotes')
    .trim(),
]

const workerProfileValidation = [
  body('workerProfile.specializationsTree')
  .notEmpty()
    .isArray()
    .custom((value, { req }) => {
      if (!value) {
        throw new Error('specializationsTree is required');
      } else if (!Array.isArray(value)) {
        throw new Error('specializationsTree must be an array');
      } else {
        value.forEach((item, index) => {
          if (!item.mainId) {
            throw new Error(`specializationsTree[${index}].mainId is required`);
          } else if (!isValidUUID(item.mainId)) {
            throw new Error(`specializationsTree[${index}].mainId must be a valid UUID`);
          }

          if (item.subIds) {
            if (!Array.isArray(item.subIds)) {
              throw new Error(`specializationsTree[${index}].subIds must be an array`);
            } else {
              item.subIds.forEach((subId, subIndex) => {
                if (!isValidUUID(subId)) {
                  throw new Error(`specializationsTree[${index}].subIds[${subIndex}] must be a valid UUID`);
                }
              });
            }
          }
        });
      }

      return true;
    }),
  body("workerProfile.experienceYears")
    .trim()
    .notEmpty()
    .withMessage("workerProfile.experienceYears is required")
    .isNumeric()
    .withMessage("workerProfile.experienceYears must be a number")
    .isInt({ min: 0, max: 50 })
    .withMessage("workerProfile.experienceYears must be between 0 and 50")
    .toInt(),
  body("workerProfile.isInTeam")
    .trim()
    .notEmpty()
    .withMessage("workerProfile.isInTeam is required")
    .isBoolean()
    .withMessage("workerProfile.isInTeam must be a boolean"),
  body("workerProfile.workGovernmentIds")
    .isArray()
  .notEmpty()
    .custom((value, { req }) => {
      // workGovernmentIds validation
      if (!value) {
        throw new Error('workGovernmentIds is required');
      } else if (!Array.isArray(value)) {
        throw new Error('workGovernmentIds must be an array');
      } else if (value.length === 0) {
        throw new Error('workGovernmentIds must contain at least one government ID');
      } else {
        value.forEach((govId, index) => {
          if (!isValidUUID(govId)) {
            throw new Error(`workGovernmentIds[${index}] must be a valid UUID`);
          }
        });
      }
      return true;
    }),
  body("workerProfile.acceptsUrgentJobs")
  .isBoolean()
  .notEmpty()
]

export const validateRegisterClient = [
  validateToken("register"),
  validateDeviceFingerprint(),

  // Validate file (optional)
  validateImageFile('personal_image', false),

  // Validate userData JSON
  ...userDataValidation,

  // Validate clientProfile JSON
  ...clientProfileValidation,

];

export const validateRegisterWorker = [
  validateToken("register"),
  validateDeviceFingerprint(),

  // Validate files
  validateImageFile('personal_image', true),
  validateImageFile('id_image', true),
  validateImageFile('personal_with_id_image', true),

  // Validate userData JSON
  ...userDataValidation,

  // Validate workerProfile JSON
  ...workerProfileValidation,
];

// Validation rules for login
export const validateLogin = [
  validateToken("login"),
  validateDeviceFingerprint()
];

// Validation rules for review status
export const validateReviewStatus = [
  validateToken("access"),
  validateDeviceFingerprint()
];

// Validation rules for generating access token
export const validateGenerateAccessToken = [
  validateToken("refresh"),
  validateDeviceFingerprint()
];

// Validation rules for logout
export const validateLogout = [
  validateToken("access"),
  validateDeviceFingerprint()
];
