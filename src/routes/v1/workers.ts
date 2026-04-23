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
} from '../../schemas/workers.js';
import { validateParams, validateQuery } from '../../middlewares/validateRequest.js';

const workersRouter = Router();

workersRouter.get('/', validateQuery(ExploreSearchSchema), searchWorkers);

workersRouter.get('/:id', validateParams(ExploreWorkerIdParamsSchema), getWorkerById);

workersRouter.get(
  '/:id/occupied-time-slots',
  validateParams(ExploreWorkerIdParamsSchema),
  validateQuery(OccupiedTimeSlotsQuerySchema),
  getWorkerOccupiedTimeSlots
);

export default workersRouter;
