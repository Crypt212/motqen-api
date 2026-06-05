/**
 * @fileoverview Government Routes - Government management endpoints
 * @module routes/governments
 */

import { Router } from 'express';
import { governmentController } from '../../state.js';
import { validateParams, validateQuery } from '../../middlewares/validateRequest.js';
import {
  GovernmentIdParamsSchema,
  GovernmentQuerySchema,
} from '../../schemas/requests/government.request.js';

const governmentRouter: Router = Router();

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

governmentRouter.get(
  '/:governmentId/cities',
  validateParams(GovernmentIdParamsSchema),
  validateQuery(GovernmentQuerySchema),
  governmentController.getCitiesByGovernment
);

export default governmentRouter;
