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
  SpecifyRangeSchema,
  OrderRateSchema,
} from '../../schemas/requests/order.request.js';
import multer from 'multer';
import {
  getNegotiations,
  createNegotiation,
  acceptNegotiation,
  rejectNegotiation,
} from '../../controllers/NegotiationController.js';
import { CreateNegotiationSchema } from '../../schemas/requests/negotiation.request.js';


const router = Router();
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
router.post(
  '/:orderId/specify-range',
  validateParams(OrderIdParamsSchema),
  validateBody(SpecifyRangeSchema),
  orderController.specifyRange
);
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
router.get('/:orderId/negotiations', [validateParams(OrderIdParamsSchema)], getNegotiations);
router.post(
  '/:orderId/negotiations',
  [validateParams(OrderIdParamsSchema), validateBody(CreateNegotiationSchema)],
  createNegotiation
);

router.post(
  '/:orderId/negotiations/accept',
  [validateParams(OrderIdParamsSchema)],
  acceptNegotiation
);
router.post(
  '/:orderId/negotiations/reject',
  [validateParams(OrderIdParamsSchema)],
  rejectNegotiation
);
export default router;
