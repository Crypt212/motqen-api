/**
 * @fileoverview Explore Routes - Explore/search endpoints for customers
 * @module routes/v1/explore
 */

import { Router } from 'express';
import { getWorkerById, searchWorkers } from '../../controllers/ExploreController.js';
import { validateExpress } from '../../middlewares/validateRequest.js';
import { validateExploreSearch, validateExploreWorkerId } from '../../validators/explore.js';

const exploreRouter = Router();

/**
 * @swagger
 * /explore:
 *   get:
 *     summary: Explore workers by specialization
 *     description: |
 *       Returns a paginated list of approved workers for the requested specialization.
 *       Supports optional sorting and filtering flags used by the Explore UI.
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
 *         description: Main specialization used as the base explore search.
 *       - name: subSpecializationId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional sub-specialization filter.
 *       - name: highestRated
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Prioritize highest rated workers first.
 *       - name: nearest
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Prioritize nearest workers based on customer and worker governments.
 *       - name: governmentId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter workers by a specific government.
 *       - name: acceptsUrgentJobs
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Return only workers who accept urgent jobs.
 *       - name: availableNow
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: |
 *           Return only workers available now.
 *           Supported aliases: availability, AvailableNow, AvailbleNow.
 *       - name: page
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         required: true
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
 *               message: Explore results retrieved successfully
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
exploreRouter.get('/', validateExploreSearch, validateExpress, searchWorkers);

/**
 * @swagger
 * /explore/{id}:
 *   get:
 *     summary: Get explored worker details
 *     description: |
 *       Returns the full public profile for the selected worker card from Explore.
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
 *               message: Explore worker retrieved successfully
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
exploreRouter.get('/:id', validateExploreWorkerId, validateExpress, getWorkerById);

export default exploreRouter;
