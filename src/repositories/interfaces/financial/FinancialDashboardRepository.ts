export interface EscrowStatusSummary {
  [status: string]: { count: number; amount: bigint };
}

export interface RefundTypeSummary {
  [refundType: string]: { count: number; amount: bigint };
}

export interface WithdrawStatusSummary {
  [status: string]: { count: number; amount: bigint };
}

export interface OutstandingDebtsSummary {
  count: number;
  amount: bigint;
}

export default interface IFinancialDashboardRepository {
  aggregatePlatformEarnings(startDate?: Date, endDate?: Date): Promise<bigint>;
  groupEscrowByStatus(): Promise<EscrowStatusSummary>;
  groupRefundsByType(startDate?: Date, endDate?: Date): Promise<RefundTypeSummary>;
  groupWithdrawRequestsByStatus(): Promise<WithdrawStatusSummary>;
  aggregateOutstandingDebts(): Promise<OutstandingDebtsSummary>;
  findUserForAggregation(userId: string): Promise<Record<string, unknown> | null>;
  findTransactionHistory(workerProfileId: string, limit: number): Promise<unknown[]>;
  findWorkHistory(workerProfileId: string, limit: number): Promise<unknown[]>;
  aggregateWorkerRatings(workerProfileId: string): Promise<{ average: number | null; count: number }>;
  findUserDisputes(userId: string, workerProfileId?: string, limit?: number): Promise<unknown[]>;
  adminHasAssignedIssueForUser(adminId: string, userId: string): Promise<boolean>;
}
