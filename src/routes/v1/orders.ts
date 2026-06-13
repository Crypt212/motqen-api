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
  CreateOrderRequestSchema,
  CreateOrderQuerySchema,
  CreateOrderParamsSchema,
  GetOrdersRequestSchema,
  GetOrdersQuerySchema,
  GetOrdersParamsSchema,
  GetOrderByIdRequestSchema,
  GetOrderByIdQuerySchema,
  GetOrderByIdParamsSchema,
  CancelOrderRequestSchema,
  CancelOrderQuerySchema,
  CancelOrderParamsSchema,
  GetOrderLocationRequestSchema,
  GetOrderLocationQuerySchema,
  GetOrderLocationParamsSchema,
  StartWorkRequestSchema,
  StartWorkQuerySchema,
  StartWorkParamsSchema,
  FinishWorkRequestSchema,
  FinishWorkQuerySchema,
  FinishWorkParamsSchema,
  RateOrderRequestSchema,
  RateOrderQuerySchema,
  RateOrderParamsSchema,
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
import {
  GetNegotiationsRequestSchema, GetNegotiationsQuerySchema, GetNegotiationsParamsSchema,
  CreateNegotiationRequestSchema, CreateNegotiationQuerySchema, CreateNegotiationParamsSchema,
  AcceptNegotiationRequestSchema, AcceptNegotiationQuerySchema, AcceptNegotiationParamsSchema,
  RejectNegotiationRequestSchema, RejectNegotiationQuerySchema, RejectNegotiationParamsSchema,
  CancelNegotiationRequestSchema, CancelNegotiationQuerySchema, CancelNegotiationParamsSchema,
} from '../../schemas/requests/negotiation.request.js';
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
    schemas: { body: CreateOrderRequestSchema, query: CreateOrderQuerySchema, params: CreateOrderParamsSchema },
    handler: orderController.create,
  })
);
router.get(
  '/',
  createRoute({
    schemas: { body: GetOrdersRequestSchema, query: GetOrdersQuerySchema, params: GetOrdersParamsSchema },
    handler: orderController.list,
  })
);
router.get(
  '/:orderId',
  createRoute({
    schemas: { body: GetOrderByIdRequestSchema, query: GetOrderByIdQuerySchema, params: GetOrderByIdParamsSchema },
    handler: orderController.getById,
  })
);
router.delete(
  '/:orderId',
  authorizeClient,
  createRoute({
    schemas: { body: CancelOrderRequestSchema, query: CancelOrderQuerySchema, params: CancelOrderParamsSchema },
    handler: orderController.cancel,
  })
);
router.get(
  '/:orderId/location',
  createRoute({
    schemas: { body: GetOrderLocationRequestSchema, query: GetOrderLocationQuerySchema, params: GetOrderLocationParamsSchema },
    handler: orderController.getLocation,
  })
);
router.post(
  '/:orderId/start-work',
  authorizeWorker,
  createRoute({
    schemas: { body: StartWorkRequestSchema, query: StartWorkQuerySchema, params: StartWorkParamsSchema },
    handler: orderController.startWork,
  })
);
router.post(
  '/:orderId/finish-work',
  authorizeWorker,
  createRoute({
    schemas: { body: FinishWorkRequestSchema, query: FinishWorkQuerySchema, params: FinishWorkParamsSchema },
    handler: orderController.finishWork,
  })
);
router.post(
  '/:orderId/rate',
  authorizeClient,
  createRoute({
    schemas: { body: RateOrderRequestSchema, query: RateOrderQuerySchema, params: RateOrderParamsSchema },
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
    schemas: { body: GetNegotiationsRequestSchema, query: GetNegotiationsQuerySchema, params: GetNegotiationsParamsSchema },
    handler: getNegotiations,
  })
);

router.post(
  '/:orderId/negotiations',
  createRoute({
    schemas: { body: CreateNegotiationRequestSchema, query: CreateNegotiationQuerySchema, params: CreateNegotiationParamsSchema },
    handler: createNegotiation,
  })
);

router.post(
  '/:orderId/negotiations/accept',
  createRoute({
    schemas: { body: AcceptNegotiationRequestSchema, query: AcceptNegotiationQuerySchema, params: AcceptNegotiationParamsSchema },
    handler: acceptNegotiation,
  })
);

router.post(
  '/:orderId/negotiations/reject',
  createRoute({
    schemas: { body: RejectNegotiationRequestSchema, query: RejectNegotiationQuerySchema, params: RejectNegotiationParamsSchema },
    handler: rejectNegotiation,
  })
);

router.post(
  '/:orderId/negotiations/cancel',
  createRoute({
    schemas: { body: CancelNegotiationRequestSchema, query: CancelNegotiationQuerySchema, params: CancelNegotiationParamsSchema },
    handler: cancelNegotiation,
  })
);

export default router;
