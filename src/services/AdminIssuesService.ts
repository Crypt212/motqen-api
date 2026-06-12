import AppError from '../errors/AppError.js';
import { adminAuditLogService, adminRepository } from '../state.js';
import { AdminRole } from '../domain/admin.entity.js';
import { AdminAuditCategory } from '../domain/adminAuditLog.entity.js';
import { IssueTargetType } from '../domain/adminCase.entity.js';
import prisma from '../libs/database.js';

export type { IssueTargetType };

export type ClaimIssueParams = {
  targetType: IssueTargetType;
  targetId: string;
  adminId: string;
  adminRole: AdminRole;
  adminUsername: string;
  note?: string;
};

export type IssueNoteTargetType = 'REPORT' | 'DISPUTE' | 'VERIFICATION' | 'ORDER';

export type AddNoteParams = {
  targetType: IssueTargetType;
  targetId: string;
  adminId: string;
  content: string;
};

export type IssueData = {
  assignedAdminId: string | null;
  assignedDepartment: AdminRole | null;
};

export type TransferToAdminParams = {
  targetType: IssueTargetType;
  targetId: string;
  adminId: string;
  adminRole: AdminRole;
  adminUsername: string;
  newAdminId: string;
  note?: string;
};

export type TransferToDepartmentParams = {
  targetType: IssueTargetType;
  targetId: string;
  adminId: string;
  adminRole: AdminRole;
  adminUsername: string;
  newDepartment: AdminRole;
  note?: string;
};

export type UnassignIssueParams = {
  targetType: IssueTargetType;
  targetId: string;
  adminId: string;
  adminRole: AdminRole;
  adminUsername: string;
  note?: string;
};

const FINANCIAL_TARGET_TYPES: IssueTargetType[] = [
  'WITHDRAW_REQUEST',
  'REFUND',
  'ESCROW_HOLD',
];

function auditCategoryForTarget(targetType: IssueTargetType): AdminAuditCategory {
  if (FINANCIAL_TARGET_TYPES.includes(targetType)) return 'FINANCIAL';
  if (targetType === 'DISPUTE') return 'ISSUES';
  if (targetType === 'REPORT') return 'REPORT_MODERATION';
  return 'USER_MANAGEMENT';
}

export default class AdminIssuesService {
  constructor() {}

