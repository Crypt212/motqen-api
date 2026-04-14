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

/**
 * @swagger
 * /workers:
 *   get:
 *     summary: Explore workers with supported search filters
 *     description: |
 *       Returns a paginated list of approved workers filtered by:
 *       - specializationId (required)
 *       - subSpecializationId (optional)
 *       - governmentId (optional)
 *       - cityId (optional)
 *       - latitude & longitude (optional, for nearest sorting)
 *       - flaged (optional front flags)
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: specializationId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Main specialization base filter.
 *       - name: subSpecializationId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Sub-specialization base filter.
 *       - name: governmentId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Government UUID filter.
 *       - name: cityId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: City UUID filter.
 *       - name: location[latitude]
 *         in: query
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: Customer latitude for nearest sorting. If not provided, will try to use user's main location.
 *       - name: location[longitude]
 *         in: query
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *         description: Customer longitude for nearest sorting. If not provided, will try to use user's main location.
 *       - name: flaged
 *         in: query
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [availability, nearest, acceptUrgentJobs, highestRated]
 *         style: form
 *         explode: false
 *         description: |
 *           Front flags collection.
 *           availability => availability filter (online workers)
 *           nearest => nearest-first sorting using PostgreSQL distance calculation
 *           acceptUrgentJobs => only workers accepting urgent jobs
 *           highestRated => sort by highest rating
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Explore results retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [success]
 *                     message:
 *                       type: string
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ExploreSearchResponse'
 *             example:
 *               status: success
 *               message: Workers results retrieved successfully
 *               data:
 *                 workers:
 *                   - workerId: 123e4567-e89b-12d3-a456-426614174000
 *                     name: أحمد علي محمد
 *                     profileImage: https://res.cloudinary.com/.../avatar.jpg
 *                     rating: 4.5
 *                     ratingCount: 12
 *                     isAvailableNow: true
 *                     completedServices: 15
 *                     distance: 5.2
 *                 total: 50
 *                 page: 1
 *                 limit: 10
 *                 count: 10
 *                 hasNext: true
 *                 hasPrev: false
 *                 totalPages: 5
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
workersRouter.get('/',authenticateAccess,validateQuery(ExploreSearchSchema), searchWorkers);

/**
 * @swagger
 * /workers/{id}:
 *   get:
 *     summary: Get explored worker details
 *     description: |
 *       Returns the full public profile for the selected worker card.
 *       Only approved workers with active accounts are returned.
 *     tags: [Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UUIDPathId'
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Worker details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [success]
 *                     message:
 *                       type: string
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WorkerDetailResponse'
 *             example:
 *               status: success
 *               message: Worker retrieved successfully
 *               data:
 *                 id: 123e4567-e89b-12d3-a456-426614174000
 *                 userId: 0f6f2de8-1eac-4d54-9f2f-97f4c0e7169a
 *                 experienceYears: 5
 *                 isInTeam: false
 *                 acceptsUrgentJobs: true
 *                 bio: متخصص في السباكة لمدة 5 سنوات
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
workersRouter.get('/:id', authenticateAccess, validateParams(ExploreWorkerIdParamsSchema), getWorkerById);

export default workersRouter;
