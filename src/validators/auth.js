/**
 * @fileoverview Auth Validators - Request validation for auth endpoints
 * @module validators/auth
 */

import { body, header } from "express-validator";

/**
 * Validation rules for OTP request
 * @constant {Array<import('express-validator').ValidationChain>}
 */
export const requestOTPValidator = [
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('ar-EG')
    .withMessage('Please provide a valid Egyptian phone number'),
  body('method')
    .optional()
    .isIn(['SMS', 'WhatsApp'])
    .withMessage('Method must be either SMS or WhatsApp'),
];

/**
 * Validation rules for OTP verification
 * @constant {Array<import('express-validator').ValidationChain>}
 */
export const verifyOTPValidator = [
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('ar-EG')
    .withMessage('Please provide a valid Egyptian phone number'),
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 4, max: 6 })
    .withMessage('OTP must be 4-6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  body('method')
    .notEmpty()
    .withMessage('Method is required')
    .isIn(['SMS', 'WhatsApp'])
    .withMessage('Method must be either SMS or WhatsApp'),
];

/**
 * Validation rules for client registration
 * @constant {Array<import('express-validator').ValidationChain>}
 */
export const registerClientValidator = [
  body('registerToken')
    .trim()
    .notEmpty()
    .withMessage('Register token is required'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .isAlpha('ar-EG', { ignore: ' ' })
    .withMessage('First name must contain only letters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .isAlpha('ar-EG', { ignore: ' ' })
    .withMessage('Last name must contain only letters'),
  body('government')
    .trim()
    .notEmpty()
    .withMessage('Government is required')
    .isUUID()
    .withMessage('Government must be a valid UUID'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isUUID()
    .withMessage('City must be a valid UUID'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
];

/**
 * Validation rules for worker registration
 * @constant {Array<import('express-validator').ValidationChain>}
 */
export const registerWorkerValidator = [
  body('registerToken')
    .trim()
    .notEmpty()
    .withMessage('Register token is required'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .isAlpha('ar-EG', { ignore: ' ' })
    .withMessage('First name must contain only letters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .isAlpha('ar-EG', { ignore: ' ' })
    .withMessage('Last name must contain only letters'),
  body('government')
    .trim()
    .notEmpty()
    .withMessage('Government is required')
    .isUUID()
    .withMessage('Government must be a valid UUID'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isUUID()
    .withMessage('City must be a valid UUID'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('experienceYears')
    .notEmpty()
    .withMessage('Experience years is required')
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be between 0 and 50'),
  body('isInTeam')
    .notEmpty()
    .withMessage('isInTeam is required')
    .isBoolean()
    .withMessage('isInTeam must be a boolean'),
  body('acceptsUrgentJobs')
    .notEmpty()
    .withMessage('acceptsUrgentJobs is required')
    .isBoolean()
    .withMessage('acceptsUrgentJobs must be a boolean'),
  body('specializationNames')
    .notEmpty()
    .withMessage('Specialization names is required')
    .isArray({ min: 1 })
    .withMessage('Specialization names must be a non-empty array'),
  body('subSpecializationNames')
    .optional()
    .isArray()
    .withMessage('Sub specialization names must be an array'),
  body('workGovernmentNames')
    .notEmpty()
    .withMessage('Work government names is required')
    .isArray({ min: 1 })
    .withMessage('Work government names must be a non-empty array'),
];

/**
 * Validation rules for login
 * @constant {Array<import('express-validator').ValidationChain>}
 */
export const loginValidator = [
  body('loginToken')
    .trim()
    .notEmpty()
    .withMessage('Login token is required'),
  body('deviceFingerprint')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Device fingerprint cannot be empty'),
];

/**
 * Validation rules for generating access token
 * @constant {Array<import('express-validator').ValidationChain>}
 */
export const generateAccessTokenValidator = [
  header('x-device-fingerprint')
    .trim()
    .notEmpty()
    .withMessage('Device fingerprint header is required'),
  header('authorization')
    .notEmpty()
    .withMessage('Authorization header is required')
    .matches(/^Bearer .+/)
    .withMessage('Authorization header must be a Bearer token'),
];
