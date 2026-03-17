/**
 * @fileoverview Worker Validators - Request validation for worker endpoints
 * @module validators/worker
 */

import { param, query } from 'express-validator';
import { isValidUUID } from './common.js';

const uuidMessage = 'must be a valid UUID';

/**
 * Configuration for worker search query validation
 */
export const WORKER_SEARCH_QUERY_CONFIG = {
  allowedFilterFields: [
    'subSpecializationId',
    'governmentId',
    'acceptsUrgentJobs',
  ],
  filterFieldTypes: {
    subSpecializationId: { type: 'uuid' },
    governmentId: { type: 'uuid' },
    acceptsUrgentJobs: { type: 'boolean' },
  },
  allowedOrderByFields: [],
  allowedSearchFields: [],
};

/**
 * Validator for worker search endpoint
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateSearchWorkers = [
  query('subSpecializationId')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isUUID()
    .withMessage(`subSpecializationId ${uuidMessage}`),
  query('governmentId')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isUUID()
    .withMessage(`governmentId ${uuidMessage}`),
  query('acceptsUrgentJobs')
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean()
    .withMessage('acceptsUrgentJobs must be a boolean')
    .toBoolean(),
  query('page')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt(),
  query('limit')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
    .toInt(),
];

/**
 * Validator for getting a worker by ID
 * @type {import('express-validator').ValidationChain[]}
 */
export const validateGetWorkerById = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('id is required')
    .isUUID()
    .withMessage(`id ${uuidMessage}`),
];
