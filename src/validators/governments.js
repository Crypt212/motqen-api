/**
 * @fileoverview Government Validators - Request validation for government endpoints
 * @module validators/government
 */

import { param } from 'express-validator';
import {
  createQueryValidator,
  isValidUUID,
  governmentNameValidation,
  cityNameValidation,
} from './common.js';

// ============================================
// Query Validation Configs
// ============================================

/**
 * Configuration for governments query validation
 */
export const GOVERNMENT_QUERY_CONFIG = {
  allowedFilterFields: ['id', 'name'],
  filterFieldTypes: {
    id: { type: 'uuid' },
    name: { type: 'string', minLength: 2, maxLength: 100 },
  },
  allowedOrderByFields: ['createdAt', 'id', 'name'],
  allowedSearchFields: ['id', 'name'],
};

/**
 * Configuration for cities query validation
 */
export const CITY_QUERY_CONFIG = {
  allowedFilterFields: ['id', 'governmentId', 'name'],
  filterFieldTypes: {
    id: { type: 'uuid' },
    name: { type: 'string', minLength: 2, maxLength: 100 },
    governmentId: { type: 'uuid' },
  },
  allowedOrderByFields: ['createdAt', 'governmentId', 'id', 'name'],
  allowedSearchFields: ['id', 'governmentId', 'name'],
};

// ============================================
// Government Validators
// ============================================

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetGovernments = [
  ...createQueryValidator(GOVERNMENT_QUERY_CONFIG),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetGovernmentById = [
  param('id').custom(isValidUUID),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateCreateGovernment = [
  governmentNameValidation('', true),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateUpdateGovernment = [
  governmentNameValidation('', false),
  param('id').custom(isValidUUID),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateDeleteGovernment = [
  param('id').custom(isValidUUID),
];

// ============================================
// City Validators
// ============================================

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetCities = [
  ...createQueryValidator(CITY_QUERY_CONFIG),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetCityById = [
  param('id').custom(isValidUUID),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateCreateCity = [
  cityNameValidation('', true),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateUpdateCity = [
  cityNameValidation('', false),
  param('id').custom(isValidUUID),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateDeleteCity = [
  param('id').custom(isValidUUID),
];

