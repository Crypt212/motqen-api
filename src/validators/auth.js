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

export const validateRegisterClient = [
  validateToken("register"),
  validateDeviceFingerprint(),

  // Validate file (optional)
  validateImageFile('personal_image', false),

  // Validate userData JSON
  validateJSONField('userData', true)
    .custom((basicInfo) => {
      const errors = [];

      // firstName validation
      if (!basicInfo.firstName) {
        errors.push('firstName is required');
      } else if (typeof basicInfo.firstName !== 'string') {
        errors.push('firstName must be a string');
      } else if (basicInfo.firstName.trim().length < 2) {
        errors.push('firstName must be at least 2 characters long');
      }

      // middleName validation
      if (!basicInfo.middleName) {
        errors.push('middleName is required');
      } else if (typeof basicInfo.middleName !== 'string') {
        errors.push('middleName must be a string');
      } else if (basicInfo.middleName.trim().length < 2) {
        errors.push('middleName must be at least 2 characters long');
      }

      // lastName validation
      if (!basicInfo.lastName) {
        errors.push('lastName is required');
      } else if (typeof basicInfo.lastName !== 'string') {
        errors.push('lastName must be a string');
      } else if (basicInfo.lastName.trim().length < 2) {
        errors.push('lastName must be at least 2 characters long');
      }

      // governmentId validation (UUID)
      if (!basicInfo.governmentId) {
        errors.push('governmentId is required');
      } else if (!isValidUUID(basicInfo.governmentId)) {
        errors.push('governmentId must be a valid UUID');
      }

      // city validation
      if (!basicInfo.city) {
        errors.push('city is required');
      } else if (typeof basicInfo.city !== 'string') {
        errors.push('city must be a string');
      } else if (basicInfo.city.trim().length < 2) {
        errors.push('city must be at least 2 characters long');
      }

      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      return true;
    }),

  // Validate clientProfile JSON
  validateJSONField('clientProfile', true)
    .custom((clientProfile) => {
      const errors = [];

      // address validation
      if (!clientProfile.address) {
        errors.push('address is required');
      } else if (typeof clientProfile.address !== 'string') {
        errors.push('address must be a string');
      } else if (clientProfile.address.trim().length < 1) {
        errors.push('address must be at least 5 characters long');
      }

      // addressNotes validation (optional)
      if (clientProfile.addressNotes !== undefined &&
          clientProfile.addressNotes !== null &&
          typeof clientProfile.addressNotes !== 'string') {
        errors.push('addressNotes must be a string');
      }

      // Check for extra fields in clientProfile
      const allowedProfileFields = ['address', 'addressNotes'];
      const receivedProfileFields = Object.keys(clientProfile);
      const extraProfileFields = receivedProfileFields.filter(
        field => !allowedProfileFields.includes(field)
      );

      if (extraProfileFields.length > 0) {
        errors.push(`Unexpected fields in clientProfile: ${extraProfileFields.join(', ')}`);
      }

      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      return true;
    }),

  // Validate that no extra top-level fields are sent
  body().custom((value, { req }) => {
    const allowedFields = [
      'personal_image',
      'userData',
      'clientProfile'
    ];

    const receivedFields = Object.keys(req.body);
    const extraFields = receivedFields.filter(field => !allowedFields.includes(field));

    if (extraFields.length > 0) {
      throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
    }

    return true;
  })
];

