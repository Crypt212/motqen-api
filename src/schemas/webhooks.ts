import { Router } from 'express';
import { webhookController } from '../../state.js';

const router = Router();

/**
 * @swagger
 * /webhooks/paymob:
 *   post:
 *     summary: Handle Paymob webhook
 *     description: Receives and processes Paymob payment transaction webhooks. Validates the payload, records payment attempts, creates payments and escrow holds on success, and emits real-time socket events. No authentication required — called by Paymob servers.
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymobWebhookPayload'
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'processed'
 *       400:
 *         description: Invalid webhook payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/paymob', webhookController.handlePaymobWebhook);

export default router;
