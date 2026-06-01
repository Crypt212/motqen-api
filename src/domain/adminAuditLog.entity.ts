import { IDType } from '../repositories/interfaces/Repository.js';
import { AdminRole } from './admin.entity.js';

export type AdminAuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type AdminAuditCategory =
  | 'AUTH'
  | 'ADMIN_MANAGEMENT'
  | 'USER_MANAGEMENT'
  | 'FINANCIAL'
  | 'ISSUES'
  | 'SUPPORT_CHAT'
  | 'REPORT_MODERATION';

export type AdminAuditAction =
  | 'ADMIN_LOGIN_SUCCESS'
  | 'ADMIN_LOGIN_FAILED'
  | 'ADMIN_LOGOUT'
  | 'ADMIN_FORCE_LOGOUT'
  | 'ADMIN_PASSWORD_RESET'
  | 'ADMIN_CREATED'
  | 'ADMIN_UPDATED'
  | 'ADMIN_ROLE_CHANGED'
  | 'ADMIN_ENABLED'
  | 'ADMIN_DISABLED'
  | 'USER_SUSPENDED'
  | 'USER_ACTIVATED'
  | 'WORKER_APPROVED'
  | 'WORKER_REJECTED'
  | 'WORKER_SCHEDULE_MODIFIED'
  | 'PAYOUT_STARTED'
  | 'PAYOUT_COMPLETED'
  | 'PAYOUT_FAILED'
  | 'WITHDRAWAL_REJECTED'
  | 'ESCROW_RELEASED'
  | 'REFUND_INITIATED'
  | 'DEBT_SETTLED'
  | 'REPORT_STATUS_UPDATED'
  | 'DISPUTE_RESOLVED'
  | 'DISPUTE_INFORMATION_REQUESTED'
  | 'EVIDENCE_REVIEWED'
  | 'CHAT_ASSIGNED'
  | 'CHAT_UNASSIGNED'
  | 'CHAT_TRANSFERRED'
  | 'CHAT_CLOSED'
  | 'CHAT_PERMISSION_CHANGED';

export type AdminAuditLog = {
  id: IDType;
  actorAdminId: string | null;
  actorUsername: string | null;
  actorRole: AdminRole | null;
  action: AdminAuditAction | string;
  category: AdminAuditCategory;
  severity: AdminAuditSeverity;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};

export type AdminAuditActor = {
  adminId: string;
  username: string;
  role: AdminRole;
};

export type AdminAuditLogCreateInput = {
  actor?: AdminAuditActor | null;
  action: AdminAuditAction | string;
  category: AdminAuditCategory;
  severity: AdminAuditSeverity;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type AdminAuditLogSearchFilter = {
  action?: string;
  severity?: AdminAuditSeverity;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  startDate?: Date;
  endDate?: Date;
  categories?: AdminAuditCategory[];
};
