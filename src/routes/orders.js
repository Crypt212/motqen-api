import { Router } from 'express';
import { authenticateAccess, isActive } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { validateDraftOrderAccess } from '../middlewares/draftOrderMiddleware.js';
import { applyPromoToDraftOrder } from '../controllers/OrderController.js';
import { validateApplyPromo, validateDraftOrderIdParam } from '../validators/orders.js';

const ordersRouter = Router();

ordersRouter.use(
  '/:draft_order_id',
  authenticateAccess,
  isActive,
  ...validateDraftOrderIdParam,
  validateRequest,
  validateDraftOrderAccess,
);

/**
 * @swagger
 * /orders/{draft_order_id}/promo:
 *   post:
 *     summary: Apply promo code to a draft order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - in: path
 *         name: draft_order_id
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
 *             required: [promo_code]
 *             properties:
 *               promo_code:
 *                 type: string
 *                 example: SUMMER25
 *     responses:
 *       200:
 *         description: Promo applied successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       410:
 *         $ref: '#/components/responses/Gone'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
ordersRouter.post(
  '/:draft_order_id/promo',
  ...validateApplyPromo,
  validateRequest,
  applyPromoToDraftOrder,
);

export default ordersRouter;
