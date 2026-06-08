/**
 * @fileoverview NegotiationController - HTTP handlers for order negotiation endpoints
 * @module controllers/NegotiationController
 */

import { asyncHandler } from '../types/asyncHandler.js';
import { negotiationService } from '../state.js';
import { CreateNegotiationDTO } from '../schemas/requests/negotiation.request.js';
import { NegotiationListResponseDTO, NegotiationResponseDTO } from '../schemas/responses/negotiation.response.js';
import { OrderResponseDTO } from 'src/schemas/responses/order.response.js';

/**
 * GET /orders/:orderId/negotiations
 * Return the full negotiation history for the order, sorted by createdAt DESC.
 */
export const getNegotiations = asyncHandler<NegotiationListResponseDTO, any, any, { orderId: string; proposalId?: string }>(async (req, res) => {
  const { orderId, proposalId } = req.parsed!.params!;
  const userState = req.userState!;

  const result = await negotiationService.getNegotiations({
    orderId,
    proposalId,
    userState,
  });

  res.status(200).send({ status: 'success', message: 'Negotiations retrieved', data: result });
});

/**
 * POST /orders/:orderId/negotiations
 * Create a new negotiation offer for the order.
 */
export const createNegotiation = asyncHandler<NegotiationResponseDTO, CreateNegotiationDTO, any, { orderId: string; proposalId?: string }>(async (req, res) => {
  const { orderId, proposalId } = req.parsed!.params!;
  const { price, startDate, estimatedDurationHours, note } = req.parsed!.body!;
  const userState = req.userState!;

  const negotiation = await negotiationService.createNegotiation({
    orderId,
    proposalId,
    userState,
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
export const acceptNegotiation = asyncHandler<OrderResponseDTO, any, any, { orderId: string; proposalId?: string }>(async (req, res) => {
  const { orderId, proposalId } = req.parsed!.params!;
  const userState = req.userState!;

  const order = await negotiationService.acceptNegotiation({
    orderId,
    proposalId,
    userState,
  });

  res.status(200).send({ status: 'success', message: 'Negotiation accepted', data: { order } });
});

/**
 * POST /orders/:orderId/negotiations/reject
 * Reject the most recent pending negotiation offer.
 */
export const rejectNegotiation = asyncHandler<NegotiationResponseDTO, any, any, { orderId: string; proposalId?: string }>(async (req, res) => {
  const { orderId, proposalId } = req.parsed!.params!;
  const userState = req.userState!;

  const negotiation = await negotiationService.rejectNegotiation({
    orderId,
    proposalId,
    userState,
  });

  res.status(200).send({ status: 'success', message: 'Negotiation rejected', data: { negotiation } });
});


/**
 * POST /orders/:orderId/negotiations/cancel
 * Cancels the most recent negotiation offer, only if it is pending.
 */
export const cancelNegotiation = asyncHandler<NegotiationResponseDTO, any, any, { orderId: string; proposalId?: string }>(async (req, res) => {
  const { orderId, proposalId } = req.parsed!.params!;
  const userState = req.userState!;

  const negotiation = await negotiationService.cancelNegotiation({
    orderId,
    proposalId,
    userState,
  });

  res.status(200).send({ status: 'success', message: 'Negotiation cancelled', data: { negotiation } });
});