export const validateRegisterWorker = [
  validateToken("register"),
  validateDeviceFingerprint(),

  // Validate files
  validateImageFile('personal_image', true),
  validateImageFile('id_image', true),
  validateImageFile('personal_with_id_image', true),

  // Validate userData JSON
  validateJSONField('userData', true)
    .custom((basicInfo) => {
      const errors = [];

      // firstName validation
      if (!basicInfo.firstName) {
        errors.push('firstName is required');
      } else if (typeof basicInfo.firstName !== 'string') {
        errors.push('firstName must be a string');
      } else if (basicInfo.firstName.trim().length < 2) {
        errors.push('firstName must be at least 2 characters long');
      }

      // middleName validation
      if (!basicInfo.middleName) {
        errors.push('middleName is required');
      } else if (typeof basicInfo.middleName !== 'string') {
        errors.push('middleName must be a string');
      } else if (basicInfo.middleName.trim().length < 2) {
        errors.push('middleName must be at least 2 characters long');
      }

      // lastName validation
      if (!basicInfo.lastName) {
        errors.push('lastName is required');
      } else if (typeof basicInfo.lastName !== 'string') {
        errors.push('lastName must be a string');
      } else if (basicInfo.lastName.trim().length < 2) {
        errors.push('lastName must be at least 2 characters long');
      }

      // governmentId validation (UUID)
      if (!basicInfo.governmentId) {
        errors.push('governmentId is required');
      } else if (!isValidUUID(basicInfo.governmentId)) {
        errors.push('governmentId must be a valid UUID');
      }

      // city validation
      if (!basicInfo.city) {
        errors.push('city is required');
      } else if (typeof basicInfo.city !== 'string') {
        errors.push('city must be a string');
      } else if (basicInfo.city.trim().length < 2) {
        errors.push('city must be at least 2 characters long');
      }

      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      return true;
    }),

  // Validate workerProfile JSON
  validateJSONField('workerProfile', true)
    .custom((workerProfile) => {
      const errors = [];

      // specializationsTree validation
      if (!workerProfile.specializationsTree) {
        errors.push('specializationsTree is required');
      } else if (!Array.isArray(workerProfile.specializationsTree)) {
        errors.push('specializationsTree must be an array');
      } else {
        workerProfile.specializationsTree.forEach((item, index) => {
          if (!item.mainId) {
            errors.push(`specializationsTree[${index}].mainId is required`);
          } else if (!isValidUUID(item.mainId)) {
            errors.push(`specializationsTree[${index}].mainId must be a valid UUID`);
          }

          if (item.subIds) {
            if (!Array.isArray(item.subIds)) {
              errors.push(`specializationsTree[${index}].subIds must be an array`);
            } else {
              item.subIds.forEach((subId, subIndex) => {
                if (!isValidUUID(subId)) {
                  errors.push(`specializationsTree[${index}].subIds[${subIndex}] must be a valid UUID`);
                }
              });
            }
          }
        });
      }

      // experienceYears validation
      if (workerProfile.experienceYears === undefined || workerProfile.experienceYears === null) {
        errors.push('experienceYears is required');
      } else if (typeof workerProfile.experienceYears !== 'number') {
        errors.push('experienceYears must be a number');
      } else if (workerProfile.experienceYears < 0) {
        errors.push('experienceYears cannot be negative');
      } else if (workerProfile.experienceYears > 50) {
        errors.push('experienceYears cannot exceed 50 years');
      }

      // isInTeam validation
      if (workerProfile.isInTeam === undefined || workerProfile.isInTeam === null) {
        errors.push('isInTeam is required');
      } else if (typeof workerProfile.isInTeam !== 'boolean') {
        errors.push('isInTeam must be a boolean');
      }

      // workGovernmentIds validation
      if (!workerProfile.workGovernmentIds) {
        errors.push('workGovernmentIds is required');
      } else if (!Array.isArray(workerProfile.workGovernmentIds)) {
        errors.push('workGovernmentIds must be an array');
      } else if (workerProfile.workGovernmentIds.length === 0) {
        errors.push('workGovernmentIds must contain at least one government ID');
      } else {
        workerProfile.workGovernmentIds.forEach((govId, index) => {
          if (!isValidUUID(govId)) {
            errors.push(`workGovernmentIds[${index}] must be a valid UUID`);
          }
        });
      }

      // acceptsUrgentJobs validation
      if (!("acceptsUrgentJobs" in workerProfile)) {
        errors.push('acceptsUrgentJobs is required');
      } else if (typeof workerProfile.acceptsUrgentJobs !== 'boolean') {
        errors.push('acceptsUrgentJobs must be a boolean');
      }
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      return true;
    }),

  // Optional: Validate that no extra fields are sent
  body().custom((value, { req }) => {
    const allowedFields = [
      'personal_image',
      'id_image',
      'personal_with_id_image',
      'userData',
      'workerProfile'
    ];

    const receivedFields = Object.keys(req.body);
    const extraFields = receivedFields.filter(field => !allowedFields.includes(field));

    if (extraFields.length > 0) {
      throw new Error(`Unexpected fields: ${extraFields.join(', ')}`);
    }

    return true;
  })
];

// Validation rules for login
export const validateLogin = [
  validateToken("login"),
  body("deviceFingerprint")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 8, max: 255 })
    .withMessage("Device fingerprint must be between 8 and 255 characters"),
];

// Validation rules for review status
export const validateReviewStatus = [
  validateToken("refresh"),
  header("x-device-fingerprint")
    .trim()
    .notEmpty()
    .withMessage("Device fingerprint header is required")
    .isLength({ min: 8, max: 255 })
    .withMessage("Device fingerprint must be between 8 and 255 characters"),
];

// Validation rules for generating access token
export const validateGenerateAccessToken = [
  validateToken("refresh"),
  header("x-device-fingerprint")
    .trim()
    .notEmpty()
    .withMessage("Device fingerprint header is required")
    .isLength({ min: 8, max: 255 })
    .withMessage("Device fingerprint must be between 8 and 255 characters"),
];

// Validation rules for logout
export const validateLogout = [
  header("x-device-fingerprint")
    .trim()
    .notEmpty()
    .withMessage("Device fingerprint header is required")
    .isLength({ min: 8, max: 255 })
    .withMessage("Device fingerprint must be between 8 and 255 characters"),
];
