/**
 * @fileoverview NegotiationController - HTTP handlers for order negotiation endpoints
 * @module controllers/NegotiationController
 */

import { asyncHandler } from '../types/asyncHandler.js';
import { negotiationService } from '../state.js';
import {
  GetNegotiationsRequestDTO,
  GetNegotiationsQueryDTO,
  GetNegotiationsParamsDTO,
  CreateNegotiationRequestDTO,
  CreateNegotiationQueryDTO,
  CreateNegotiationParamsDTO,
  AcceptNegotiationRequestDTO,
  AcceptNegotiationQueryDTO,
  AcceptNegotiationParamsDTO,
  RejectNegotiationRequestDTO,
  RejectNegotiationQueryDTO,
  RejectNegotiationParamsDTO,
  CancelNegotiationRequestDTO,
  CancelNegotiationQueryDTO,
  CancelNegotiationParamsDTO
} from '../schemas/requests/negotiation.request.js';
import { parseQuery } from '../schemas/common.js';
import {
  GetNegotiationsResponseDTO,
  CreateNegotiationResponseDTO,
  AcceptNegotiationResponseDTO,
  RejectNegotiationResponseDTO,
  CancelNegotiationResponseDTO
} from '../schemas/responses/negotiation.response.js';

/**
 * GET /orders/:orderId/negotiations
 * Return the full negotiation history for the order, sorted by createdAt DESC.
 */
export const getNegotiations = asyncHandler<GetNegotiationsResponseDTO, GetNegotiationsRequestDTO, GetNegotiationsQueryDTO, GetNegotiationsParamsDTO>(async (req, res) => {
  const { orderId, proposalId } = req.parsed!.params!;
  const userState = req.userState!;
  const role = userState.role;
  const profileId = role === 'WORKER' ? userState.worker!.id! : userState.client!.id!;
  const { pagination } = parseQuery(req.parsed!.query!);

  console.log(
    orderId,
    proposalId,
    role,
    profileId,
    pagination,
  );
  const result = await negotiationService.getNegotiations({
    orderId,
    proposalId,
    role,
    profileId,
    pagination,
  });

  res.status(200).send({ status: 'success', message: 'Negotiations retrieved', data: result });
});

/**
 * POST /orders/:orderId/negotiations
 * Create a new negotiation offer for the order.
 */
export const createNegotiation = asyncHandler<CreateNegotiationResponseDTO, CreateNegotiationRequestDTO, CreateNegotiationQueryDTO, CreateNegotiationParamsDTO>(async (req, res) => {
  const { orderId, proposalId } = req.parsed!.params!;
  const { price, startDate, estimatedDurationHours, note } = req.parsed!.body!;
  const userState = req.userState!;
  const userId = userState.userId;
  const role = userState.role;
  const profileId = role === 'WORKER' ? userState.worker!.id! : userState.client!.id!;

  const negotiation = await negotiationService.createNegotiation({
    orderId,
    proposalId,
    userId,
    profileId,
    role,
    price: price!,
    startDate: startDate ?? undefined,
    estimatedDurationHours,
    note,
  });

  res.status(201).send({ status: 'success', message: 'Negotiation created', data: { negotiation } });
});

/**
 * POST /orders/:orderId/negotiations/accept
 * Accept the most recent pending negotiation offer. Response is the order.
 */
export const acceptNegotiation = asyncHandler<AcceptNegotiationResponseDTO, AcceptNegotiationRequestDTO, AcceptNegotiationQueryDTO, AcceptNegotiationParamsDTO>(async (req, res) => {
  const { orderId, proposalId } = req.parsed!.params!;
  const userState = req.userState!;
  const role = userState.role;
  const profileId = role === 'WORKER' ? userState.worker!.id! : userState.client!.id!;

  const order = await negotiationService.acceptNegotiation({
    orderId,
    proposalId,
    role,
    profileId,
  });

  res.status(200).send({ status: 'success', message: 'Negotiation accepted', data: { order } });
});

/**
 * POST /orders/:orderId/negotiations/reject
 * Reject the most recent pending negotiation offer.
 */
export const rejectNegotiation = asyncHandler<RejectNegotiationResponseDTO, RejectNegotiationRequestDTO, RejectNegotiationQueryDTO, RejectNegotiationParamsDTO>(async (req, res) => {
  const { orderId, proposalId } = req.parsed!.params!;
  const userState = req.userState!;
  const role = userState.role;
  const profileId = role === 'WORKER' ? userState.worker!.id! : userState.client!.id!;

  const negotiation = await negotiationService.rejectNegotiation({
    orderId,
    proposalId,
    role,
    profileId,
  });

  res.status(200).send({ status: 'success', message: 'Negotiation rejected', data: { negotiation } });
});


/**
 * POST /orders/:orderId/negotiations/cancel
 * Cancels the most recent negotiation offer, only if it is pending.
 */
export const cancelNegotiation = asyncHandler<CancelNegotiationResponseDTO, CancelNegotiationRequestDTO, CancelNegotiationQueryDTO, CancelNegotiationParamsDTO>(async (req, res) => {
  const { orderId, proposalId } = req.parsed!.params!;
  const userState = req.userState!;
  const role = userState.role;
  const profileId = role === 'WORKER' ? userState.worker!.id! : userState.client!.id!;

  const negotiation = await negotiationService.cancelNegotiation({
    orderId,
    proposalId,
    role,
    profileId,
  });

  res.status(200).send({ status: 'success', message: 'Negotiation cancelled', data: { negotiation } });
});
