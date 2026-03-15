import { matchedData } from 'express-validator';
import { orderService } from '../state.js';
import SuccessResponse from '../responses/successResponse.js';
import { asyncHandler } from '../types/asyncHandler.js';

/**
 * POST /orders/:draft_order_id/promo
 */
export const applyPromoToDraftOrder = asyncHandler(async (req, res) => {
  const { promo_code } = matchedData(req, { includeOptionals: true });
  const { draft_order_id: draftOrderId } = req.params;

  const result = await orderService.applyPromo({
    clientProfileId: req.userState.client.id,
    draftOrderId,
    promoCode: promo_code,
  });

  new SuccessResponse('Promo code applied successfully', result, 200).send(res);
});
