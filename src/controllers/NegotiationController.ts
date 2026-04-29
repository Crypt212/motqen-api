import { asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import NegotiationService from '../services/NegotiationService.js';
import { NegotiationDirection } from '../domain/negotiation.entity.js';

export default class NegotiationController {
  private negotiationService: NegotiationService;

  constructor(deps: { negotiationService: NegotiationService }) {
    this.negotiationService = deps.negotiationService;
  }

  create = asyncHandler(async (req, res) => {
    const { orderId, price, direction, note } = req.body;
    const senderId = req.userState!.userId;

    const negotiation = await this.negotiationService.createNegotiation({
      orderId,
      price,
      direction: direction as NegotiationDirection,
      senderId,
      note,
    });
    new SuccessResponse('Negotiation created successfully', { negotiation }, 201).send(res);
  });

  listByOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const negotiations = await this.negotiationService.getNegotiationsByOrder({
      orderId: orderId as string,
    });
    new SuccessResponse('Negotiations retrieved successfully', { negotiations }, 200).send(res);
  });

  accept = asyncHandler(async (req, res) => {
    const { negotiationId } = req.params;
    const userState = req.userState!;

    const negotiation = await this.negotiationService.acceptNegotiation({
      negotiationId: negotiationId as string,
      acceptedByUserId: userState.userId,
      workerProfileId: userState.worker?.id,
    });
    new SuccessResponse('Negotiation accepted successfully', { negotiation }, 200).send(res);
  });

  reject = asyncHandler(async (req, res) => {
    const { negotiationId } = req.params;

    const negotiation = await this.negotiationService.rejectNegotiation({
      negotiationId: negotiationId as string,
    });
    new SuccessResponse('Negotiation rejected successfully', { negotiation }, 200).send(res);
  });
}
