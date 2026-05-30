import { Router } from 'express';
import { refundController } from '../../../state.js';
import { authenticateAccess } from '../../../middlewares/authMiddleware.js';
import { authorizeAdmin } from '../../../middlewares/adminMiddleware.js';

const router = Router();

router.use(authenticateAccess, authorizeAdmin);

/**
 * @swagger
 * /admin/orders/{orderId}/refunds:
 *   post:
 *     summary: Initiate refund
 *     description: Initiates a refund for the specified order. Admin only. Requires an idempotency key to prevent duplicate refunds.
 *     tags: [Refunds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order UUID to refund
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InitiateRefundRequest'
 *     responses:
 *       201:
 *         description: Refund initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       description: Refund object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: Already refunded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: 'Already refunded'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', refundController.initiateRefund);

/**
 * @swagger
 * /admin/orders/{orderId}/refunds:
 *   get:
 *     summary: List refunds for an order
 *     description: Retrieves all refunds for the specified order. Admin only.
 *     tags: [Refunds]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order UUID to list refunds for
 *     responses:
 *       200:
 *         description: List of refunds
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
router.get('/', refundController.listRefunds);

export default router;
