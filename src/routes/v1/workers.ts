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
import { createRoute } from '../../types/asyncHandler.js';
import { getWorkerSpecializationsTree, getWorkerWorkingHours } from '../../controllers/DashboardController.js';
import { z } from '../../libs/zod.js';

const workersRouter = Router();

workersRouter.get(
  '/',
  createRoute({
    schemas: { query: ExploreSearchSchema },
    handler: searchWorkers,
  })
);

workersRouter.get(
  '/:id',
  createRoute({
    schemas: { params: ExploreWorkerIdParamsSchema },
    handler: getWorkerById,
  })
);

workersRouter.get(
  '/:id/occupied-time-slots',
  createRoute({
    schemas: { params: ExploreWorkerIdParamsSchema, query: OccupiedTimeSlotsQuerySchema },
    handler: getWorkerOccupiedTimeSlots,
  })
);

workersRouter.get(
  '/:id/working-hours',
  createRoute({
    schemas: { params: ExploreWorkerIdParamsSchema },
    handler: getWorkerWorkingHours,
  })
);

workersRouter.get(
  '/:id/specializations/tree',
  createRoute({
    schemas: { params: z.object({ id: z.string().uuid() }) },
    handler: getWorkerSpecializationsTree,
  })
);

export default workersRouter;
