/**
 * @fileoverview Government Validators - Request validation for government endpoints
 * @module validators/government
 */

import { param, body } from 'express-validator';
import {
  createQueryValidator,
  isValidUUID,
  governmentNameValidation,
  cityNameValidation,
  validateField,
} from './common.js';

// ============================================
// Query Validation Configs
// ============================================

/**
 * Configuration for governments query validation
 */
export const GOVERNMENT_QUERY_CONFIG = {
  allowedFilterFields: ['id', 'name', 'nameAr'],
  filterFieldTypes: {
    id: { type: 'uuid' },
    name: { type: 'string', minLength: 2, maxLength: 100 },
    nameAr: { type: 'string', minLength: 2, maxLength: 100 },
  },
  allowedOrderByFields: ['createdAt', 'id', 'name', 'nameAr'],
  allowedSearchFields: ['id', 'name', 'nameAr'],
};

/**
 * Configuration for cities query validation
 */
export const CITY_QUERY_CONFIG = {
  allowedFilterFields: ['id', 'governmentId', 'name', 'nameAr'],
  filterFieldTypes: {
    id: { type: 'uuid' },
    name: { type: 'string', minLength: 2, maxLength: 100 },
    nameAr: { type: 'string', minLength: 2, maxLength: 100 },
    governmentId: { type: 'uuid' },
  },
  allowedOrderByFields: ['createdAt', 'governmentId', 'id', 'name', 'nameAr'],
  allowedSearchFields: ['id', 'governmentId', 'name', 'nameAr'],
};

// ============================================
// Helper Validators
// ============================================

/**
 * Validates government nameAr field
 * @param {string} prefix - Prefix for the field name
 * @param {boolean} required - Whether the field is required
 * @returns {import('express-validator').ValidationChain}
 */
const governmentNameArValidation = (prefix, required = false) => {
  const fieldName = prefix + 'nameAr';
  return validateField(fieldName, required)
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('nameAr must be between 2 and 100 characters');
};

/**
 * Validates government longitude field
 * @param {string} prefix - Prefix for the field name
 * @param {boolean} required - Whether the field is required
 * @returns {import('express-validator').ValidationChain}
 */
const governmentLongValidation = (prefix, required = false) => {
  const fieldName = prefix + 'long';
  return validateField(fieldName, required)
    .trim()
    .custom((value) => {
      const n = Number(value);
      return Number.isFinite(n) && n >= -180 && n <= 180;
    })
    .withMessage('long must be between -180 and 180');
};

/**
 * Validates government latitude field
 * @param {string} prefix - Prefix for the field name
 * @param {boolean} required - Whether the field is required
 * @returns {import('express-validator').ValidationChain}
 */
const governmentLatValidation = (prefix, required = false) => {
  const fieldName = prefix + 'lat';
  return validateField(fieldName, required)
    .trim()
    .custom((value) => {
      const n = Number(value);
      return Number.isFinite(n) && n >= -90 && n <= 90;
    })
    .withMessage('lat must be between -90 and 90');
};

/**
 * Validates city nameAr field
 * @param {string} prefix - Prefix for the field name
 * @param {boolean} required - Whether the field is required
 * @returns {import('express-validator').ValidationChain}
 */
const cityNameArValidation = (prefix, required = false) => {
  const fieldName = prefix + 'nameAr';
  return validateField(fieldName, required)
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('nameAr must be between 2 and 100 characters');
};

/**
 * Validates city longitude field
 * @param {string} prefix - Prefix for the field name
 * @param {boolean} required - Whether the field is required
 * @returns {import('express-validator').ValidationChain}
 */
const cityLongValidation = (prefix, required = false) => {
  const fieldName = prefix + 'long';
  return validateField(fieldName, required)
    .trim()
    .matches(/^-?\d+(\.\d+)?$/)
    .withMessage('long must be a valid longitude coordinate');
};

/**
 * Validates city latitude field
 * @param {string} prefix - Prefix for the field name
 * @param {boolean} required - Whether the field is required
 * @returns {import('express-validator').ValidationChain}
 */
const cityLatValidation = (prefix, required = false) => {
  const fieldName = prefix + 'lat';
  return validateField(fieldName, required)
    .trim()
    .matches(/^-?\d+(\.\d+)?$/)
    .withMessage('lat must be a valid latitude coordinate');
};

// ============================================
// Government Validators
// ============================================

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetGovernments = [
  ...createQueryValidator(GOVERNMENT_QUERY_CONFIG),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetGovernmentById = [param('id').custom(isValidUUID)];

/** @type {import('express-validator').ValidationChain[]} */
export const validateCreateGovernment = [
  governmentNameValidation('', true),
  governmentNameArValidation('', true),
  governmentLongValidation('', true),
  governmentLatValidation('', true),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateUpdateGovernment = [
  governmentNameValidation('', false),
  governmentNameArValidation('', false),
  governmentLongValidation('', false),
  governmentLatValidation('', false),
  param('id').custom(isValidUUID),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateDeleteGovernment = [param('id').custom(isValidUUID)];

// ============================================
// City Validators
// ============================================

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetCities = [...createQueryValidator(CITY_QUERY_CONFIG)];

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetCityById = [param('id').custom(isValidUUID)];

/** @type {import('express-validator').ValidationChain[]} */
export const validateCreateCity = [
  cityNameValidation('', true),
  cityNameArValidation('', true),
  cityLongValidation('', true),
  cityLatValidation('', true),
  body('governmentId')
    .notEmpty()
    .withMessage('governmentId is required')
    .isUUID()
    .withMessage('governmentId must be a valid UUID'),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateUpdateCity = [
  cityNameValidation('', false),
  cityNameArValidation('', false),
  cityLongValidation('', false),
  cityLatValidation('', false),
  param('id').custom(isValidUUID),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateDeleteCity = [param('id').custom(isValidUUID)];
