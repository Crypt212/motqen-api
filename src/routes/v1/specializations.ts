/**
 * @fileoverview Specialization Routes - Specialization management endpoints
 * @module routes/specializations
 */

import { Router } from 'express';
import {
  getSpecializations,
  getSpecializationById,
  getSubSpecializations,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
  createSubSpecialization,
  deleteSubSpecialization,
} from '../../controllers/SpecializationController.js';
import { isActive, authorizeAdmin } from '../../middlewares/authMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validateRequest.js';
import {
  CreateSpecializationSchema,
  CreateSubSpecializationSchema,
  SpecializationIdParamsSchema,
  SpecializationQuerySchema,
  SubSpecializationIdParamsSchema,
  SubSpecializationQuerySchema,
  UpdateSpecializationSchema,
} from '../../schemas/specializations.js';

const specializationRouter = Router();

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

specializationRouter.post(
  '/',
  isActive,
  authorizeAdmin,
  validateBody(CreateSpecializationSchema),
  createSpecialization
);

specializationRouter.put(
  '/:specializationId',
  isActive,
  authorizeAdmin,
  validateParams(SpecializationIdParamsSchema),
  validateBody(UpdateSpecializationSchema),
  updateSpecialization
);

specializationRouter.delete(
  '/:specializationId',
  isActive,
  authorizeAdmin,
  validateParams(SpecializationIdParamsSchema),
  deleteSpecialization
);

specializationRouter.post(
  '/:specializationId/sub-specializations',
  isActive,
  authorizeAdmin,
  validateParams(SpecializationIdParamsSchema),
  validateBody(CreateSubSpecializationSchema),
  createSubSpecialization
);

specializationRouter.delete(
  '/:specializationId/sub-specializations/:subSpecializationId',
  isActive,
  authorizeAdmin,
  validateParams(SpecializationIdParamsSchema),
  validateParams(SubSpecializationIdParamsSchema),
  deleteSubSpecialization
);

export default specializationRouter;
