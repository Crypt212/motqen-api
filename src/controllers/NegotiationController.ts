/**
 * @fileoverview NegotiationController - HTTP handlers for order negotiation endpoints
 * @module controllers/NegotiationController
 */

import SuccessResponse from '../responses/successResponse.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { negotiationService } from '../state.js';

/**
 * GET /orders/:orderId/negotiations
 * Return the full negotiation history for the order, sorted by createdAt DESC.
 */
export const getNegotiations = asyncHandler(async (req, res) => {
  const { orderId, proposalId } = req.params as { orderId: string; proposalId?: string };
  const userState = req.userState;

  const result = await negotiationService.getNegotiations({
    orderId,
    proposalId,
    userState,
  });

  new SuccessResponse('Negotiations retrieved', result, 200).send(res);
});

/**
 * POST /orders/:orderId/negotiations
 * Create a new negotiation offer for the order.
 */
export const createNegotiation = asyncHandler(async (req, res) => {
  const { orderId, proposalId } = req.params as { orderId: string; proposalId?: string };
  const { price, startDate, estimatedDurationHours, note } = req.body;
  const userState = req.userState;

  const negotiation = await negotiationService.createNegotiation({
    orderId,
    proposalId,
    userState,
    price,
    startDate,
    estimatedDurationHours,
    note,
  });

  new SuccessResponse('Negotiation created', negotiation, 201).send(res);
});

/**
 * POST /orders/:orderId/negotiations/accept
 * Accept the most recent pending negotiation offer. Response is the order.
 */
export const acceptNegotiation = asyncHandler(async (req, res) => {
  const { orderId, proposalId } = req.params as { orderId: string; proposalId?: string };
  const userState = req.userState;

  const order = await negotiationService.acceptNegotiation({
    orderId,
    proposalId,
    userState,
  });

  new SuccessResponse('Negotiation accepted', order, 200).send(res);
});

/**
 * POST /orders/:orderId/negotiations/reject
 * Reject the most recent pending negotiation offer.
 */
export const rejectNegotiation = asyncHandler(async (req, res) => {
  const { orderId, proposalId } = req.params as { orderId: string; proposalId?: string };
  const userState = req.userState;

  const negotiation = await negotiationService.rejectNegotiation({
    orderId,
    proposalId,
    userState,
  });

  new SuccessResponse('Negotiation rejected', negotiation, 200).send(res);
});
