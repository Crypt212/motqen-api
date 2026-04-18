/**
 * @fileoverview Orders Routes - Negotiation sub-routes nested under /orders/:orderId
 * @module routes/v1/orders
 *
 * This file ONLY contains negotiation endpoints.
 * No order CRUD is implemented here.
 *
 * All routes require:
 *   - Authorization: Bearer <access_token>
 *   - User account must be ACTIVE
 *
 * Base path: /orders
 */

import { Router } from 'express';
import { authenticateAccess, isActive } from '../../middlewares/authMiddleware.js';
import { validateBody, validateParams } from '../../middlewares/validateRequest.js';
import { OrderIdParamsSchema, CreateNegotiationSchema } from '../../schemas/negotiations.js';
import {
  getNegotiations,
  createNegotiation,
  acceptNegotiation,
  rejectNegotiation,
} from '../../controllers/NegotiationController.js';

const ordersRouter = Router();

// All order/negotiation routes require authentication + active account
ordersRouter.use(authenticateAccess, isActive);

// ─────────────────────────────────────────────────────────────────────────────
// GET /orders/:orderId/negotiations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /orders/{orderId}/negotiations:
 *   get:
 *     tags: [Negotiations]
 *     summary: Get negotiation history for an order
 *     description: |
 *       Returns the full negotiation history for the specified order,
 *       sorted by createdAt DESC (newest first at index [0]).
 *       Only the client of the order or the assigned worker can access it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order UUID
 *     responses:
 *       200:
 *         description: Negotiation history retrieved
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Requester is not a party to this order
 *       404:
 *         description: Order not found
 */
ordersRouter.get('/:orderId/negotiations', [validateParams(OrderIdParamsSchema)], getNegotiations);

// ─────────────────────────────────────────────────────────────────────────────
// POST /orders/:orderId/negotiations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /orders/{orderId}/negotiations:
 *   post:
 *     tags: [Negotiations]
 *     summary: Create a new negotiation offer
 *     description: |
 *       Submit a new price offer for the order.
 *       Only allowed when order status is PENDING or TIME_SPECIFIED.
 *       Blocked if the previous offer is still PENDING (anti-spam).
 *       Direction is inferred from the requester's role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [price]
 *             properties:
 *               price:
 *                 type: number
 *                 example: 400.00
 *               note:
 *                 type: string
 *                 example: "Final offer"
 *     responses:
 *       201:
 *         description: Negotiation created
 *       400:
 *         description: Wrong order status or previous offer still pending
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Requester is not a party to this order
 *       404:
 *         description: Order not found
 */
ordersRouter.post(
  '/:orderId/negotiations',
  [validateParams(OrderIdParamsSchema), validateBody(CreateNegotiationSchema)],
  createNegotiation
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /orders/:orderId/negotiations/accept
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /orders/{orderId}/negotiations/accept:
 *   post:
 *     tags: [Negotiations]
 *     summary: Accept the latest pending negotiation
 *     description: |
 *       Accepts the most recent PENDING negotiation.
 *       Only the opponent of the offer creator can accept.
 *       Atomically sets negotiation.status = ACCEPTED,
 *       order.finalPrice = negotiation.price, order.orderStatus = PRICE_AGREED.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Negotiation accepted, order updated
 *       400:
 *         description: No pending negotiation to accept
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Cannot accept your own offer
 *       404:
 *         description: Order not found
 */
ordersRouter.post(
  '/:orderId/negotiations/accept',
  [validateParams(OrderIdParamsSchema)],
  acceptNegotiation
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /orders/:orderId/negotiations/reject
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /orders/{orderId}/negotiations/reject:
 *   post:
 *     tags: [Negotiations]
 *     summary: Reject the latest pending negotiation
 *     description: |
 *       Rejects the most recent PENDING negotiation.
 *       Only the opponent of the offer creator can reject.
 *       Sets negotiation.status = REJECTED, unlocking new offers.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Negotiation rejected
 *       400:
 *         description: No pending negotiation to reject
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Cannot reject your own offer
 *       404:
 *         description: Order not found
 */
ordersRouter.post(
  '/:orderId/negotiations/reject',
  [validateParams(OrderIdParamsSchema)],
  rejectNegotiation
);

export default ordersRouter;
