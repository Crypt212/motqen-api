/**
 * @fileoverview Government Routes - Government management endpoints
 * @module routes/governments
 */

import { Router } from 'express';
import { governmentController } from '../../state.js';
import { isActive } from '../../middlewares/authMiddleware.js';
import { createRoute } from '../../types/asyncHandler.js';
import {
  CreateGovernmentSchema,
  GovernmentIdParamsSchema,
  GovernmentQuerySchema,
  UpdateGovernmentSchema,
} from '../../schemas/requests/government.request.js';
import { authorizeAdmin } from 'src/middlewares/accessMiddleware.js';

const governmentRouter = Router();

governmentRouter.get(
  '/',
  createRoute({
    schemas: { query: GovernmentQuerySchema },
    handler: governmentController.getGovernments,
  })
);

governmentRouter.get(
  '/:governmentId',
  createRoute({
    schemas: { params: GovernmentIdParamsSchema },
    handler: governmentController.getGovernmentById,
  })
);

governmentRouter.post(
  '/',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { body: CreateGovernmentSchema },
    handler: governmentController.createGovernment,
  })
);

governmentRouter.put(
  '/:governmentId',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { params: GovernmentIdParamsSchema, body: UpdateGovernmentSchema },
    handler: governmentController.updateGovernment,
  })
);

governmentRouter.delete(
  '/:governmentId',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: { params: GovernmentIdParamsSchema },
    handler: governmentController.deleteGovernment,
  })
);

governmentRouter.get(
  '/:governmentId/cities',
  createRoute({
    schemas: { params: GovernmentIdParamsSchema, query: GovernmentQuerySchema },
    handler: governmentController.getCitiesByGovernment,
  })
);

export default governmentRouter;
