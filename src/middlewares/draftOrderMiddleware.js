import AppError from '../errors/AppError.js';
import { orderRepository } from '../state.js';
import { asyncHandler } from '../types/asyncHandler.js';

/**
 * Validate draft order existence, ownership, and expiration for /orders/:draft_order_id/*
 */
export const validateDraftOrderAccess = asyncHandler(async (req, _, next) => {
  const { draft_order_id: draftOrderId } = req.params;
  const draftOrder = await orderRepository.findDraftById(draftOrderId);

  if (!draftOrder) {
    throw new AppError('Draft order not found', 404, null, 'DRAFT_ORDER_NOT_FOUND');
  }

  if (!req.userState?.client?.id) {
    throw new AppError('Only clients can access draft orders', 403, null, 'DRAFT_ORDER_FORBIDDEN');
  }

  if (draftOrder.clientProfileId !== req.userState.client.id) {
    throw new AppError('You do not own this draft order', 403, null, 'DRAFT_ORDER_FORBIDDEN');
  }

  if (new Date(draftOrder.expiresAt) <= new Date()) {
    throw new AppError('Draft order has expired', 410, null, 'DRAFT_ORDER_EXPIRED');
  }

  req.draftOrderState = draftOrder;
  next();
});
