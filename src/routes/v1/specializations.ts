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
import { isActive } from '../../middlewares/authMiddleware.js';
import { authorizeAdmin } from '../../middlewares/accessMiddleware.js';
import { createRoute } from '../../types/asyncHandler.js';
import {
  CreateSpecializationSchema,
  CreateSubSpecializationSchema,
  SpecializationIdParamsSchema,
  SpecializationQuerySchema,
  SubSpecializationIdParamsSchema,
  SubSpecializationQuerySchema,
  UpdateSpecializationSchema,
} from '../../schemas/requests/specialization.request.js';

const specializationRouter = Router();

specializationRouter.get(
  '/',
  createRoute({
    schemas: { query: SpecializationQuerySchema },
    handler: getSpecializations,
  })
);

specializationRouter.get(
  '/:specializationId',
  createRoute({
    schemas: { params: SpecializationIdParamsSchema },
    handler: getSpecializationById,
  })
);

specializationRouter.get(
  '/:specializationId/sub-specializations',
  createRoute({
    schemas: { params: SpecializationIdParamsSchema, query: SubSpecializationQuerySchema },
    handler: getSubSpecializations,
  })
);

specializationRouter.post(
  '/',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { body: CreateSpecializationSchema },
    handler: createSpecialization,
  })
);

specializationRouter.put(
  '/:specializationId',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { params: SpecializationIdParamsSchema, body: UpdateSpecializationSchema },
    handler: updateSpecialization,
  })
);

specializationRouter.delete(
  '/:specializationId',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { params: SpecializationIdParamsSchema },
    handler: deleteSpecialization,
  })
);

specializationRouter.post(
  '/:specializationId/sub-specializations',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { params: SpecializationIdParamsSchema, body: CreateSubSpecializationSchema },
    handler: createSubSpecialization,
  })
);

specializationRouter.delete(
  '/:specializationId/sub-specializations/:subSpecializationId',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { params: SpecializationIdParamsSchema.merge(SubSpecializationIdParamsSchema) },
    handler: deleteSubSpecialization,
  })
);

export default specializationRouter;
