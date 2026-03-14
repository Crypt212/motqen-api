/**
 * @fileoverview Specialization Validators - Request validation for specialization endpoints
 * @module validators/specializations
 */

import { param, body } from 'express-validator';
import { validateField, isValidUUID } from './common.js';

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
 * @returns {import('express-validator').ValidationChain} Validation chain
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
 * Validates specialization creation request body
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateCreateSpecialization = [
  validateSpecializationName('', true),
];

/**
 * Validates specialization update request body
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateUpdateSpecialization = [
  validateSpecializationName('', true),
];

/**
 * Validates sub-specialization name field
 * @param {string} prefix - Prefix for the field name
 * @param {boolean} required - Whether the field is required
 * @returns {import('express-validator').ValidationChain} Validation chain
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
 * Validates sub-specialization creation request body
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateCreateSubSpecialization = [
  validateSubSpecializationName('', true),
];
