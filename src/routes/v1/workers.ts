/**
 * @fileoverview Workers Routes - Explore/search workers endpoints for customers
 * @module routes/v1/workers
 */

import { Router } from 'express';
import { getWorkerById, searchWorkers } from '../../controllers/WorkerController.js';
import { ExploreSearchSchema, ExploreWorkerIdParamsSchema } from '../../schemas/workers.js';
import { validateParams, validateQuery } from '../../middlewares/validateRequest.js';

const workersRouter = Router();

/**
 * @swagger
 * /workers:
 *   get:
 *     summary: Explore workers with flaged filters
 *     description: |
 *       Returns a paginated list of approved workers filtered by:
 *       - specializationId (required)
 *       - subSpecializationId (optional)
 *       - governments (optional multi-select)
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
 *       - name: governments
 *         in: query
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         style: form
 *         explode: false
 *         description: Government IDs list. Use comma-separated values or repeated key.
 *       - name: flaged
 *         in: query
 *         required: false
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [availbilty, nearest, acceptUrgentJobs, heasetrated]
 *         style: form
 *         explode: false
 *         description: |
 *           Front flags collection.
 *           availbilty => availability filter (online workers)
 *           nearest => nearest-first sorting using PostgreSQL distance calculation
 *           acceptUrgentJobs => only workers accepting urgent jobs
 *           heasetrated => highest-rated sorting
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
 *                       $ref: '#/components/schemas/WorkersSearchResponse'
 *             example:
 *               status: success
 *               message: Workers results retrieved successfully
 *               data:
 *                 data:
 *                   - workerId: 123e4567-e89b-12d3-a456-426614174000
 *                     name: أحمد علي محمد
 *                     profileImage: https://res.cloudinary.com/.../avatar.jpg
 *                     service_title: تركيب الأنابيب
 *                     rating: 4.5
 *                     area: القاهرة
 *                     isAvailableNow: true
 *                     completedServices: 15
 *                     acceptsUrgentJobs: true
 *                     distanceKm: 5.2
 *                 meta:
 *                   total: 50
 *                   page: 1
 *                   limit: 10
 *                   totalPages: 5
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
workersRouter.get('/', validateQuery(ExploreSearchSchema), searchWorkers);

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
 *                 workerId: 123e4567-e89b-12d3-a456-426614174000
 *                 name: أحمد علي محمد
 *                 profileImage: https://res.cloudinary.com/.../avatar.jpg
 *                 specializations:
 *                   - تركيب الأنابيب
 *                   - إصلاح الأنابيب
 *                 experienceYears: 5
 *                 area: القاهرة
 *                 workGovernments:
 *                   - القاهرة
 *                   - الجيزة
 *                 badges:
 *                   - TOP_RATED
 *                   - VERIFIED
 *                 verificationStatus: APPROVED
 *                 bio: متخصص في السباكة لمدة 5 سنوات
 *                 portfolio:
 *                   - id: proj-id-1
 *                     description: مشروع تركيب مواسير دقيقة
 *                     projectImages:
 *                       - imageUrl: https://res.cloudinary.com/.../project1.jpg
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
workersRouter.get('/:id', validateParams(ExploreWorkerIdParamsSchema), getWorkerById);

export default workersRouter;
