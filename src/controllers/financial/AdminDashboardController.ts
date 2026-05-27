import { Request, Response } from 'express';
import { DashboardService } from '../../services/financial/DashboardService.js';
import IActivityLogRepository from '../../repositories/interfaces/financial/ActivityLogRepository.js';
import { serializeBigints } from '../../utils/serializeBigints.js';

export class AdminDashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly activityLogRepo: IActivityLogRepository
  ) {}

  public getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const [platformEarnings, escrowSummary, refundSummary, withdrawalSummary, debts] = await Promise.all([
        this.dashboardService.getPlatformEarnings(start, end),
        this.dashboardService.getEscrowSummary(),
        this.dashboardService.getRefundSummary(start, end),
        this.dashboardService.getWithdrawalSummary(),
        this.dashboardService.getOutstandingDebts(),
      ]);



      res.status(200).json({
        status: 'success',
        data: serializeBigints({
          platformEarnings,
          escrowSummary,
          refundSummary,
          withdrawalSummary,
          debts,
        }),
      });
    } catch (e: any) {
      res.status(500).json({ error: 'Internal server error fetching summary' });
    }
  };

  public getActivityLog = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityType, entityId, actorId, limit } = req.query;
      const parsedLimit = limit ? parseInt(limit as string, 10) : 50;
      
      let logs;
      if (entityType && entityId) {
        logs = await this.activityLogRepo.findByEntity(entityType as string, entityId as string, parsedLimit);
      } else if (actorId) {
        logs = await this.activityLogRepo.findByActor(actorId as string, parsedLimit);
      } else {
        logs = await this.activityLogRepo.findRecent(parsedLimit);
      }

      res.status(200).json({ status: 'success', data: logs });
    } catch (e: any) {
      res.status(500).json({ error: 'Internal server error fetching activity log' });
    }
  };

  public getUserAggregation = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      if (!userId) {
        res.status(400).json({ error: 'userId parameter is required' });
        return;
      }

      const data = await this.dashboardService.getUserAggregation(userId);



      res.status(200).json({ status: 'success', data: serializeBigints(data) });
    } catch (e: any) {
      if (e.message === 'User not found') {
        res.status(404).json({ error: e.message });
      } else {
        console.error(e);
        res.status(500).json({ error: 'Internal server error fetching user aggregation' });
      }
    }
  };
}
