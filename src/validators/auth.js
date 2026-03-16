/**
 * @fileoverview Auth Validators - Request validation for auth endpoints
 * @module validators/auth
 */

import { body } from "express-validator";
import {
  validateImageFile,
  validateToken,
  validateDeviceFingerprint,
  userDataValidation,
  clientProfileValidation,
  workerProfileValidation,
  createQueryValidator
} from "./common.js";

// ============================================
// Query Validation Configs
// ============================================

/**
 * Configuration for sessions query validation (admin)
 */
export const SESSIONS_QUERY_CONFIG = {
  allowedFilterFields: ['userId', 'deviceId', 'isRevoked'],
  filterFieldTypes: {
    userId: { type: 'uuid' },
    deviceId: { type: 'string', minLength: 1, maxLength: 255 },
    isRevoked: { type: 'boolean' }
  },
  allowedOrderByFields: ['createdAt', 'lastUsedAt', 'expiresAt'],
  allowedSearchFields: []
};

/**
 * Configuration for users query validation (admin)
 */
export const USERS_QUERY_CONFIG = {
  allowedFilterFields: ['role', 'status', 'phoneNumber', 'governmentId', 'cityId'],
  filterFieldTypes: {
    role: { type: 'enum', enumValues: ['USER', 'ADMIN', 'SUPER_ADMIN'] },
    status: { type: 'enum', enumValues: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'] },
    phoneNumber: { type: 'string', minLength: 10, maxLength: 15 },
    governmentId: { type: 'uuid' },
    cityId: { type: 'uuid' }
  },
  allowedOrderByFields: ['createdAt', 'updatedAt', 'firstName', 'lastName', 'phoneNumber'],
  allowedSearchFields: ['firstName', 'lastName', 'phoneNumber']
};

// ============================================
// Validation Rules
// ============================================

// Validation rules for OTP request
export const validateRequestOTP = [
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("ar-EG")
    .withMessage("Please provide a valid Egyptian phone number")
    .customSanitizer(value => value.replace(/^\+20/g, '0')),
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
    .withMessage("Please provide a valid Egyptian phone number")
    .customSanitizer(value => value.replace(/^\+20/g, '0')),
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

// Validation rules for client registration
export const validateRegisterClient = [
  validateToken("register"),
  validateDeviceFingerprint(),
  validateImageFile('personal_image', false),
  ...userDataValidation("", true),
  ...clientProfileValidation("", true),
];

// Validation rules for worker registration
export const validateRegisterWorker = [
  validateToken("register"),
  validateDeviceFingerprint(),
  validateImageFile('personal_image', true),
  validateImageFile('id_image', true),
  validateImageFile('personal_with_id_image', true),
  ...userDataValidation("", true),
  ...workerProfileValidation("", true),
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

// ============================================
// Admin Query Validators (for future admin endpoints)
// ============================================

/**
 * Validator for listing sessions with pagination/filtering (admin)
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateListSessions = [
  ...createQueryValidator(SESSIONS_QUERY_CONFIG)
];

/**
 * Validator for listing users with pagination/filtering (admin)
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateListUsers = [
  ...createQueryValidator(USERS_QUERY_CONFIG)
];
