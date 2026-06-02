import { RefundService } from '../../services/financial/RefundService.js';
import { asyncHandler } from 'src/types/asyncHandler.js';
import SuccessResponse from 'src/responses/successResponse.js';
import AppError from '../../errors/AppError.js';

export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  public initiateRefund = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId as string;
    const adminId = req.adminState?.adminId;
    if (!adminId) throw new AppError('Unauthorized', 401);

    const refund = await this.refundService.initiateRefund(
      orderId,
      req.body.reason_code,
      adminId,
      req.body.idempotency_key,
      req.body.notes
    );
    new SuccessResponse('Refund initiated successfully', refund, 201).send(res);
  });

  public listRefunds = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId as string;
    const refunds = await this.refundService.listByOrderId(orderId);
    new SuccessResponse('Refunds listed successfully', refunds, 200).send(res);
  });
}
