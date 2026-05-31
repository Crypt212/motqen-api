import { Router } from 'express';
import { escrowController } from '../../../state.js';
import { authenticateAccess } from '../../../middlewares/authMiddleware.js';
import { authorizeAdmin } from '../../../middlewares/accessMiddleware.js';

const router = Router();

router.use(authenticateAccess, authorizeAdmin);

/**
 * @swagger
 * /admin/escrow-holds:
 *   get:
 *     summary: List escrow holds
 *     description: Retrieves a paginated list of escrow holds with optional filters. Admin only.
 *     tags: [Escrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by escrow hold status
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by order UUID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of escrow holds
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', escrowController.list);

/**
 * @swagger
 * /admin/escrow-holds/{id}/release:
 *   post:
 *     summary: Manual release escrow hold
 *     description: Manually releases an escrow hold by ID. The hold must be eligible for release. Admin only.
 *     tags: [Escrow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Escrow hold UUID to release
 *     responses:
 *       200:
 *         description: Escrow hold released successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 'Hold 123e4567-e89b-12d3-a456-426614174000 released'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Already released
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: 'Already released'
 *       422:
 *         description: Hold not eligible for release
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/release', escrowController.manualRelease);

export default router;
