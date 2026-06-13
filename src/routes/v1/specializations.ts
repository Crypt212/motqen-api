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
  GetSpecializationsRequestSchema, GetSpecializationsQuerySchema, GetSpecializationsParamsSchema,
  GetSpecializationByIdRequestSchema, GetSpecializationByIdQuerySchema, GetSpecializationByIdParamsSchema,
  GetSubSpecializationsRequestSchema, GetSubSpecializationsQuerySchema, GetSubSpecializationsParamsSchema,
  CreateSpecializationRequestSchema, CreateSpecializationQuerySchema, CreateSpecializationParamsSchema,
  UpdateSpecializationRequestSchema, UpdateSpecializationQuerySchema, UpdateSpecializationParamsSchema,
  DeleteSpecializationRequestSchema, DeleteSpecializationQuerySchema, DeleteSpecializationParamsSchema,
  CreateSubSpecializationRequestSchema, CreateSubSpecializationQuerySchema, CreateSubSpecializationParamsSchema,
  DeleteSubSpecializationRequestSchema, DeleteSubSpecializationQuerySchema, DeleteSubSpecializationParamsSchema
} from '../../schemas/requests/specialization.request.js';

const specializationRouter = Router();

specializationRouter.get(
  '/',
  createRoute({
    schemas: { body: GetSpecializationsRequestSchema, query: GetSpecializationsQuerySchema, params: GetSpecializationsParamsSchema },
    handler: getSpecializations,
  })
);

specializationRouter.get(
  '/:specializationId',
  createRoute({
    schemas: { body: GetSpecializationByIdRequestSchema, query: GetSpecializationByIdQuerySchema, params: GetSpecializationByIdParamsSchema },
    handler: getSpecializationById,
  })
);

specializationRouter.get(
  '/:specializationId/sub-specializations',
  createRoute({
    schemas: { body: GetSubSpecializationsRequestSchema, query: GetSubSpecializationsQuerySchema, params: GetSubSpecializationsParamsSchema },
    handler: getSubSpecializations,
  })
);

specializationRouter.post(
  '/',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { body: CreateSpecializationRequestSchema, query: CreateSpecializationQuerySchema, params: CreateSpecializationParamsSchema },
    handler: createSpecialization,
  })
);

specializationRouter.put(
  '/:specializationId',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { body: UpdateSpecializationRequestSchema, query: UpdateSpecializationQuerySchema, params: UpdateSpecializationParamsSchema },
    handler: updateSpecialization,
  })
);

specializationRouter.delete(
  '/:specializationId',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { body: DeleteSpecializationRequestSchema, query: DeleteSpecializationQuerySchema, params: DeleteSpecializationParamsSchema },
    handler: deleteSpecialization,
  })
);

specializationRouter.post(
  '/:specializationId/sub-specializations',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { body: CreateSubSpecializationRequestSchema, query: CreateSubSpecializationQuerySchema, params: CreateSubSpecializationParamsSchema },
    handler: createSubSpecialization,
  })
);

specializationRouter.delete(
  '/:specializationId/sub-specializations/:subSpecializationId',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { body: DeleteSubSpecializationRequestSchema, query: DeleteSubSpecializationQuerySchema, params: DeleteSubSpecializationParamsSchema },
    handler: deleteSubSpecialization,
  })
);

export default specializationRouter;
