import { Response } from 'express';
import { Request } from '../../types/asyncHandler.js';
import { DisputeService } from '../../services/financial/DisputeService.js';
import { serializeBigints } from '../../utils/serializeBigints.js';
import AppError from '../../errors/AppError.js';

export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  private async enforceOwnership(req: Request, disputeId: string) {
    if (!req.adminState) throw new AppError('Unauthorized', 401);
    if (req.adminState.role === 'SUPER_ADMIN') return;
    
    const dispute = await this.disputeService.getDispute(disputeId);
    if (!dispute) throw new AppError('Dispute not found', 404);
    
    if ((dispute as any).assignedAdminId !== req.adminState!.adminId) {
      throw new AppError('You do not own this dispute. Please claim it first.', 403);
    }
  }

  public openDispute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId, evidence, flaggedMessageIds, eventTimeline } = req.body;
      const adminId = req.adminState!.adminId;

      if (!orderId) {
        res.status(400).json({ error: 'orderId is required' });
        return;
      }

      const dispute = await this.disputeService.openDispute({
        orderId,
        openedBy: adminId,
        evidence,
        flaggedMessageIds,
        eventTimeline,
      });

      res.status(201).json({ status: 'success', data: dispute });
    } catch (e: any) {
      if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else if (e.message.includes('already exists')) res.status(409).json({ error: e.message });
      else res.status(400).json({ error: e.message });
    }
  };

  public getDispute = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.enforceOwnership(req, id);
      const data = await this.disputeService.getDispute(id);

      res.status(200).json({ status: 'success', data: serializeBigints(data) });
    } catch (e: any) {
      if (e.statusCode === 403) res.status(403).json({ error: e.message });
      else if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else res.status(500).json({ error: e.message });
    }
  };

  public listDisputes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, orderId, limit, offset } = req.query;
      const data = await this.disputeService.listDisputes(
        { status: status as any, orderId: orderId as string },
        limit ? parseInt(limit as string, 10) : 20,
        offset ? parseInt(offset as string, 10) : 0,
      );

      res.status(200).json({ status: 'success', data });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  public requestMoreInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { message } = req.body;
      const adminId = req.adminState!.adminId;

      await this.enforceOwnership(req, id);

      if (!message) {
        res.status(400).json({ error: 'message is required' });
        return;
      }

      const result = await this.disputeService.requestMoreInfo(id, adminId, message);
      res.status(200).json({ status: 'success', data: result });
    } catch (e: any) {
      if (e.statusCode === 403) res.status(403).json({ error: e.message });
      else if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else res.status(409).json({ error: e.message });
    }
  };

  public resolveDispute = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { resolution, reason } = req.body;
      const adminId = req.adminState!.adminId;

      await this.enforceOwnership(req, id);

      if (!resolution || !reason) {
        res.status(400).json({ error: 'resolution and reason are required' });
        return;
      }

      const data = await this.disputeService.resolveDispute(id, adminId, resolution, reason);
      res.status(200).json({ status: 'success', data });
    } catch (e: any) {
      if (e.statusCode === 403) res.status(403).json({ error: e.message });
      else if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else if (e.message.includes('already')) res.status(409).json({ error: e.message });
      else res.status(400).json({ error: e.message });
    }
  };

  public addMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { content } = req.body;
      const senderId = req.adminState!.adminId;

      await this.enforceOwnership(req, id);

      if (!content) {
        res.status(400).json({ error: 'content is required' });
        return;
      }

      const msg = await this.disputeService.addMessage(id, senderId, content);
      res.status(201).json({ status: 'success', data: msg });
    } catch (e: any) {
      if (e.statusCode === 403) res.status(403).json({ error: e.message });
      else if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else res.status(400).json({ error: e.message });
    }
  };

  public getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.enforceOwnership(req, id);
      
      const messages = await this.disputeService.getMessages(id);
      res.status(200).json({ status: 'success', data: messages });
    } catch (e: any) {
      if (e.statusCode === 403) res.status(403).json({ error: e.message });
      else res.status(500).json({ error: e.message });
    }
  };
}
