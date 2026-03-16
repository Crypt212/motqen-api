import { param, query } from 'express-validator';

const uuidMessage = 'must be a valid UUID';

export const validateExploreSearch = [
  query('specializationId')
    .trim()
    .notEmpty()
    .withMessage('specializationId is required')
    .isUUID()
    .withMessage(`specializationId ${uuidMessage}`),
  query('subSpecializationId')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isUUID()
    .withMessage(`subSpecializationId ${uuidMessage}`),
  query('page')
    .trim()
    .notEmpty()
    .withMessage('page is required')
    .isInt({ min: 1 })
    .withMessage('page must be an integer greater than or equal to 1')
    .toInt(),
  query('limit')
    .trim()
    .notEmpty()
    .withMessage('limit is required')
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be an integer between 1 and 50')
    .toInt(),
  query('highestRated')
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean()
    .withMessage('highestRated must be a boolean')
    .toBoolean(),
  query('nearest')
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean()
    .withMessage('nearest must be a boolean')
    .toBoolean(),
  query('governmentId')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isUUID()
    .withMessage('governmentId must be a valid UUID'),
  query('acceptsUrgentJobs')
    .optional({ nullable: true, checkFalsy: true })
    .isBoolean()
    .withMessage('acceptsUrgentJobs must be a boolean')
    .toBoolean(),
];

export const validateExploreWorkerId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('id is required')
    .isUUID()
    .withMessage(`id ${uuidMessage}`),
];
