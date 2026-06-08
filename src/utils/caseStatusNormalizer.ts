import { NormalizedCaseStatus } from '../domain/adminCase.entity.js';
import { SourceEntityType } from '../domain/adminCase.entity.js';

export function normalizeCaseStatus(
  sourceEntityType: SourceEntityType,
  rawStatus: string
): NormalizedCaseStatus {
  switch (sourceEntityType) {
    case 'REPORT':
      return rawStatus as NormalizedCaseStatus;
    case 'VERIFICATION':
      if (rawStatus === 'APPROVED') return 'RESOLVED';
      if (rawStatus === 'REJECTED') return 'REJECTED';
      return 'PENDING';
    case 'DISPUTE':
      if (rawStatus === 'OPEN') return 'OPEN';
      if (rawStatus === 'AWAITING_INFO') return 'UNDER_REVIEW';
      if (rawStatus === 'RESOLVED') return 'RESOLVED';
      if (rawStatus === 'DISMISSED') return 'REJECTED';
      return 'OPEN';
    case 'WITHDRAW_REQUEST':
      if (rawStatus === 'PENDING') return 'PENDING';
      if (rawStatus === 'IN_PROGRESS') return 'UNDER_REVIEW';
      if (rawStatus === 'COMPLETED') return 'RESOLVED';
      if (rawStatus === 'FAILED') return 'REJECTED';
      if (rawStatus === 'CANCELLED') return 'CANCELLED';
      return 'PENDING';
    case 'ESCROW_HOLD':
      if (rawStatus === 'HELD') return 'OPEN';
      return 'RESOLVED';
    case 'REFUND':
      return 'RESOLVED';
    case 'PAYMENT_ATTEMPT':
      if (rawStatus === 'FAILED') return 'REJECTED';
      return 'RESOLVED';
    default:
      return 'PENDING';
  }
}

export function isOpenStatus(status: NormalizedCaseStatus): boolean {
  return ['PENDING', 'OPEN', 'UNDER_REVIEW'].includes(status);
}

export function isResolvedStatus(status: NormalizedCaseStatus): boolean {
  return ['RESOLVED', 'REJECTED', 'CANCELLED'].includes(status);
}