  async getUnifiedQueue(filter: {
    department?: AdminRole;
    status?: string;
    isAssigned?: boolean;
    adminId?: string;
  }): Promise<
    Array<{
      id: string;
      status: string;
      assignedDepartment: AdminRole | null;
      assignedAdminId: string | null;
      createdAt: Date;
      type: IssueTargetType;
    }>
  > {
    const ownershipWhere = this.buildWhereClause(filter);

    const reports = await prisma.report
      .findMany({
        where: ownershipWhere,
        select: {
          id: true,
          status: true,
          assignedDepartment: true,
          assignedAdminId: true,
          createdAt: true,
        },
        take: 20,
      })
      .then((items) => items.map((i) => ({ ...i, type: 'REPORT' as const })));

    const disputes = await prisma.dispute
      .findMany({
        where: ownershipWhere,
        select: {
          id: true,
          status: true,
          assignedDepartment: true,
          assignedAdminId: true,
          createdAt: true,
        },
        take: 20,
      })
      .then((items) => items.map((i) => ({ ...i, type: 'DISPUTE' as const })));

    const verifications = await prisma.workerVerification
      .findMany({
        where: ownershipWhere,
        select: {
          id: true,
          status: true,
          assignedDepartment: true,
          assignedAdminId: true,
          createdAt: true,
        },
        take: 20,
      })
      .then((items) => items.map((i) => ({ ...i, type: 'VERIFICATION' as const })));

    const withdrawRequests = await prisma.withdrawRequest
      .findMany({
        where: ownershipWhere,
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
        take: 20,
      })
      .then((items) => items.map((i) => ({ ...i, type: 'WITHDRAW_REQUEST' as const, assignedDepartment: null, assignedAdminId: null })));

    const refunds = await prisma.refund
      .findMany({
        where: ownershipWhere,
        select: {
          id: true,
          createdAt: true,
        },
        take: 20,
      })
      .then((items) =>
        items.map((i) => ({
          ...i,
          status: 'RESOLVED',
          type: 'REFUND' as const,
          assignedDepartment: null,
          assignedAdminId: null,
        }))
      );

    const escrowHolds = await prisma.escrowHold
      .findMany({
        where: ownershipWhere,
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
        take: 20,
      })
      .then((items) => items.map((i) => ({ ...i, type: 'ESCROW_HOLD' as const, assignedDepartment: null, assignedAdminId: null })));

    const all = [
      ...reports,
      ...disputes,
      ...verifications,
      ...withdrawRequests,
      ...refunds,
      ...escrowHolds,
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return all.slice(0, 50);
  }

  private buildWhereClause(filter: {
    department?: AdminRole;
    status?: string;
    isAssigned?: boolean;
    adminId?: string;
  }): Record<string, unknown> {
    const where: Record<string, unknown> = {};
    if (filter.department) where.assignedDepartment = filter.department;
    if (filter.status) where.status = filter.status;
    if (filter.adminId) where.assignedAdminId = filter.adminId;
    if (filter.isAssigned !== undefined) {
      if (filter.isAssigned) where.assignedAdminId = { not: null };
      else where.assignedAdminId = null;
    }
    return where;
  }

  async claimIssue(params: ClaimIssueParams): Promise<{ success: boolean }> {
    const issue = await this.getIssue(params.targetType, params.targetId);
    if (!issue) throw new AppError('Issue not found', 404);

    if (
      params.adminRole !== 'SUPER_ADMIN' &&
      issue.assignedDepartment &&
      issue.assignedDepartment !== params.adminRole
    ) {
      throw new AppError('Cannot claim issue from a different department', 403);
    }

    if (issue.assignedAdminId) {
      throw new AppError('Issue is already claimed', 409);
    }

    const assignedDept =
      params.adminRole !== 'SUPER_ADMIN'
        ? params.adminRole
        : issue.assignedDepartment || 'SUPER_ADMIN';

    await this.updateIssue(params.targetType, params.targetId, {
      assignedAdminId: params.adminId,
      assignedDepartment: assignedDept,
    });

    await prisma.issueAssignmentHistory.create({
      data: {
        targetType: params.targetType,
        targetId: params.targetId,
        newAdminId: params.adminId,
        newDepartment: assignedDept,
        event: 'CLAIMED',
        actorAdminId: params.adminId,
        note: params.note,
      },
    });

    await adminAuditLogService.record({
      actor: {
        adminId: params.adminId,
        username: params.adminUsername,
        role: params.adminRole,
      },
      action: 'ISSUE_CLAIMED',
      category: auditCategoryForTarget(params.targetType),
      severity: 'INFO',
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: { note: params.note },
    });

    return { success: true };
  }

  async transferToAdmin(params: TransferToAdminParams): Promise<{ success: boolean }> {
    const issue = await this.getIssue(params.targetType, params.targetId);
    if (!issue) throw new AppError('Issue not found', 404);

    if (params.adminRole !== 'SUPER_ADMIN' && issue.assignedAdminId !== params.adminId) {
      throw new AppError('Cannot transfer an issue you do not own', 403);
    }

    const targetAdmin = await adminRepository.find({ filter: { id: params.newAdminId } });
    if (!targetAdmin) throw new AppError('Target admin not found', 404);

    if (
      targetAdmin.role !== 'SUPER_ADMIN' &&
      issue.assignedDepartment &&
      targetAdmin.role !== issue.assignedDepartment
    ) {
      throw new AppError('Target admin must belong to the same department', 400);
    }

    await this.updateIssue(params.targetType, params.targetId, {
      assignedAdminId: params.newAdminId,
      assignedDepartment: targetAdmin.role,
    });

    await prisma.issueAssignmentHistory.create({
      data: {
        targetType: params.targetType,
        targetId: params.targetId,
        previousAdminId: issue.assignedAdminId,
        previousDepartment: issue.assignedDepartment,
        newAdminId: params.newAdminId,
        newDepartment: targetAdmin.role,
        event: 'TRANSFERRED_ADMIN',
        note: params.note,
        actorAdminId: params.adminId,
      },
    });

    await adminAuditLogService.record({
      actor: {
        adminId: params.adminId,
        username: params.adminUsername,
        role: params.adminRole,
      },
      action: 'ISSUE_TRANSFERRED_ADMIN',
      category: auditCategoryForTarget(params.targetType),
      severity: 'INFO',
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: {
        previousAdminId: issue.assignedAdminId,
        newAdminId: params.newAdminId,
        note: params.note,
      },
    });

    return { success: true };
  }

  async transferToDepartment(params: TransferToDepartmentParams): Promise<{ success: boolean }> {
    const issue = await this.getIssue(params.targetType, params.targetId);
    if (!issue) throw new AppError('Issue not found', 404);

    if (params.adminRole !== 'SUPER_ADMIN' && issue.assignedAdminId !== params.adminId) {
      throw new AppError('Cannot transfer an issue you do not own', 403);
    }

    await this.updateIssue(params.targetType, params.targetId, {
      assignedAdminId: null,
      assignedDepartment: params.newDepartment,
    });

    await prisma.issueAssignmentHistory.create({
      data: {
        targetType: params.targetType,
        targetId: params.targetId,
        previousAdminId: issue.assignedAdminId,
        previousDepartment: issue.assignedDepartment,
        newAdminId: null,
        newDepartment: params.newDepartment,
        event: 'TRANSFERRED_DEPARTMENT',
        note: params.note,
        actorAdminId: params.adminId,
      },
    });

    await adminAuditLogService.record({
      actor: {
        adminId: params.adminId,
        username: params.adminUsername,
        role: params.adminRole,
      },
      action: 'ISSUE_TRANSFERRED_DEPARTMENT',
      category: auditCategoryForTarget(params.targetType),
      severity: 'INFO',
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: {
        previousDepartment: issue.assignedDepartment,
        newDepartment: params.newDepartment,
        note: params.note,
      },
    });

    return { success: true };
  }

  async unassignIssue(params: UnassignIssueParams): Promise<{ success: boolean }> {
    const issue = await this.getIssue(params.targetType, params.targetId);
    if (!issue) throw new AppError('Issue not found', 404);

    if (params.adminRole !== 'SUPER_ADMIN' && issue.assignedAdminId !== params.adminId) {
      throw new AppError('Cannot unassign an issue you do not own', 403);
    }

    await this.updateIssue(params.targetType, params.targetId, {
      assignedAdminId: null,
    });

    await prisma.issueAssignmentHistory.create({
      data: {
        targetType: params.targetType,
        targetId: params.targetId,
        previousAdminId: issue.assignedAdminId,
        previousDepartment: issue.assignedDepartment,
        newAdminId: null,
        newDepartment: issue.assignedDepartment,
        event: 'UNASSIGNED',
        note: params.note,
        actorAdminId: params.adminId,
      },
    });

    await adminAuditLogService.record({
      actor: {
        adminId: params.adminId,
        username: params.adminUsername,
        role: params.adminRole,
      },
      action: 'ISSUE_UNASSIGNED',
      category: auditCategoryForTarget(params.targetType),
      severity: 'INFO',
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: { note: params.note },
    });

    return { success: true };
  }

  async addNote(params: AddNoteParams) {
    return prisma.issueNote.create({
      data: {
        targetType: params.targetType,
        targetId: params.targetId,
        authorAdminId: params.adminId,
        content: params.content,
      },
    });
  }

  async getNotes(targetType: string, targetId: string) {
    return prisma.issueNote.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getHistory(targetType: string, targetId: string) {
    return prisma.issueAssignmentHistory.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getIssue(targetType: string, targetId: string): Promise<IssueData | null> {
    const select = { assignedAdminId: true, assignedDepartment: true };

    switch (targetType) {
      case 'REPORT':
        return prisma.report.findUnique({ where: { id: targetId }, select });
      case 'DISPUTE':
        return prisma.dispute.findUnique({ where: { id: targetId }, select });
      case 'VERIFICATION':
        return prisma.workerVerification.findUnique({ where: { id: targetId }, select });
      case 'WITHDRAW_REQUEST':
        return prisma.withdrawRequest.findUnique({ where: { id: targetId }, select });
      case 'REFUND':
        return prisma.refund.findUnique({ where: { id: targetId }, select });
      case 'ESCROW_HOLD':
        return prisma.escrowHold.findUnique({ where: { id: targetId }, select });
      default:
        return null;
    }
  }

  private async updateIssue(
    targetType: string,
    targetId: string,
    data: Partial<IssueData>
  ): Promise<unknown> {
    switch (targetType) {
      case 'REPORT':
        return prisma.report.update({ where: { id: targetId }, data });
      case 'DISPUTE':
        return prisma.dispute.update({ where: { id: targetId }, data });
      case 'VERIFICATION':
        return prisma.workerVerification.update({ where: { id: targetId }, data });
      case 'WITHDRAW_REQUEST':
        return prisma.withdrawRequest.update({ where: { id: targetId }, data });
      case 'REFUND':
        return prisma.refund.update({ where: { id: targetId }, data });
      case 'ESCROW_HOLD':
        return prisma.escrowHold.update({ where: { id: targetId }, data });
      default:
        throw new AppError('Unsupported issue target type', 400);
    }
  }
}
