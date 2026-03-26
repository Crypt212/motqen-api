/**
 * @fileoverview Government Routes - Government management endpoints
 * @module routes/governments
 */

import { Router } from 'express';
import { governmentController } from '../../state.js';
import { isActive, authorizeAdmin } from '../../middlewares/authMiddleware.js';
import { validateBody, validateParams, validateQuery } from 'src/middlewares/validateRequest.js';
import {
  CreateGovernmentSchema,
  GovernmentIdParamsSchema,
  GovernmentQuerySchema,
  UpdateGovernmentSchema,
} from 'src/schemas/governments.js';

const governmentRouter = Router();

/**
 * @swagger
 * /governments:
 *   get:
 *     summary: Get all governments
 *     description: Returns a list of all governments. Public endpoint.
 *     tags: [Governments]
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Governments retrieved
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
 *                         governments:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Government'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
governmentRouter.get(
  '/',
  validateQuery(GovernmentQuerySchema),
  governmentController.getGovernments
);

/**
 * @swagger
 * /governments/{id}:
 *   get:
 *     summary: Get government by ID
 *     description: Returns a single government by its UUID. Public endpoint.
 *     tags: [Governments]
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - $ref: '#/components/parameters/UUIDPathId'
 *     responses:
 *       200:
 *         description: Government retrieved
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
 *                         government:
 *                           $ref: '#/components/schemas/Government'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
governmentRouter.get(
  '/:governmentId',
  validateParams(GovernmentIdParamsSchema),
  governmentController.getGovernmentById
);

/**
 * @swagger
 * /governments:
 *   post:
 *     summary: Create government (Admin)
 *     description: Creates a new government. Requires admin access token.
 *     tags: [Governments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GovernmentInput'
 *     responses:
 *       201:
 *         description: Government created
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
 *                         government:
 *                           $ref: '#/components/schemas/Government'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
governmentRouter.post(
  '/',
  isActive,
  authorizeAdmin,
  validateBody(CreateGovernmentSchema),
  governmentController.createGovernment
);

/**
 * @swagger
 * /governments/{id}:
 *   put:
 *     summary: Update government (Admin)
 *     description: Updates an existing government by UUID. Requires admin access token.
 *     tags: [Governments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - $ref: '#/components/parameters/UUIDPathId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GovernmentInput'
 *     responses:
 *       200:
 *         description: Government updated
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
 *                         government:
 *                           $ref: '#/components/schemas/Government'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
governmentRouter.put(
  '/:governmentId',
  isActive,
  authorizeAdmin,
  validateParams(GovernmentIdParamsSchema),
  validateBody(UpdateGovernmentSchema),
  governmentController.updateGovernment
);

/**
 * @swagger
 * /governments/{id}:
 *   delete:
 *     summary: Delete government (Admin)
 *     description: Deletes a government by UUID. Requires admin access token.
 *     tags: [Governments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - $ref: '#/components/parameters/UUIDPathId'
 *     responses:
 *       200:
 *         description: Government deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
governmentRouter.delete(
  '/:governmentId',
  isActive,
  authorizeAdmin,
  validateParams(GovernmentIdParamsSchema),
  governmentController.deleteGovernment
);

/**
 * @swagger
 * /governments/{governmentId}/cities:
 *   get:
 *     summary: Get cities by government
 *     description: Returns all cities under a specific government. Requires authentication.
 *     tags: [Governments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - in: path
 *         name: governmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Government UUID
 *     responses:
 *       200:
 *         description: Cities retrieved
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
 *                         cities:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/City'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
governmentRouter.get(
  '/:governmentId/cities',
  validateParams(GovernmentIdParamsSchema),
  validateQuery(GovernmentQuerySchema),
  governmentController.getCitiesByGovernment
);

export default governmentRouter;
