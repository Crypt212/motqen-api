/**
 * @fileoverview Worker Routes - Worker-related endpoints
 * @module routes/worker
 */

import { Router } from 'express';
import { searchWorkers, getWorkerById } from '../controllers/WorkerController.js';

const workerRouter = Router();

/**
 * GET /workers
 * Search for workers with filters and pagination
 * Query params: subSpecializationId, governmentId, acceptsUrgentJobs, page, limit
 */
workerRouter.get('/', searchWorkers);

/**
 * GET /workers/:id
 * Get detailed profile of a worker
 */
workerRouter.get('/:id', getWorkerById);

export default workerRouter;
