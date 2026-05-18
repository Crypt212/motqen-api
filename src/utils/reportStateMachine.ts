import { $Enums } from '../generated/prisma/client.js';

type ReportStatus = $Enums.ReportStatus;

export const REPORT_TRANSITIONS: Partial<Record<ReportStatus, readonly ReportStatus[]>> = {
  [$Enums.ReportStatus.PENDING]: [$Enums.ReportStatus.UNDER_REVIEW, $Enums.ReportStatus.CANCELLED],
  [$Enums.ReportStatus.UNDER_REVIEW]: [$Enums.ReportStatus.RESOLVED, $Enums.ReportStatus.REJECTED],
};

export function canReportTransitionTo(current: ReportStatus, next: ReportStatus): boolean {
  return REPORT_TRANSITIONS[current]?.includes(next) ?? false;
}

export function isAdminTransition(status: ReportStatus): boolean {
  if (status === $Enums.ReportStatus.UNDER_REVIEW)
    return true;

  if (status === $Enums.ReportStatus.RESOLVED)
    return true;

  if (status === $Enums.ReportStatus.REJECTED)
    return true;

  return false;
}

export function isReporterCancellable(status: ReportStatus): boolean {
  return status === $Enums.ReportStatus.PENDING;
}
