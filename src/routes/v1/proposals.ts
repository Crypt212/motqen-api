import { Router } from 'express';
import { proposalController } from '../../state.js';
import { isActive } from '../../middlewares/authMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../middlewares/validateRequest.js';
import { OrderIdParamsSchema } from '../../schemas/requests/order.request.js';
import {
  CreateProposalSchema,
  ProposalIdParamsSchema,
  OrderProposalParamsSchema,
} from '../../schemas/requests/proposal.request.js';
import {
  getNegotiations,
  createNegotiation,
  acceptNegotiation,
  rejectNegotiation,
} from '../../controllers/NegotiationController.js';
import { CreateNegotiationSchema } from '../../schemas/requests/negotiation.request.js';

const proposalsRouter: Router = Router({ mergeParams: true });

proposalsRouter.post(
  '/',
  isActive,
  validateParams(OrderIdParamsSchema),
  validateBody(CreateProposalSchema),
  proposalController.submit
);

proposalsRouter.get(
  '/',
  isActive,
  validateParams(OrderIdParamsSchema),
  proposalController.list
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

export default proposalsRouter;
