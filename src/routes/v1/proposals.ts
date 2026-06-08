import { Router } from 'express';
import { proposalController } from '../../state.js';
import { isActive } from '../../middlewares/authMiddleware.js';
import { createRoute } from '../../types/asyncHandler.js';
import { OrderIdParamsSchema } from '../../schemas/requests/order.request.js';
import {
  CreateProposalSchema,
  OrderProposalParamsSchema,
} from '../../schemas/requests/proposal.request.js';
import {
  getNegotiations,
  createNegotiation,
  acceptNegotiation,
  rejectNegotiation,
  cancelNegotiation,
} from '../../controllers/NegotiationController.js';
import { CreateNegotiationSchema } from '../../schemas/requests/negotiation.request.js';
import { authorizeApprovedWorker, authorizeWorker, authorizeClient } from 'src/middlewares/accessMiddleware.js';

const proposalsRouter = Router({ mergeParams: true });

proposalsRouter.post(
  '/',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { params: OrderIdParamsSchema, body: CreateProposalSchema },
    handler: proposalController.submit,
  })
);

proposalsRouter.get(
  '/',
  isActive,
  authorizeClient,
  createRoute({
    schemas: { params: OrderIdParamsSchema },
    handler: proposalController.list,
  })
);

proposalsRouter.get(
  '/mine',
  isActive,
  authorizeWorker,
  createRoute({
    schemas: { params: OrderIdParamsSchema },
    handler: proposalController.getMine,
  })
);

proposalsRouter.get(
  '/:proposalId',
  isActive,
  createRoute({
    schemas: { params: OrderProposalParamsSchema },
    handler: proposalController.getById,
  })
);

proposalsRouter.get(
  '/:proposalId/negotiations',
  isActive,
  createRoute({
    schemas: { params: OrderProposalParamsSchema },
    handler: getNegotiations,
  })
);

proposalsRouter.post(
  '/:proposalId/negotiations',
  isActive,
  createRoute({
    schemas: { params: OrderProposalParamsSchema, body: CreateNegotiationSchema },
    handler: createNegotiation,
  })
);

proposalsRouter.post(
  '/:proposalId/negotiations/accept',
  isActive,
  createRoute({
    schemas: { params: OrderProposalParamsSchema },
    handler: acceptNegotiation,
  })
);

proposalsRouter.post(
  '/:proposalId/negotiations/reject',
  isActive,
  createRoute({
    schemas: { params: OrderProposalParamsSchema },
    handler: rejectNegotiation,
  })
);

proposalsRouter.post(
  '/:orderId/negotiations/cancel',
  createRoute({
    schemas: { params: OrderIdParamsSchema },
    handler: cancelNegotiation,
  })
);

export default proposalsRouter;
