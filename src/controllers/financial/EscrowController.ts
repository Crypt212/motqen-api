import { Request, Response } from 'express';
import { EscrowService } from '../../services/financial/EscrowService.js';

export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  public manualRelease = async (req: Request, res: Response): Promise<void> => {
    try {
      const holdId = req.params.id as string;
      if (!holdId) {
        res.status(400).json({ error: 'holdId required' });
        return;
      }

      await this.escrowService.releaseHold(holdId);

      res.status(200).json({ status: 'success', message: `Hold ${holdId} released` });
    } catch (error: any) {
      const msg = error.message || '';
      if (msg.includes('is not yet eligible') || msg.includes('Cannot release escrow hold') || msg.includes('not found')) {
        res.status(422).json({ error: msg });
        return;
      }
      if (msg.includes('Idempotent')) { // Or handled already in the method
        res.status(409).json({ error: 'Already released' });
        return;
      }
      console.error('Error during manual release:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, orderId, limit, offset } = req.query;
      const parsedLimit = limit ? parseInt(limit as string, 10) : 20;
      const parsedOffset = offset ? parseInt(offset as string, 10) : 0;

      const holds = await this.escrowService.listHolds({
        status: status as string,
        orderId: orderId as string,
      }, parsedLimit, parsedOffset);

      res.status(200).json({ status: 'success', data: holds });
    } catch (error: any) {
      console.error('Error listing escrow holds:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
