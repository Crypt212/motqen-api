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
import { orderController } from '../../state.js';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validateRequest.js';
import {
  CreateOrderSchema,
  OrderQuerySchema,
  OrderIdParamsSchema,
  OrderRateSchema,
} from '../../schemas/requests/order.request.js';
import multer from 'multer';
import proposalsRouter from './proposals.js';


const router = Router();
router.use('/:orderId/proposals', proposalsRouter);
const upload = multer({ storage: multer.memoryStorage(), limits: { files: 3 } });

router.post(
  '/',
  upload.array('images', 3),
  validateBody(CreateOrderSchema),
  orderController.create
);
router.get('/', validateQuery(OrderQuerySchema), orderController.list);
router.get('/:orderId', validateParams(OrderIdParamsSchema), orderController.getById);
router.delete('/:orderId', validateParams(OrderIdParamsSchema), orderController.cancel);
router.get('/:orderId/location', validateParams(OrderIdParamsSchema), orderController.getLocation);
router.post('/:orderId/start-work', validateParams(OrderIdParamsSchema), orderController.startWork);
router.post(
  '/:orderId/finish-work',
  validateParams(OrderIdParamsSchema),
  orderController.finishWork
);
router.post(
  '/:orderId/rate',
  validateParams(OrderIdParamsSchema),
  validateBody(OrderRateSchema),
  orderController.rate
);
export default router;
