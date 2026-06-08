import { AdminRole } from './admin.entity.js';

export type CaseType = 'ACCOUNT_ISSUE' | 'FINANCIAL_ISSUE' | 'DISPUTE_CASE';

export type CaseDepartment = 'USER_MANAGEMENT' | 'FINANCIAL_MONITOR' | 'ISSUES_MANAGEMENT';

export type SourceEntityType =
  | 'REPORT'
  | 'VERIFICATION'
  | 'DISPUTE'
  | 'WITHDRAW_REQUEST'
  | 'REFUND'
  | 'ESCROW_HOLD'
  | 'PAYMENT_ATTEMPT';

export type IssueTargetType = SourceEntityType;

export type NormalizedCaseStatus =
  | 'PENDING'
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CANCELLED';

export type AdminCaseSummary = {
  caseId: string;
  caseType: CaseType;
  department: CaseDepartment;
  assignedAdminId: string | null;
  title: string;
  summary: string;
  status: NormalizedCaseStatus;
  createdAt: Date;
  updatedAt: Date;
  priority?: string | null;
  sourceEntityType: SourceEntityType;
  sourceEntityId: string;
};

export type AdminCaseStats = {
  total: number;
  open: number;
  assigned: number;
  unassigned: number;
  resolved: number;
};

export type AdminCaseListFilter = {
  status?: NormalizedCaseStatus;
  caseType?: CaseType;
  assigned?: boolean;
  assignedAdminId?: string;
  createdFrom?: Date;
  createdTo?: Date;
  search?: string;
  page?: number;
  limit?: number;
};

export const FINANCIAL_REPORT_PROBLEM_TYPES = ['PAYMENT_DISPUTE', 'PAYMENT_FRAUD'] as const;

export function caseTypeToDepartment(caseType: CaseType): CaseDepartment {
  switch (caseType) {
    case 'ACCOUNT_ISSUE':
      return 'USER_MANAGEMENT';
    case 'FINANCIAL_ISSUE':
      return 'FINANCIAL_MONITOR';
    case 'DISPUTE_CASE':
      return 'ISSUES_MANAGEMENT';
  }
}

export function allowedCaseTypesForRole(role: AdminRole): CaseType[] | null {
  switch (role) {
    case 'SUPER_ADMIN':
      return null;
    case 'USER_MANAGEMENT':
      return ['ACCOUNT_ISSUE'];
    case 'FINANCIAL_MONITOR':
      return ['FINANCIAL_ISSUE'];
    case 'ISSUES_MANAGEMENT':
      return ['DISPUTE_CASE'];
    default:
      return [];
  }
}

export function isFinancialReport(problemCategory: string, problemType: string): boolean {
  return (
    problemCategory === 'ORDER_ISSUE' &&
    FINANCIAL_REPORT_PROBLEM_TYPES.includes(problemType as (typeof FINANCIAL_REPORT_PROBLEM_TYPES)[number])
  );
}
