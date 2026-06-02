import IFinancialDashboardRepository from '../../repositories/interfaces/financial/FinancialDashboardRepository.js';
import AppError from '../../errors/AppError.js';

export class DashboardService {
  constructor(private readonly dashboardRepo: IFinancialDashboardRepository) {}

  async getPlatformEarnings(startDate?: Date, endDate?: Date) {
    return this.dashboardRepo.aggregatePlatformEarnings(startDate, endDate);
  }

  async getEscrowSummary() {
    return this.dashboardRepo.groupEscrowByStatus();
  }

  async getRefundSummary(startDate?: Date, endDate?: Date) {
    return this.dashboardRepo.groupRefundsByType(startDate, endDate);
  }

  async getWithdrawalSummary() {
    return this.dashboardRepo.groupWithdrawRequestsByStatus();
  }

  async getOutstandingDebts() {
    return this.dashboardRepo.aggregateOutstandingDebts();
  }

  async assertAdminCanAccessUser(adminId: string, userId: string): Promise<void> {
    const allowed = await this.dashboardRepo.adminHasAssignedIssueForUser(adminId, userId);
    if (!allowed) {
      throw new AppError(
        'Cannot access private user data without an assigned issue for this user',
        403
      );
    }
  }

  async getUserAggregation(userId: string) {
    const userRecord = await this.dashboardRepo.findUserForAggregation(userId);
    if (!userRecord) throw new AppError('User not found', 404);

    const workerProfileId = userRecord.workerProfileId as string | undefined;

    const [transactionHistory, workHistory, ratings, disputes] = await Promise.all([
      workerProfileId
        ? this.dashboardRepo.findTransactionHistory(workerProfileId, 50)
        : Promise.resolve([]),
      workerProfileId
        ? this.dashboardRepo.findWorkHistory(workerProfileId, 50)
        : Promise.resolve([]),
      workerProfileId
        ? this.dashboardRepo.aggregateWorkerRatings(workerProfileId)
        : Promise.resolve({ average: null, count: 0 }),
      this.dashboardRepo.findUserDisputes(userId, workerProfileId, 20),
    ]);

    const { workerProfileId: _wpId, ...userFields } = userRecord;

    return {
      user: {
        id: userFields.id,
        phoneNumber: userFields.phoneNumber,
        firstName: userFields.firstName,
        lastName: userFields.lastName,
        middleName: userFields.middleName,
        status: userFields.status,
        role: userFields.role,
        createdAt: userFields.createdAt,
        profileImageUrl: userFields.profileImageUrl,
      },
      workerProfile: userFields.workerProfile,
      clientProfile: userFields.clientProfile,
      transactionHistory,
      workHistory,
      ratings,
      disputes,
    };
  }
}
