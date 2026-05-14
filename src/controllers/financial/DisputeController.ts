import { Request, Response } from 'express';
import { DisputeService } from '../../services/financial/DisputeService.js';
import { IDType } from '../../repositories/interfaces/Repository.js';
import { serializeBigints } from '../../utils/serializeBigints.js';

export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  public openDispute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId, evidence, flaggedMessageIds, eventTimeline } = req.body;
      const adminId = (req as any).user?.id as IDType || 'admin';

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
      const data = await this.disputeService.getDispute(id);



      res.status(200).json({ status: 'success', data: serializeBigints(data) });
    } catch (e: any) {
      if (e.message.includes('not found')) res.status(404).json({ error: e.message });
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
      const adminId = (req as any).user?.id as IDType || 'admin';

      if (!message) {
        res.status(400).json({ error: 'message is required' });
        return;
      }

      const result = await this.disputeService.requestMoreInfo(id, adminId, message);
      res.status(200).json({ status: 'success', data: result });
    } catch (e: any) {
      if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else res.status(409).json({ error: e.message });
    }
  };

  public resolveDispute = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { resolution, reason } = req.body;
      const adminId = (req as any).user?.id as IDType || 'admin';

      if (!resolution || !reason) {
        res.status(400).json({ error: 'resolution and reason are required' });
        return;
      }

      const data = await this.disputeService.resolveDispute(id, adminId, resolution, reason);
      res.status(200).json({ status: 'success', data });
    } catch (e: any) {
      if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else if (e.message.includes('already')) res.status(409).json({ error: e.message });
      else res.status(400).json({ error: e.message });
    }
  };

  public addMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { content } = req.body;
      const senderId = (req as any).user?.id as IDType || 'admin';

      if (!content) {
        res.status(400).json({ error: 'content is required' });
        return;
      }

      const msg = await this.disputeService.addMessage(id, senderId, content);
      res.status(201).json({ status: 'success', data: msg });
    } catch (e: any) {
      if (e.message.includes('not found')) res.status(404).json({ error: e.message });
      else res.status(400).json({ error: e.message });
    }
  };

  public getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const messages = await this.disputeService.getMessages(id);
      res.status(200).json({ status: 'success', data: messages });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };
}
