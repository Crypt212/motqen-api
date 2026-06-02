import { asyncHandler } from '../../types/asyncHandler.js';
import { DashboardService } from '../../services/financial/DashboardService.js';
import IActivityLogRepository from '../../repositories/interfaces/financial/ActivityLogRepository.js';
import { serializeBigints } from '../../utils/serializeBigints.js';
import SuccessResponse from '../../responses/successResponse.js';
import AppError from '../../errors/AppError.js';

export class AdminDashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly activityLogRepo: IActivityLogRepository
  ) {}

  public getSummary = asyncHandler(async (req, res) => {
    const start = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const end = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const [platformEarnings, escrowSummary, refundSummary, withdrawalSummary, debts] =
      await Promise.all([
        this.dashboardService.getPlatformEarnings(start, end),
        this.dashboardService.getEscrowSummary(),
        this.dashboardService.getRefundSummary(start, end),
        this.dashboardService.getWithdrawalSummary(),
        this.dashboardService.getOutstandingDebts(),
      ]);

    new SuccessResponse(
      'Financial summary retrieved successfully',
      serializeBigints({
        platformEarnings,
        escrowSummary,
        refundSummary,
        withdrawalSummary,
        debts,
      })
    ).send(res);
  });

  public getActivityLog = asyncHandler(async (req, res) => {
    const parsedLimit = Number(req.query.limit);
    const { entityType, entityId, actorId } = req.query;

    let logs;
    if (entityType && entityId) {
      logs = await this.activityLogRepo.findByEntity(
        entityType as string,
        entityId as string,
        parsedLimit
      );
    } else if (actorId) {
      logs = await this.activityLogRepo.findByActor(actorId as string, parsedLimit);
    } else {
      logs = await this.activityLogRepo.findRecent(parsedLimit);
    }

    new SuccessResponse('Activity log retrieved successfully', logs).send(res);
  });

  public getUserAggregation = asyncHandler(async (req, res) => {
    const userId = req.params.userId as string;

    if (req.adminState?.role !== 'SUPER_ADMIN') {
      const adminId = req.adminState?.adminId;
      if (!adminId) throw new AppError('Unauthorized', 401);
      await this.dashboardService.assertAdminCanAccessUser(adminId, userId);
    }

    const data = await this.dashboardService.getUserAggregation(userId);

    new SuccessResponse('User aggregation retrieved successfully', serializeBigints(data)).send(
      res
    );
  });
}
