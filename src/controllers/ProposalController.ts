import { asyncHandler } from '../types/asyncHandler.js';
import ProposalService from '../services/ProposalService.js';
import {
  SubmitProposalRequestDTO,
  SubmitProposalQueryDTO,
  SubmitProposalParamsDTO,
  ListProposalsRequestDTO,
  ListProposalsQueryDTO,
  ListProposalsParamsDTO,
  GetMyProposalRequestDTO,
  GetMyProposalQueryDTO,
  GetMyProposalParamsDTO,
  GetProposalByIdRequestDTO,
  GetProposalByIdQueryDTO,
  GetProposalByIdParamsDTO
} from '../schemas/requests/proposal.request.js';
import {
  SubmitProposalResponseDTO,
  ListProposalsResponseDTO,
  GetMyProposalResponseDTO,
  GetProposalByIdResponseDTO
} from '../schemas/responses/proposal.response.js';
import { parseQuery } from '../schemas/common.js';

export default class ProposalController {
  private proposalService: ProposalService;

  constructor(deps: { proposalService: ProposalService }) {
    this.proposalService = deps.proposalService;
  }

  submit = asyncHandler<SubmitProposalResponseDTO, SubmitProposalRequestDTO, SubmitProposalQueryDTO, SubmitProposalParamsDTO>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
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

  list = asyncHandler<ListProposalsResponseDTO, ListProposalsRequestDTO, ListProposalsQueryDTO, ListProposalsParamsDTO>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const userId = req.userState.userId;
    const { filter, pagination, sortBy, sortOrder } = parseQuery(req.parsed!.query!);

    const result = await this.proposalService.getProposals({
      orderId,
      userId,
      filter,
      pagination,
      sort: sortBy.map((field, index) => ({ sortBy: field as any, sortOrder: sortOrder[index] })),
    });

    res.status(200).send({
      status: 'success',
      message: 'Proposals retrieved successfully',
      data: result,
    });
  });

  getMine = asyncHandler<GetMyProposalResponseDTO, GetMyProposalRequestDTO, GetMyProposalQueryDTO, GetMyProposalParamsDTO>(async (req, res) => {
    const { orderId } = req.parsed!.params!;
    const workerProfileId = req.userState.worker?.id;

    const proposal = await this.proposalService.getMyProposal({
      orderId,
      workerProfileId
    });

    res.status(200).send({ status: 'success', message: 'Proposal retrieved successfully', data: { proposal } });
  });

  getById = asyncHandler<GetProposalByIdResponseDTO, GetProposalByIdRequestDTO, GetProposalByIdQueryDTO, GetProposalByIdParamsDTO>(async (req, res) => {
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
