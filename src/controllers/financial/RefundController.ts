import { RefundService } from '../../services/financial/RefundService.js';
import { IRefundRepository } from '../../repositories/interfaces/financial/RefundRepository.js';
import { initiateRefundSchema } from '../../schemas/financial/refund.schema.js';
import { asyncHandler } from 'src/types/asyncHandler.js';
import SuccessResponse from 'src/responses/successResponse.js';

export class RefundController {
  constructor(
    private readonly refundService: RefundService,
    private readonly refundRepo: IRefundRepository
  ) {}

  public initiateRefund = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId as string;
    const adminId = req.userState.userId; 
    const parsed = initiateRefundSchema.parse(req.body);

    const refund = await this.refundService.initiateRefund(
      orderId,
      parsed.reason_code, // Enum mapping if needed
      adminId,
      parsed.idempotency_key,
      parsed.notes
    );
    new SuccessResponse("Refund initiated successfully", refund,201).send(res);
  });

  public listRefunds = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId as string;
    const refunds = await this.refundRepo.findByOrderId(orderId);
    new SuccessResponse("Refunds listed successfully", refunds,200).send(res);
  });
}
