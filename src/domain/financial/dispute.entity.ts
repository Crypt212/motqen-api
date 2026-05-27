import { IDType } from '../../repositories/interfaces/Repository.js';

export type DisputeStatus = 'OPEN' | 'AWAITING_INFO' | 'RESOLVED' | 'DISMISSED';
export type DisputeResolution = 'REFUND_CLIENT' | 'FAVOR_WORKER' | 'PARTIAL_REFUND' | 'NO_ACTION';

export type Dispute = {
  id: IDType;
  orderId: string;
  openedBy: string;
  status: DisputeStatus;
  resolution: DisputeResolution | null;
  resolutionNote: string | null;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  evidence: unknown[];
  flaggedMessageIds: string[];
  eventTimeline: unknown[];
  linkedTransactionLogIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type DisputeCreateInput = {
  orderId: string;
  openedBy: string;
  evidence?: unknown[];
  flaggedMessageIds?: string[];
  eventTimeline?: unknown[];
};

export type DisputeMessage = {
  id: IDType;
  disputeId: string;
  senderId: string;
  content: string;
  createdAt: Date;
};
