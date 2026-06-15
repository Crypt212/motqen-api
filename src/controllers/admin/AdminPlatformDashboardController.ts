import { asyncHandler } from '../../types/asyncHandler.js';
import { AdminPlatformDashboardService } from '../../services/admin/AdminPlatformDashboardService.js';
import SuccessResponse from '../../responses/successResponse.js';

export class AdminPlatformDashboardController {
  constructor(private readonly service: AdminPlatformDashboardService) {}

  public getStats = asyncHandler(async (_req, res) => {
    const stats = await this.service.getStats();
    new SuccessResponse('Dashboard stats retrieved successfully', stats).send(res);
  });

  public getRecentEvents = asyncHandler(async (_req, res) => {
    const events = await this.service.getRecentEvents();
    new SuccessResponse('Recent events retrieved successfully', events).send(res);
  });
}
