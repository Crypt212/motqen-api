import { Request, Response } from 'express';
import { RefundService } from '../../services/financial/RefundService.js';
import { IRefundRepository } from '../../repositories/interfaces/financial/RefundRepository.js';
import { initiateRefundSchema } from '../../schemas/financial/refund.schema.js';

export class RefundController {
  constructor(
    private readonly refundService: RefundService,
    private readonly refundRepo: IRefundRepository
  ) {}

  public initiateRefund = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.orderId as string;
      const adminId = (req as any).user?.id || 'admin';

      const parsed = initiateRefundSchema.parse(req.body);

      const refund = await this.refundService.initiateRefund(
        orderId,
        parsed.reason_code as any, // Enum mapping if needed
        adminId,
        parsed.idempotency_key,
        parsed.notes
      );

      res.status(201).json({ status: 'success', data: refund });
    } catch (e: any) {
      if (e.name === 'ConflictError' || e.message === 'ALREADY_REFUNDED') {
        res.status(409).json({ error: 'Already refunded' });
      } else {
        res.status(400).json({ error: e.message });
      }
    }
  };

  public listRefunds = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.params.orderId as string;
      const refunds = await this.refundRepo.findByOrderId(orderId);
      res.status(200).json({ status: 'success', data: refunds });
    } catch (e: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
