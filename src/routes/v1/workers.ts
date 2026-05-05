/**
 * @fileoverview Workers Routes - Explore/search workers endpoints for customers
 * @module routes/v1/workers
 */

import { Router } from 'express';
import {
  getWorkerById,
  searchWorkers,
  getWorkerOccupiedTimeSlots,
} from '../../controllers/WorkerController.js';
import {
  ExploreSearchSchema,
  ExploreWorkerIdParamsSchema,
  OccupiedTimeSlotsQuerySchema,
} from '../../schemas/requests/worker-explore.request.js';
import { validateParams, validateQuery } from '../../middlewares/validateRequest.js';
import { getWorkerSpecializationsTree, getWorkerWorkingHours } from '../../controllers/DashboardController.js';
import { z } from '../../libs/zod.js';

const workersRouter = Router();

workersRouter.get('/', validateQuery(ExploreSearchSchema), searchWorkers);

workersRouter.get('/:id', validateParams(ExploreWorkerIdParamsSchema), getWorkerById);

workersRouter.get(
  '/:id/occupied-time-slots',
  validateParams(ExploreWorkerIdParamsSchema),
  validateQuery(OccupiedTimeSlotsQuerySchema),
  getWorkerOccupiedTimeSlots
);

workersRouter.get('/:id/working-hours', validateParams(ExploreWorkerIdParamsSchema), getWorkerWorkingHours);

workersRouter.get(
  '/:id/specializations/tree',
  validateParams(z.object({ id: z.string().uuid() })),
  getWorkerSpecializationsTree
);

export default workersRouter;
