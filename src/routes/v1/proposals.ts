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

const proposalsRouter = Router({ mergeParams: true });

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

proposalsRouter.post(
  '/:proposalId/accept',
  isActive,
  validateParams(OrderProposalParamsSchema),
  proposalController.accept
);

export default proposalsRouter;
