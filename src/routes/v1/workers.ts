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
  SearchWorkersRequestSchema, SearchWorkersQuerySchema, SearchWorkersParamsSchema,
  GetWorkerByIdRequestSchema, GetWorkerByIdQuerySchema, GetWorkerByIdParamsSchema,
  GetWorkerOccupiedTimeSlotsRequestSchema, GetWorkerOccupiedTimeSlotsQuerySchema, GetWorkerOccupiedTimeSlotsParamsSchema,
} from '../../schemas/requests/worker-explore.request.js';
import {
  GetWorkerWorkingHoursRequestSchema, GetWorkerWorkingHoursQuerySchema, GetWorkerWorkingHoursParamsSchema,
  GetWorkerSpecializationsTreeRequestSchema, GetWorkerSpecializationsTreeQuerySchema, GetWorkerSpecializationsTreeParamsSchema
} from '../../schemas/requests/dashboard.request.js';
import { createRoute } from '../../types/asyncHandler.js';
import { getWorkerSpecializationsTree, getWorkerWorkingHours } from '../../controllers/DashboardController.js';
import { z } from '../../libs/zod.js';

const workersRouter = Router();

workersRouter.get(
  '/',
  createRoute({
    schemas: { body: SearchWorkersRequestSchema, query: SearchWorkersQuerySchema, params: SearchWorkersParamsSchema },
    handler: searchWorkers,
  })
);

workersRouter.get(
  '/:id',
  createRoute({
    schemas: { body: GetWorkerByIdRequestSchema, query: GetWorkerByIdQuerySchema, params: GetWorkerByIdParamsSchema },
    handler: getWorkerById,
  })
);

workersRouter.get(
  '/:id/occupied-time-slots',
  createRoute({
    schemas: { body: GetWorkerOccupiedTimeSlotsRequestSchema, query: GetWorkerOccupiedTimeSlotsQuerySchema, params: GetWorkerOccupiedTimeSlotsParamsSchema },
    handler: getWorkerOccupiedTimeSlots,
  })
);

workersRouter.get(
  '/:id/working-hours',
  createRoute({
    schemas: { body: GetWorkerWorkingHoursRequestSchema, query: GetWorkerWorkingHoursQuerySchema, params: GetWorkerWorkingHoursParamsSchema },
    handler: getWorkerWorkingHours,
  })
);

workersRouter.get(
  '/:id/specializations/tree',
  createRoute({
    schemas: { body: GetWorkerSpecializationsTreeRequestSchema, query: GetWorkerSpecializationsTreeQuerySchema, params: GetWorkerSpecializationsTreeParamsSchema },
    handler: getWorkerSpecializationsTree,
  })
);

export default workersRouter;
