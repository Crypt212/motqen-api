/**
 * @fileoverview Auth Validators - Request validation for auth endpoints
 * @module validators/auth
 */

import { body, header } from "express-validator";

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

// Validation rules for client registration
export const validateRegisterClient = [
  body("registerToken")
    .trim()
    .notEmpty()
    .withMessage("Register token is required")
    .isJWT()
    .withMessage("Invalid register token format"),
  body("deviceFingerprint")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 8, max: 255 })
    .withMessage("Device fingerprint must be between 8 and 255 characters"),
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/)
    .withMessage("First name can only contain letters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
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
];

// Validation rules for worker registration
export const validateRegisterWorker = [
  body("registerToken")
    .trim()
    .notEmpty()
    .withMessage("Register token is required")
    .isJWT()
    .withMessage("Invalid register token format"),
  body("deviceFingerprint")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 8, max: 255 })
    .withMessage("Device fingerprint must be between 8 and 255 characters"),
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/)
    .withMessage("First name can only contain letters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
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
  body("experienceYears")
    .notEmpty()
    .withMessage("Experience years is required")
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience years must be between 0 and 50"),
  body("isInTeam")
    .notEmpty()
    .withMessage("Team status is required")
    .isBoolean()
    .withMessage("isInTeam must be a boolean value"),
  body("acceptsUrgentJobs")
    .notEmpty()
    .withMessage("Urgent jobs acceptance status is required")
    .isBoolean()
    .withMessage("acceptsUrgentJobs must be a boolean value"),
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
  body("workGovernmentNames")
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

// Validation rules for login
export const validateLogin = [
  body("loginToken")
    .trim()
    .notEmpty()
    .withMessage("Login token is required")
    .isJWT()
    .withMessage("Invalid login token format"),
  body("deviceFingerprint")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 8, max: 255 })
    .withMessage("Device fingerprint must be between 8 and 255 characters"),
];

// Validation rules for generating access token
export const validateGenerateAccessToken = [
  header("authorization")
    .trim()
    .notEmpty()
    .withMessage("Authorization header is required")
    .matches(/^Bearer\s/.test)
    .withMessage("Authorization header must be in format: Bearer <token>")
    .custom((value) => {
      const token = value.replace(/^Bearer\s/, "");
      if (!token || token.split(".").length !== 3) {
        throw new Error("Invalid refresh token format");
      }
      return true;
    }),
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
