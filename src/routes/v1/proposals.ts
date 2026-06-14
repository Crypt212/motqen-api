import { Router } from 'express';
import { proposalController } from '../../state.js';
import { isActive } from '../../middlewares/authMiddleware.js';
import { createRoute } from '../../types/asyncHandler.js';
import { OrderIdParamsSchema } from '../../schemas/requests/order.request.js';
import {
  SubmitProposalRequestSchema, SubmitProposalQuerySchema, SubmitProposalParamsSchema,
  ListProposalsRequestSchema, ListProposalsQuerySchema, ListProposalsParamsSchema,
  GetMyProposalRequestSchema, GetMyProposalQuerySchema, GetMyProposalParamsSchema,
  GetProposalByIdRequestSchema, GetProposalByIdQuerySchema, GetProposalByIdParamsSchema
} from '../../schemas/requests/proposal.request.js';
import {
  GetNegotiationsRequestSchema, GetNegotiationsQuerySchema, GetNegotiationsParamsSchema,
  CreateNegotiationRequestSchema, CreateNegotiationQuerySchema, CreateNegotiationParamsSchema,
  AcceptNegotiationRequestSchema, AcceptNegotiationQuerySchema, AcceptNegotiationParamsSchema,
  RejectNegotiationRequestSchema, RejectNegotiationQuerySchema, RejectNegotiationParamsSchema,
  CancelNegotiationRequestSchema, CancelNegotiationQuerySchema, CancelNegotiationParamsSchema
} from '../../schemas/requests/negotiation.request.js';
import {
  getNegotiations,
  createNegotiation,
  acceptNegotiation,
  rejectNegotiation,
  cancelNegotiation,
} from '../../controllers/NegotiationController.js';

import { authorizeApprovedWorker, authorizeWorker, authorizeClient } from 'src/middlewares/accessMiddleware.js';

const proposalsRouter = Router({ mergeParams: true });

proposalsRouter.post(
  '/',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { body: SubmitProposalRequestSchema, query: SubmitProposalQuerySchema, params: SubmitProposalParamsSchema },
    handler: proposalController.submit,
  })
);

proposalsRouter.get(
  '/',
  isActive,
  authorizeClient,
  createRoute({
    schemas: { body: ListProposalsRequestSchema, query: ListProposalsQuerySchema, params: ListProposalsParamsSchema },
    handler: proposalController.list,
  })
);

proposalsRouter.get(
  '/mine',
  isActive,
  authorizeWorker,
  createRoute({
    schemas: { body: GetMyProposalRequestSchema, query: GetMyProposalQuerySchema, params: GetMyProposalParamsSchema },
    handler: proposalController.getMine,
  })
);

proposalsRouter.get(
  '/:proposalId',
  isActive,
  createRoute({
    schemas: { body: GetProposalByIdRequestSchema, query: GetProposalByIdQuerySchema, params: GetProposalByIdParamsSchema },
    handler: proposalController.getById,
  })
);

proposalsRouter.get(
  '/:proposalId/negotiations',
  isActive,
  createRoute({
    schemas: { body: GetNegotiationsRequestSchema, query: GetNegotiationsQuerySchema, params: GetNegotiationsParamsSchema },
    handler: getNegotiations,
  })
);

proposalsRouter.post(
  '/:proposalId/negotiations',
  isActive,
  createRoute({
    schemas: { body: CreateNegotiationRequestSchema, query: CreateNegotiationQuerySchema, params: CreateNegotiationParamsSchema },
    handler: createNegotiation,
  })
);

proposalsRouter.post(
  '/:proposalId/negotiations/accept',
  isActive,
  createRoute({
    schemas: { body: AcceptNegotiationRequestSchema, query: AcceptNegotiationQuerySchema, params: AcceptNegotiationParamsSchema },
    handler: acceptNegotiation,
  })
);

proposalsRouter.post(
  '/:proposalId/negotiations/reject',
  isActive,
  createRoute({
    schemas: { body: RejectNegotiationRequestSchema, query: RejectNegotiationQuerySchema, params: RejectNegotiationParamsSchema },
    handler: rejectNegotiation,
  })
);

proposalsRouter.post(
  '/:proposalId/negotiations/cancel',
  createRoute({
    schemas: { body: CancelNegotiationRequestSchema, query: CancelNegotiationQuerySchema, params: CancelNegotiationParamsSchema },
    handler: cancelNegotiation,
  })
);

export default proposalsRouter;
