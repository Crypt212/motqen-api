/**
 * @fileoverview Auth Validators - Request validation for auth endpoints
 * @module validators/auth
 */

import { body, header } from "express-validator";

/**
 * Validation rules for OTP request
 * @returns {Array} Validation chain
 */
export const validateRequestOTP = [
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number"),
  body("method")
    .trim()
    .notEmpty()
    .withMessage("Method is required")
    .isIn(["SMS", "WhatsApp"])
    .withMessage("Method must be SMS or WhatsApp"),
];

/**
 * Validation rules for OTP verification
 * @returns {Array} Validation chain
 */
export const validateVerifyOTP = [
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP must be 4-6 digits"),
  body("method")
    .trim()
    .notEmpty()
    .withMessage("Method is required")
    .isIn(["SMS", "WhatsApp"])
    .withMessage("Method must be SMS or WhatsApp"),
  body("deviceFingerprint")
    .trim()
    .notEmpty()
    .withMessage("Device fingerprint is required"),
];

/**
 * Validation rules for user registration
 * @returns {Array} Validation chain
 */
export const validateRegister = [
  body("registerToken")
    .trim()
    .notEmpty()
    .withMessage("Registration token is required"),
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be 2-50 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be 2-50 characters"),
  body("government")
    .trim()
    .notEmpty()
    .withMessage("Government is required"),
  body("city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters"),
];

/**
 * Validation rules for user login
 * @returns {Array} Validation chain
 */
export const validateLogin = [
  body("loginToken")
    .trim()
    .notEmpty()
    .withMessage("Login token is required"),
  body("deviceFingerprint")
    .trim()
    .notEmpty()
    .withMessage("Device fingerprint is required"),
];

/**
 * Validation rules for generating access token
 * @returns {Array} Validation chain
 */
export const validateGenerateAccessToken = [
  header("authorization")
    .notEmpty()
    .withMessage("Authorization header is required")
    .matches(/^Bearer .+/)
    .withMessage("Invalid authorization header format"),
  header("x-device-fingerprint")
    .trim()
    .notEmpty()
    .withMessage("Device fingerprint is required"),
];
