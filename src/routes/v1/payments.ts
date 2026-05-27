import { Router } from 'express';
import { paymentController } from '../../state.js';
import { authenticateAccess, isActive } from '../../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /payments/{orderId}/iframe:
 *   get:
 *     summary: Get payment iframe URL
 *     description: Generates a Paymob payment iframe URL for the specified order. The authenticated user must be the order's client.
 *     tags: [Payments]
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
 *         description: Order UUID to generate payment for
 *     responses:
 *       200:
 *         description: Payment iframe URL generated successfully
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
 *                         iframeUrl:
 *                           type: string
 *                           example: 'https://accept.paymob.com/iframe/12345'
 *                           description: Paymob payment iframe URL
 *       400:
 *         description: Order not in payable state
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: 'fail'
 *               message: 'order not in ordered state'
 *       403:
 *         description: User not authorized to pay for this order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:orderId/iframe', authenticateAccess, isActive, paymentController.getPaymentIframe);       

export default router;
