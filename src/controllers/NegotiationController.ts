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
  const orderId = req.params.orderId as string;
  const userState = req.userState;

  const result = await negotiationService.getNegotiations({
    orderId,
    userState,
  });

  new SuccessResponse('Negotiations retrieved', result, 200).send(res);
});

/**
 * POST /orders/:orderId/negotiations
 * Create a new negotiation offer for the order.
 */
export const createNegotiation = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId as string;
  const { price, note } = req.body;
  const userState = req.userState;

  const negotiation = await negotiationService.createNegotiation({
    orderId,
    userState,
    price,
    note,
  });

  new SuccessResponse('Negotiation created', negotiation, 201).send(res);
});

/**
 * POST /orders/:orderId/negotiations/accept
 * Accept the most recent pending negotiation offer.
 */
export const acceptNegotiation = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId as string;
  const userState = req.userState;

  const order = await negotiationService.acceptNegotiation({
    orderId,
    userState,
  });

  new SuccessResponse('Negotiation accepted', order, 200).send(res);
});

/**
 * POST /orders/:orderId/negotiations/reject
 * Reject the most recent pending negotiation offer.
 */
export const rejectNegotiation = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId as string;
  const userState = req.userState;

  const negotiation = await negotiationService.rejectNegotiation({
    orderId,
    userState,
  });

  new SuccessResponse('Negotiation rejected', negotiation, 200).send(res);
});
