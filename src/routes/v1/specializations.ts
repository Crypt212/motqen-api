/**
 * @fileoverview Specialization Routes - Specialization management endpoints
 * @module routes/specializations
 */

import { Router } from 'express';
import {
  getSpecializations,
  getSpecializationById,
  getSubSpecializations,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
  createSubSpecialization,
  deleteSubSpecialization,
} from '../../controllers/SpecializationController.js';
import { isActive, authorizeAdmin } from '../../middlewares/authMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validateRequest.js';
import {
  CreateSpecializationSchema,
  CreateSubSpecializationSchema,
  SpecializationIdParamsSchema,
  SpecializationQuerySchema,
  SubSpecializationIdParamsSchema,
  SubSpecializationQuerySchema,
  UpdateSpecializationSchema,
} from '../../schemas/specializations.js';

const specializationRouter = Router();

/**
 * @swagger
 * /specializations:
 *   get:
 *     summary: Get all specializations
 *     description: Returns a list of all specializations. Public endpoint.
 *     tags: [Specializations]
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Specializations retrieved
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
 *                         specializations:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Specialization'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
specializationRouter.get('/', validateQuery(SpecializationQuerySchema), getSpecializations);

/**
 * @swagger
 * /specializations/{id}:
 *   get:
 *     summary: Get specialization by ID
 *     description: Returns a single specialization by its UUID. Public endpoint.
 *     tags: [Specializations]
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - $ref: '#/components/parameters/UUIDPathId'
 *     responses:
 *       200:
 *         description: Specialization retrieved
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
 *                         specialization:
 *                           $ref: '#/components/schemas/Specialization'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
specializationRouter.get(
  '/:specializationId',
  validateParams(SpecializationIdParamsSchema),
  getSpecializationById
);

/**
 * @swagger
 * /specializations/{id}/sub-specializations:
 *   get:
 *     summary: Get sub-specializations
 *     description: Returns all sub-specializations under a parent specialization. Public endpoint.
 *     tags: [Specializations]
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - $ref: '#/components/parameters/UUIDPathId'
 *     responses:
 *       200:
 *         description: Sub-specializations retrieved
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
 *                         subSpecializations:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/SubSpecialization'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
specializationRouter.get(
  '/:specializationId/sub-specializations',
  validateParams(SpecializationIdParamsSchema),
  validateQuery(SubSpecializationQuerySchema),
  getSubSpecializations
);

/**
 * @swagger
 * /specializations:
 *   post:
 *     summary: Create specialization (Admin)
 *     description: Creates a new specialization. Requires admin access token.
 *     tags: [Specializations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SpecializationInput'
 *     responses:
 *       201:
 *         description: Specialization created
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
 *                         specialization:
 *                           $ref: '#/components/schemas/Specialization'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
specializationRouter.post(
  '/',
  isActive,
  authorizeAdmin,
  validateBody(CreateSpecializationSchema),
  createSpecialization
);

/**
 * @swagger
 * /specializations/{id}:
 *   put:
 *     summary: Update specialization (Admin)
 *     description: Updates an existing specialization by UUID. Requires admin access token.
 *     tags: [Specializations]
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
 *             $ref: '#/components/schemas/SpecializationInput'
 *     responses:
 *       200:
 *         description: Specialization updated
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
 *                         specialization:
 *                           $ref: '#/components/schemas/Specialization'
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
specializationRouter.put(
  '/:specializationId',
  isActive,
  authorizeAdmin,
  validateParams(SpecializationIdParamsSchema),
  validateBody(UpdateSpecializationSchema),
  updateSpecialization
);

/**
 * @swagger
 * /specializations/{id}:
 *   delete:
 *     summary: Delete specialization (Admin)
 *     description: Deletes a specialization by UUID. Requires admin access token.
 *     tags: [Specializations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - $ref: '#/components/parameters/UUIDPathId'
 *     responses:
 *       200:
 *         description: Specialization deleted
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
specializationRouter.delete(
  '/:specializationId',
  isActive,
  authorizeAdmin,
  validateParams(SpecializationIdParamsSchema),
  deleteSpecialization
);

/**
 * @swagger
 * /specializations/{id}/sub-specializations:
 *   post:
 *     summary: Create sub-specialization (Admin)
 *     description: Creates a new sub-specialization under a parent specialization. Requires admin access token.
 *     tags: [Specializations]
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
 *             $ref: '#/components/schemas/SubSpecializationInput'
 *     responses:
 *       201:
 *         description: Sub-specialization created
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
 *                         subSpecialization:
 *                           $ref: '#/components/schemas/SubSpecialization'
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
specializationRouter.post(
  '/:specializationId/sub-specializations',
  isActive,
  authorizeAdmin,
  validateParams(SpecializationIdParamsSchema),
  validateBody(CreateSubSpecializationSchema),
  createSubSpecialization
);

/**
 * @swagger
 * /specializations/{id}/sub-specializations/{subId}:
 *   delete:
 *     summary: Delete sub-specialization (Admin)
 *     description: Deletes a sub-specialization by UUID under a parent specialization. Requires admin access token.
 *     tags: [Specializations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - $ref: '#/components/parameters/UUIDPathId'
 *       - in: path
 *         name: subId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Sub-specialization UUID
 *     responses:
 *       200:
 *         description: Sub-specialization deleted
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
specializationRouter.delete(
  '/:specializationId/sub-specializations/:subSpecializationId',
  isActive,
  authorizeAdmin,
  validateParams(SpecializationIdParamsSchema),
  validateParams(SubSpecializationIdParamsSchema),

  deleteSubSpecialization
);

export default specializationRouter;
