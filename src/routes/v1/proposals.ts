import { Router } from 'express';
import { proposalController } from '../../state.js';
import { isActive } from '../../middlewares/authMiddleware.js';
import { validateBody, validateParams } from '../../middlewares/validateRequest.js';
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
  validateParams(OrderIdParamsSchema),
  validateBody(CreateProposalSchema),
  proposalController.submit
);

proposalsRouter.get(
  '/',
  isActive,
  authorizeClient,
  validateParams(OrderIdParamsSchema),
  proposalController.list
);

proposalsRouter.get(
  '/mine',
  isActive,
  authorizeWorker,
  validateParams(OrderIdParamsSchema),
  proposalController.getMine
);

proposalsRouter.get(
  '/:proposalId',
  isActive,
  validateParams(OrderProposalParamsSchema),
  proposalController.getById
);

proposalsRouter.get(
  '/:proposalId/negotiations',
  isActive,
  validateParams(OrderProposalParamsSchema),
  getNegotiations
);

proposalsRouter.post(
  '/:proposalId/negotiations',
  isActive,
  validateParams(OrderProposalParamsSchema),
  validateBody(CreateNegotiationSchema),
  createNegotiation
);

proposalsRouter.post(
  '/:proposalId/negotiations/accept',
  isActive,
  validateParams(OrderProposalParamsSchema),
  acceptNegotiation
);

proposalsRouter.post(
  '/:proposalId/negotiations/reject',
  isActive,
  validateParams(OrderProposalParamsSchema),
  rejectNegotiation
);

proposalsRouter.post(
  '/:orderId/negotiations/cancel',
  validateParams(OrderIdParamsSchema),
  cancelNegotiation
);

export default proposalsRouter;
