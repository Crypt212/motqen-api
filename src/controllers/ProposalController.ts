import { asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import ProposalService from '../services/ProposalService.js';
import { OrderIdParamsSchema } from '../schemas/requests/order.request.js';
import {
  CreateProposalSchema,
  ProposalIdParamsSchema,
  OrderProposalParamsSchema,
} from '../schemas/requests/proposal.request.js';
import { ProposalResponseSchema, ProposalListResponseSchema } from '../schemas/responses/proposal.response.js';

export default class ProposalController {
  private proposalService: ProposalService;

  constructor(deps: { proposalService: ProposalService }) {
    this.proposalService = deps.proposalService;
  }

  submit = asyncHandler(async (req, res) => {
    const { orderId } = OrderIdParamsSchema.parse(req.params);
    const parsedBody = CreateProposalSchema.parse(req.body);
    const workerUserId = req.userState.userId;

    const proposal = await this.proposalService.submitProposal({
      orderId,
      userId: workerUserId,
    });

    const fullProposal = await this.proposalService.getProposalById({
      proposalId: proposal.id,
      userId: workerUserId,
    });

    const responsePayload = {
      status: 'success' as const,
      message: 'Proposal submitted successfully',
      data: fullProposal,
    };
    const validated = ProposalResponseSchema.parse(responsePayload);
    new SuccessResponse(validated.message, validated.data, 201).send(res);
  });

  list = asyncHandler(async (req, res) => {
    const { orderId } = OrderIdParamsSchema.parse(req.params);
    const userId = req.userState.userId;

    const proposals = await this.proposalService.getProposals({
      orderId,
      userId,
    });

    const responsePayload = {
      status: 'success' as const,
      message: 'Proposals retrieved successfully',
      data: {
        proposals,
        meta: {
          page: 1,
          limit: proposals.length,
          total: proposals.length,
          totalPages: 1,
        },
      },
    };
    const validated = ProposalListResponseSchema.parse(responsePayload);
    new SuccessResponse(validated.message, validated.data, 200).send(res);
  });

  getById = asyncHandler(async (req, res) => {
    const { orderId, proposalId } = OrderProposalParamsSchema.parse(req.params);
    const userId = req.userState.userId;

    const proposal = await this.proposalService.getProposalById({
      proposalId,
      userId,
    });

    const responsePayload = {
      status: 'success' as const,
      message: 'Proposal retrieved successfully',
      data: proposal,
    };
    const validated = ProposalResponseSchema.parse(responsePayload);
    new SuccessResponse(validated.message, validated.data, 200).send(res);
  });


}
