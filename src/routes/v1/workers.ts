/**
 * @fileoverview Workers Routes - Explore/search workers endpoints for customers
 * @module routes/v1/workers
 */

import { Router } from 'express';
import { getWorkerById, searchWorkers } from '../../controllers/WorkerController.js';
import { ExploreSearchSchema, ExploreWorkerIdParamsSchema } from '../../schemas/workers.js';
import { validateParams, validateQuery } from '../../middlewares/validateRequest.js';
import { authenticateAccess } from 'src/middlewares/authMiddleware.js';

const workersRouter = Router();

workersRouter.get('/',authenticateAccess,validateQuery(ExploreSearchSchema), searchWorkers);
workersRouter.get('/:id', authenticateAccess, validateParams(ExploreWorkerIdParamsSchema), getWorkerById);

export default workersRouter;
