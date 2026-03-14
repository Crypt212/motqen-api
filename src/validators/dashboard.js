/**
 * @fileoverview User Validators - Request validation for user endpoints
 * @module validators/user
 */

import { param, query } from 'express-validator';
import {
  clientProfileValidation,
  userDataValidation,
  specializationsTreeValidation,
  workerProfileValidation,
  workGovernmentsValidation,
  mainSpecializationValidation,
  createQueryValidator,
  isValidUUID,
} from './common.js';

// ============================================
// Query Validation Configs
// ============================================

/**
 * Configuration for worker governments query validation
 */
export const WORKER_GOVERNMENTS_QUERY_CONFIG = {
  allowedFilterFields: ['governmentId'],
  filterFieldTypes: {
    governmentId: { type: 'uuid' },
  },
  allowedOrderByFields: ['createdAt'],
  allowedSearchFields: [],
};

/**
 * Configuration for worker specializations query validation
 */
export const WORKER_SPECIALIZATIONS_QUERY_CONFIG = {
  allowedFilterFields: ['specializationId', 'mainId'],
  filterFieldTypes: {
    specializationId: { type: 'uuid' },
    mainId: { type: 'uuid' },
  },
  allowedOrderByFields: ['createdAt'],
  allowedSearchFields: [],
};

/**
 * Configuration for governments query validation
 */
export const GOVERNMENTS_QUERY_CONFIG = {
  allowedFilterFields: ['name'],
  filterFieldTypes: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
  },
  allowedOrderByFields: ['name', 'createdAt'],
  allowedSearchFields: ['name'],
};

/**
 * Configuration for specializations query validation
 */
export const SPECIALIZATIONS_QUERY_CONFIG = {
  allowedFilterFields: ['name'],
  filterFieldTypes: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
  },
  allowedOrderByFields: ['name', 'createdAt'],
  allowedSearchFields: ['name'],
};

/**
 * Configuration for client profiles query validation (admin)
 */
export const CLIENT_PROFILES_QUERY_CONFIG = {
  allowedFilterFields: ['userId', 'address'],
  filterFieldTypes: {
    userId: { type: 'uuid' },
    address: { type: 'string', minLength: 2, maxLength: 500 },
  },
  allowedOrderByFields: ['createdAt', 'updatedAt', 'address'],
  allowedSearchFields: ['address'],
};

/**
 * Configuration for worker profiles query validation (admin)
 */
export const WORKER_PROFILES_QUERY_CONFIG = {
  allowedFilterFields: [
    'userId',
    'experienceYears',
    'isInTeam',
    'acceptsUrgentJobs',
  ],
  filterFieldTypes: {
    userId: { type: 'uuid' },
    experienceYears: { type: 'number', min: 0, max: 50 },
    isInTeam: { type: 'boolean' },
    acceptsUrgentJobs: { type: 'boolean' },
  },
  allowedOrderByFields: ['createdAt', 'updatedAt', 'experienceYears'],
  allowedSearchFields: [],
};

// ============================================
// User Validators
// ============================================

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetUser = [];

/** @type {import('express-validator').ValidationChain[]} */
export const validateUpdateUser = [...userDataValidation('', false)];

// ============================================
// Worker Profile Validators
// ============================================

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetWorkerProfile = [];

export const validateCreateWorkerProfile = [
  ...workerProfileValidation('', true),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateDeleteWorkerProfile = [];

/** @type {import('express-validator').ValidationChain[]} */
export const validateUpdateWorkerProfile = [
  ...workerProfileValidation('', false),
];

// ============================================
// Client Profile Validators
// ============================================

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetClientProfile = [];

/** @type {import('express-validator').ValidationChain[]} */
export const validateCreateClientProfile = [
  ...clientProfileValidation('', true),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateUpdateClientProfile = [
  ...clientProfileValidation('', false),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateDeleteClientProfile = [];

// ============================================
// Worker Governments Validators
// ============================================

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetWorkerGovernments = [
  ...createQueryValidator(WORKER_GOVERNMENTS_QUERY_CONFIG),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateAddWorkerGovernments = [
  workGovernmentsValidation('', false),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateDeleteWorkerGovernments = [
  param('all').optional().isBoolean(),
  workGovernmentsValidation('', false),
];

// ============================================
// Worker Specializations Validators
// ============================================

/** @type {import('express-validator').ValidationChain[]} */
export const validateGetWorkerSpecializations = [
  ...createQueryValidator(WORKER_SPECIALIZATIONS_QUERY_CONFIG),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateAddWorkerSpecializations = [
  specializationsTreeValidation('', false),
];

/** @type {import('express-validator').ValidationChain[]} */
export const validateDeleteWorkerSpecializations = [
  param('all').optional().isBoolean(),
  param('allSub').optional().isBoolean(),
  mainSpecializationValidation('', false),
  specializationsTreeValidation('', false),
];

// ============================================
// Admin Query Validators (for future admin endpoints)
// ============================================

/**
 * Validator for listing client profiles with pagination/filtering
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateListClientProfiles = [
  ...createQueryValidator(CLIENT_PROFILES_QUERY_CONFIG),
];

/**
 * Validator for listing worker profiles with pagination/filtering
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateListWorkerProfiles = [
  ...createQueryValidator(WORKER_PROFILES_QUERY_CONFIG),
];

/**
 * Validator for listing governments with pagination/filtering
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateListGovernments = [
  ...createQueryValidator(GOVERNMENTS_QUERY_CONFIG),
];

/**
 * Validator for listing specializations with pagination/filtering
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateListSpecializations = [
  ...createQueryValidator(SPECIALIZATIONS_QUERY_CONFIG),
];
