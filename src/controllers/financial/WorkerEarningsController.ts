import { Request, Response } from 'express';
import { WithdrawalService } from '../../services/financial/WithdrawalService.js';
import { payoutMethodSchema, withdrawRequestSchema } from '../../schemas/financial/withdrawal.schema.js';

export class WorkerEarningsController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  public getMyEarnings = async (req: Request, res: Response): Promise<void> => {
    try {
      const workerProfileId = (req as any).user?.workerProfile?.id;
      if (!workerProfileId) {
        res.status(403).json({ error: 'Worker profile required' });
        return;
      }

      const balance = await this.withdrawalService.getBalance(workerProfileId);

      // Convert BigInt to string for JSON serialization
      const serialized = {
        total_earned: balance.totalEarned.toString(),
        withdrawn: balance.withdrawn.toString(),
        pending_withdraw: balance.pendingWithdraw.toString(),
        on_hold_for_dispute: balance.onHoldForDispute.toString(),
        available_to_withdraw: balance.availableToWithdraw.toString()
      };

      res.status(200).json({ status: 'success', data: serialized });
    } catch (error) {
      console.error('Error getting earnings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public listWithdrawRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      const workerProfileId = (req as any).user?.workerProfile?.id;
      if (!workerProfileId) {
        res.status(403).json({ error: 'Worker profile required' });
        return;
      }
      const limit = Number(req.query.limit) || 20;
      const offset = Number(req.query.offset) || 0;
      const data = await this.withdrawalService.listWithdrawRequests(workerProfileId, limit, offset);
      res.status(200).json({ status: 'success', data });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public createWithdrawRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const workerProfileId = (req as any).user?.workerProfile?.id;
      if (!workerProfileId) {
        res.status(403).json({ error: 'Worker profile required' });
        return;
      }
      const parsed = withdrawRequestSchema.parse(req.body);
      const data = await this.withdrawalService.createWithdrawRequest(
        workerProfileId,
        BigInt(parsed.amount),
        parsed.payout_method_id,
        parsed.idempotency_key
      );
      res.status(201).json({ status: 'success', data });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };

  public listPayoutMethods = async (req: Request, res: Response): Promise<void> => {
    try {
      const workerProfileId = (req as any).user?.workerProfile?.id;
      if (!workerProfileId) {
        res.status(403).json({ error: 'Worker profile required' });
        return;
      }
      const data = await this.withdrawalService.listPayoutMethods(workerProfileId);
      res.status(200).json({ status: 'success', data });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public addPayoutMethod = async (req: Request, res: Response): Promise<void> => {
    try {
      const workerProfileId = (req as any).user?.workerProfile?.id;
      if (!workerProfileId) {
        res.status(403).json({ error: 'Worker profile required' });
        return;
      }
      const parsed = payoutMethodSchema.parse(req.body);
      const data = await this.withdrawalService.addPayoutMethod(workerProfileId, parsed);
      res.status(201).json({ status: 'success', data });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  };
}
