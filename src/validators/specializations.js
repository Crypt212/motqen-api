/**
 * @fileoverview Specialization Validators - Request validation for specialization endpoints
 * @module validators/specializations
 */

import { param, body } from 'express-validator';
import { validateField, isValidUUID, createQueryValidator } from './common.js';

const CATEGORIES = [
  'ELECTRICITY',
  'PLUMBING',
  'AC',
  'CARPENTRY',
  'GENERALMAINTENANCE',
  'PAINTING',
  'CONSTRUCTION',
  'CLEANING',
  'INSTALLATION',
  'FURNITURETRANSPORT',
  'DRILLING',
  'ELECTRICALAPPLIANCES',
  'DEFAULTCATEGORY',
];

export const SPECIALIZATION_QUERY_CONFIG = {
  allowedFilterFields: ['name', 'nameAr', 'category'],
  filterFieldTypes: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    nameAr: { type: 'string', minLength: 2, maxLength: 100 },
    category: { type: 'enum', enumValues: CATEGORIES },
  },
  allowedOrderByFields: ['createdAt', 'id', 'name', 'nameAr', 'category'],
  allowedSearchFields: ['name', 'nameAr', 'category'],
};

export const SUB_SPECIALIZATION_QUERY_CONFIG = {
  allowedFilterFields: ['name', 'nameAr', 'mainSpecializationId'],
  filterFieldTypes: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
    nameAr: { type: 'string', minLength: 2, maxLength: 100 },
    mainSpecializationId: { type: 'uuid' },
  },
  allowedOrderByFields: ['createdAt', 'id', 'name', 'nameAr'],
  allowedSearchFields: ['name', 'nameAr'],
};

/**
 * Validates UUID parameter for specialization ID
 * @param {string} paramName - The parameter name
 * @returns {import('express-validator').ValidationChain[]} Validation chain
 */
export const validateSpecializationIdParam = (paramName = 'id') => {
  return [
    param(paramName)
      .notEmpty()
      .withMessage(`${paramName} is required`)
      .isString()
      .withMessage(`${paramName} must be a string`)
      .custom((value) => {
        if (!isValidUUID(value)) {
          throw new Error(`${paramName} must be a valid UUID`);
        }
        return true;
      }),
  ];
};

/**
 * Validates UUID parameter for sub-specialization ID
 * @returns {import('express-validator').ValidationChain[]} Validation chain
 */
export const validateSubSpecializationIdParam = () => {
  return [
    param('subId')
      .notEmpty()
      .withMessage('Sub-specialization ID is required')
      .isString()
      .withMessage('Sub-specialization ID must be a string')
      .custom((value) => {
        if (!isValidUUID(value)) {
          throw new Error('Sub-specialization ID must be a valid UUID');
        }
        return true;
      }),
  ];
};

/**
 * Validates specialization name field
 * @param {string} prefix - Prefix for the field name
 * @param {boolean} required - Whether the field is required
 * @returns {import('express-validator').ValidationChain}
 */
export const validateSpecializationName = (prefix = '', required = false) => {
  const fieldName = prefix + 'name';
  return validateField(fieldName, required)
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters');
};

/**
 * Validates specialization nameAr field
 * @param {string} prefix - Prefix for the field name
 * @param {boolean} required - Whether the field is required
 * @returns {import('express-validator').ValidationChain}
 */
export const validateSpecializationNameAr = (prefix = '', required = false) => {
  const fieldName = prefix + 'nameAr';
  return validateField(fieldName, required)
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('nameAr must be between 2 and 100 characters');
};

/**
 * Validates specialization category field
 * @param {string} prefix - Prefix for the field name
 * @param {boolean} required - Whether the field is required
 * @returns {import('express-validator').ValidationChain}
 */
export const validateSpecializationCategory = (
  prefix = '',
  required = false
) => {
  const fieldName = prefix + 'category';
  return validateField(fieldName, required)
    .trim()
    .isIn(CATEGORIES)
    .withMessage(`category must be one of: ${CATEGORIES.join(', ')}`);
};

/**
 * Validates specialization creation request body
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateCreateSpecialization = [
  validateSpecializationName('', true),
  validateSpecializationNameAr('', true),
  validateSpecializationCategory('', true),
];

/**
 * Validates specialization update request body
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateUpdateSpecialization = [
  validateSpecializationName('', false),
  validateSpecializationNameAr('', false),
  validateSpecializationCategory('', false),
];

/**
 * Validates sub-specialization name field
 * @param {string} prefix - Prefix for the field name
 * @param {boolean} required - Whether the field is required
 * @returns {import('express-validator').ValidationChain}
 */
export const validateSubSpecializationName = (
  prefix = '',
  required = false
) => {
  const fieldName = prefix + 'name';
  return validateField(fieldName, required)
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters');
};

/**
 * Validates sub-specialization nameAr field
 * @param {string} prefix - Prefix for the field name
 * @param {boolean} required - Whether the field is required
 * @returns {import('express-validator').ValidationChain}
 */
export const validateSubSpecializationNameAr = (
  prefix = '',
  required = false
) => {
  const fieldName = prefix + 'nameAr';
  return validateField(fieldName, required)
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('nameAr must be between 2 and 100 characters');
};

/**
 * Validates sub-specialization creation request body
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateCreateSubSpecialization = [
  validateSubSpecializationName('', true),
  validateSubSpecializationNameAr('', true),
];

/**
 * Validates get specializations query
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateGetSpecializations = [
  ...createQueryValidator(SPECIALIZATION_QUERY_CONFIG),
];

/**
 * Validates get sub-specializations query
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateGetSubSpecializations = [
  ...createQueryValidator(SUB_SPECIALIZATION_QUERY_CONFIG),
];
