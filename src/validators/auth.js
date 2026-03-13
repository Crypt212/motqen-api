/**
 * @fileoverview Auth Validators - Request validation for auth endpoints
 * @module validators/auth
 */

import { body } from "express-validator";
import { validateImageFile, validateToken, validateDeviceFingerprint, userDataValidation, clientProfileValidation, workerProfileValidation } from "./common.js";

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


export const validateRegisterClient = [
  validateToken("register"),
  validateDeviceFingerprint(),
  validateImageFile('personal_image', false),
  ...userDataValidation("", true),
  ...clientProfileValidation("", true),

];

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
