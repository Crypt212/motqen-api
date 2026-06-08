import { asyncHandler } from '../types/asyncHandler.js';
import ProposalService from '../services/ProposalService.js';
import { CreateProposalDTO } from '../schemas/requests/proposal.request.js';
import { ProposalResponseDTO, ProposalListResponseDTO } from '../schemas/responses/proposal.response.js';

export default class ProposalController {
  private proposalService: ProposalService;

  constructor(deps: { proposalService: ProposalService }) {
    this.proposalService = deps.proposalService;
  }

  submit = asyncHandler<ProposalResponseDTO, CreateProposalDTO, any, { orderId: string }>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const parsedBody = req.parsed!.body!;
    const workerUserId = req.userState.userId;

    const proposal = await this.proposalService.submitProposal({
      orderId,
      userId: workerUserId,
    });

    const fullProposal = await this.proposalService.getProposalById({
      proposalId: proposal.id,
      orderId,
      userId: workerUserId,
    });

    res.status(201).send({ status: 'success', message: 'Proposal submitted successfully', data: { proposal: fullProposal } });
  });

  list = asyncHandler<ProposalListResponseDTO, any, any, { orderId: string }>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const userId = req.userState.userId;

    const proposals = await this.proposalService.getProposals({
      orderId,
      userId,
    });

    res.status(200).send({
      status: 'success',
      message: 'Proposals retrieved successfully',
      data: {
        proposals,
        page: 1,
        limit: proposals.length,
        count: proposals.length,
        hasNext: false,
        hasPrev: false,
      },
    });
  });

  getMine = asyncHandler<ProposalResponseDTO, any, any, { orderId: string }>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const workerProfileId = req.userState.worker?.id;

    const proposal = await this.proposalService.getMyProposal({
      orderId,
      workerProfileId
    });

    res.status(200).send({ status: 'success', message: 'Proposal retrieved successfully', data: { proposal } });
  });

  getById = asyncHandler<ProposalResponseDTO, any, any, { orderId: string; proposalId: string }>(async (req, res) => {
    const { orderId, proposalId } = req.parsed!.params!;
    const userId = req.userState.userId;

    const proposal = await this.proposalService.getProposalById({
      proposalId,
      orderId,
      userId,
    });

    res.status(200).send({ status: 'success', message: 'Proposal retrieved successfully', data: { proposal } });
  });


}
