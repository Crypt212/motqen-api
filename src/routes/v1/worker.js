/**
 * @fileoverview Worker Routes - Worker-related endpoints
 * @module routes/worker
 */

import { Router } from 'express';
import {
  searchWorkers,
  getWorkerById,
} from '../../controllers/WorkerController.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  validateSearchWorkers,
  validateGetWorkerById,
} from '../../validators/worker.js';

const workerRouter = Router();

/**
 * @swagger
 * /worker:
 *   get:
 *     summary: Search Craftsmen/Workers
 *     description: |
 *       Returns a paginated list of approved craftsmen/workers based on filters.
 *       Results are sorted by experience years (descending).
 *
 *       Only returns **APPROVED** workers. Unapproved workers are excluded from results.
 *     tags: [Worker Search]
 *     parameters:
 *       - name: subSpecializationId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by sub-specialization (skills/services offered)
 *       - name: governmentId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by operating government/area
 *       - name: acceptsUrgentJobs
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by urgent job acceptance availability
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of items per page
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Workers retrieved successfully
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
 *                               profileImage:
 *                                 type: string
 *                                 nullable: true
 *                               service_title:
 *                                 type: string
 *                                 nullable: true
 *                               rating:
 *                                 type: number
 *                                 format: float
 *                               area:
 *                                 type: string
 *                                 nullable: true
 *                               experience:
 *                                 type: integer
 *                               acceptsUrgentJobs:
 *                                 type: boolean
 *                               completedServices:
 *                                 type: integer
 *                         meta:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               description: Total number of workers matching filters
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             totalPages:
 *                               type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
workerRouter.get('/', validateSearchWorkers, validateRequest, searchWorkers);

/**
 * @swagger
 * /worker/{id}:
 *   get:
 *     summary: Get Worker Details
 *     description: |
 *       Returns the complete profile of a specific approved craftsman/worker.
 *       Includes:
 *       - Personal & contact information
 *       - All specializations and sub-specializations
 *       - Verification status and documents
 *       - Rating and badges
 *       - Portfolio projects (if any)
 *       - Operating governments/areas
 *
 *       Only returns data for **APPROVED** workers.
 *     tags: [Worker Search]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Worker profile UUID
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Worker profile retrieved successfully
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
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                           nullable: true
 *                         experienceYears:
 *                           type: integer
 *                         rating:
 *                           type: number
 *                           format: float
 *                           description: Average rating (0-5 stars)
 *                         completedServices:
 *                           type: integer
 *                         isApproved:
 *                           type: boolean
 *                         acceptsUrgentJobs:
 *                           type: boolean
 *                         isAvailableNow:
 *                           type: boolean
 *                         bio:
 *                           type: string
 *                           nullable: true
 *                         specializations:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               name:
 *                                 type: string
 *                               subSpecializations:
 *                                 type: array
 *                                 items:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: string
 *                                     name:
 *                                       type: string
 *                         workingGovernments:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                         verification:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [PENDING, APPROVED, REJECTED]
 *                             idDocumentUrl:
 *                               type: string
 *                             idWithPersonalImageUrl:
 *                               type: string
 *                         badges:
 *                           type: array
 *                           items:
 *                             type: string
 *                             enum: [VERIFIED, TOP_RATED, TRUSTED]
 *                         portfolio:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               description:
 *                                 type: string
 *                               images:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
workerRouter.get('/:id', validateGetWorkerById, validateRequest, getWorkerById);

export default workerRouter;
