/**
 * @fileoverview Government Routes - Government management endpoints
 * @module routes/governments
 */

import { Router } from 'express';
import { governmentController } from '../../state.js';
import { isActive, authorizeAdmin } from '../../middlewares/authMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validateRequest.js';
import {
  CreateGovernmentSchema,
  GovernmentIdParamsSchema,
  GovernmentQuerySchema,
  UpdateGovernmentSchema,
} from '../../schemas/governments.js';

const governmentRouter = Router();

governmentRouter.get(
  '/',
  validateQuery(GovernmentQuerySchema),
  governmentController.getGovernments
);

governmentRouter.get(
  '/:governmentId',
  validateParams(GovernmentIdParamsSchema),
  governmentController.getGovernmentById
);

governmentRouter.post(
  '/',
  isActive,
  authorizeAdmin,
  validateBody(CreateGovernmentSchema),
  governmentController.createGovernment
);

governmentRouter.put(
  '/:governmentId',
  isActive,
  authorizeAdmin,
  validateParams(GovernmentIdParamsSchema),
  validateBody(UpdateGovernmentSchema),
  governmentController.updateGovernment
);

governmentRouter.delete(
  '/:governmentId',
  isActive,
  authorizeAdmin,
  validateParams(GovernmentIdParamsSchema),
  governmentController.deleteGovernment
);

governmentRouter.get(
  '/:governmentId/cities',
  validateParams(GovernmentIdParamsSchema),
  validateQuery(GovernmentQuerySchema),
  governmentController.getCitiesByGovernment
);

export default governmentRouter;
