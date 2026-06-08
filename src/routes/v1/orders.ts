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
import { createRoute } from '../../types/asyncHandler.js';
import {
  CreateOrderSchema,
  OrderQuerySchema,
  OrderIdParamsSchema,
  OrderRateSchema,
} from '../../schemas/requests/order.request.js';
import multer from 'multer';
import proposalsRouter from './proposals.js';
import {
  getNegotiations,
  createNegotiation,
  acceptNegotiation,
  rejectNegotiation,
  cancelNegotiation,
} from '../../controllers/NegotiationController.js';
import { CreateNegotiationSchema } from '../../schemas/requests/negotiation.request.js';
import { parseFormDataJson } from 'src/middlewares/multiformParserMiddleware.js';
import { authorizeClient, authorizeWorker } from 'src/middlewares/accessMiddleware.js';


const router = Router();
router.use('/:orderId/proposals', proposalsRouter);
const upload = multer({ storage: multer.memoryStorage(), limits: { files: 3 } });

router.post(
  '/',
  upload.array('images', 3),
  parseFormDataJson('orderData'),
  authorizeClient,
  createRoute({
    schemas: { body: CreateOrderSchema },
    handler: orderController.create,
  })
);
router.get(
  '/',
  createRoute({
    schemas: { query: OrderQuerySchema },
    handler: orderController.list,
  })
);
router.get(
  '/:orderId',
  createRoute({
    schemas: { params: OrderIdParamsSchema },
    handler: orderController.getById,
  })
);
router.delete(
  '/:orderId',
  authorizeClient,
  createRoute({
    schemas: { params: OrderIdParamsSchema },
    handler: orderController.cancel,
  })
);
router.get(
  '/:orderId/location',
  createRoute({
    schemas: { params: OrderIdParamsSchema },
    handler: orderController.getLocation,
  })
);
router.post(
  '/:orderId/start-work',
  authorizeWorker,
  createRoute({
    schemas: { params: OrderIdParamsSchema },
    handler: orderController.startWork,
  })
);
router.post(
  '/:orderId/finish-work',
  authorizeWorker,
  createRoute({
    schemas: { params: OrderIdParamsSchema },
    handler: orderController.finishWork,
  })
);
router.post(
  '/:orderId/rate',
  authorizeClient,
  createRoute({
    schemas: { params: OrderIdParamsSchema, body: OrderRateSchema },
    handler: orderController.rate,
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// DIRECT ORDER NEGOTIATION ROUTES
// ─────────────────────────────────────────────────────────────────────────────
// These routes are used for Direct Orders (where proposalId is implicit)

router.get(
  '/:orderId/negotiations',
  createRoute({
    schemas: { params: OrderIdParamsSchema },
    handler: getNegotiations,
  })
);

router.post(
  '/:orderId/negotiations',
  createRoute({
    schemas: { params: OrderIdParamsSchema, body: CreateNegotiationSchema },
    handler: createNegotiation,
  })
);

router.post(
  '/:orderId/negotiations/accept',
  createRoute({
    schemas: { params: OrderIdParamsSchema },
    handler: acceptNegotiation,
  })
);

router.post(
  '/:orderId/negotiations/reject',
  createRoute({
    schemas: { params: OrderIdParamsSchema },
    handler: rejectNegotiation,
  })
);

router.post(
  '/:orderId/negotiations/cancel',
  createRoute({
    schemas: { params: OrderIdParamsSchema },
    handler: cancelNegotiation,
  })
);

export default router;
