/**
 * @fileoverview Explore Routes - Explore/search endpoints for customers
 * @module routes/explore
 */

import { Router } from 'express';
import { getWorkerById, searchWorkers } from '../controllers/ExploreController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { validateExploreSearch, validateExploreWorkerId } from '../validators/explore.js';

const exploreRouter = Router();

/**
 * @swagger
 * /explore:
 *   get:
 *     summary: Explore workers by specialization
 *     description: |
 *       Returns a paginated list of approved workers for the requested specialization.
 *       Sorting can be controlled with flag-style filters like nearest and highestRated.
 *     tags: [Explore]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: specializationId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Main specialization used as the core explore search
 *       - name: subSpecializationId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional sub-specialization filter
 *       - name: highestRated
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Show highest rated workers first within the selected specialization
 *       - name: nearest
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Show nearest workers first based on customer government and worker governments
 *       - name: filters
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           example: nearest,highestRated
 *         description: Comma-separated flag filters coming from the UI
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
 *         description: Explore results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               workerId:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                               specialization:
 *                                 type: string
 *                                 nullable: true
 *                               service_title:
 *                                 type: string
 *                                 nullable: true
 *                               image:
 *                                 type: string
 *                                 nullable: true
 *                               rating:
 *                                 type: number
 *                                 format: float
 *                               ratingCount:
 *                                 type: integer
 *                               hasCurrentUserRated:
 *                                 type: boolean
 *                               distance:
 *                                 type: number
 *                                 format: float
 *                                 nullable: true
 *                         meta:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             totalPages:
 *                               type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
exploreRouter.get('/', validateExploreSearch, validateRequest, searchWorkers);

/**
 * @swagger
 * /explore/{id}:
 *   get:
 *     summary: Get explored worker details
 *     description: |
 *       Returns the full public profile for a worker card selected from Explore.
 *       Only approved workers with active accounts are returned.
 *     tags: [Explore]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/UUIDPathId'
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Worker details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         workerId:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                           nullable: true
 *                         specializations:
 *                           type: array
 *                           items:
 *                             type: string
 *                         rating:
 *                           type: number
 *                           format: float
 *                         fee:
 *                           type: number
 *                           format: float
 *                           nullable: true
 *                         isAvailableNow:
 *                           type: boolean
 *                         completedServices:
 *                           type: integer
 *                         experienceYears:
 *                           type: integer
 *                         area:
 *                           type: string
 *                           nullable: true
 *                         workGovernments:
 *                           type: array
 *                           items:
 *                             type: string
 *                         badges:
 *                           type: array
 *                           items:
 *                             type: string
 *                         verificationStatus:
 *                           type: string
 *                         bio:
 *                           type: string
 *                           nullable: true
 *                         portfolio:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                                 nullable: true
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
exploreRouter.get('/:id', validateExploreWorkerId, validateRequest, getWorkerById);

export default exploreRouter;
