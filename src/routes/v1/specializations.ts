/**
 * @fileoverview Specialization Routes - Specialization management endpoints
 * @module routes/specializations
 */

import { Router } from 'express';
import {
  getSpecializations,
  getSpecializationById,
  getSubSpecializations,
} from '../../controllers/SpecializationController.js';
import { validateParams, validateQuery } from '../../middlewares/validateRequest.js';
import {
  SpecializationIdParamsSchema,
  SpecializationQuerySchema,
  SubSpecializationQuerySchema,
} from '../../schemas/requests/specialization.request.js';

const specializationRouter: Router = Router();

specializationRouter.get('/', validateQuery(SpecializationQuerySchema), getSpecializations);

specializationRouter.get(
  '/:specializationId',
  validateParams(SpecializationIdParamsSchema),
  getSpecializationById
);

specializationRouter.get(
  '/:specializationId/sub-specializations',
  validateParams(SpecializationIdParamsSchema),
  validateQuery(SubSpecializationQuerySchema),
  getSubSpecializations
);

export default specializationRouter;
