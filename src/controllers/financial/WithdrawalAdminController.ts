import { Request, Response } from 'express';
import { WithdrawalService } from '../../services/financial/WithdrawalService.js';
import { IDType } from 'src/repositories/interfaces/Repository.js';

export class WithdrawalAdminController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  public listRequests = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({ status: 'success', data: [] });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Start processing a withdrawal (PENDING → IN_PROGRESS).
   * Replaces the old approveRequest.
   */
  public startProcessing = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const adminId = (req as any).user?.id as IDType || 'admin';
      const execution = await this.withdrawalService.startProcessing(id, adminId);
      res.status(200).json({ status: 'success', data: execution });
    } catch (e: any) {
      if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else res.status(409).json({ error: e.message });
    }
  };

  public rejectRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { notes } = req.body;
      const adminId = (req as any).user?.id as IDType || 'admin';
      await this.withdrawalService.rejectRequest(id, adminId, notes);
      res.status(200).json({ status: 'success' });
    } catch (e: any) {
      if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else res.status(409).json({ error: e.message });
    }
  };

  /**
   * Complete payout (requires proof of payment URL + external ref ID).
   * Only allowed when request is IN_PROGRESS.
   */
  public completePayout = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { external_reference_id, proof_of_payment_url } = req.body;
      const adminId = (req as any).user?.id as IDType || 'admin';

      if (!proof_of_payment_url) {
        res.status(400).json({ error: 'proof_of_payment_url is required' });
        return;
      }

      await this.withdrawalService.completePayout(id, proof_of_payment_url, external_reference_id, adminId);
      res.status(200).json({ status: 'success' });
    } catch (e: any) {
      if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else if (e.message.includes('Proof of payment')) res.status(400).json({ error: e.message });
      else res.status(409).json({ error: e.message });
    }
  };

  public failPayout = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const adminId = (req as any).user?.id as IDType || 'admin';
      await this.withdrawalService.failPayout(id, reason, adminId);
      res.status(200).json({ status: 'success' });
    } catch (e: any) {
      if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else res.status(409).json({ error: e.message });
    }
  };

  public listDebts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit, offset } = req.query;
      const parsedLimit = limit ? parseInt(limit as string, 10) : 20;
      const parsedOffset = offset ? parseInt(offset as string, 10) : 0;

      const debts = await this.withdrawalService.listWorkerDebts(parsedLimit, parsedOffset);
      
      const serializeBigints = (obj: any): any => 
        JSON.parse(JSON.stringify(obj, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value
        ));

      res.status(200).json({ status: 'success', data: serializeBigints(debts) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error fetching debts' });
    }
  };

  public settleDebt = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const adminId = (req as any).user?.id as IDType || 'admin';

      const result = await this.withdrawalService.settleDebt(id, adminId);
      
      const serializeBigints = (obj: any): any => 
        JSON.parse(JSON.stringify(obj, (key, value) => 
          typeof value === 'bigint' ? value.toString() : value
        ));

      res.status(200).json({ status: 'success', data: serializeBigints(result) });
    } catch (e: any) {
      console.error(e);
      if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else res.status(400).json({ error: e.message });
    }
  };
}
