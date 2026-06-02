import AppError from '../errors/AppError.js';
import { adminAuditLogService, adminRepository } from '../state.js';
import { AdminRole } from '../domain/admin.entity.js';
import prisma from '../libs/database.js';

export type ClaimIssueParams = {
  targetType: 'REPORT' | 'DISPUTE' | 'VERIFICATION';
  targetId: string;
  adminId: string;
  adminRole: AdminRole;
  adminUsername: string;
  note?: string;
};

export type AddNoteParams = {
  targetType: 'REPORT' | 'DISPUTE' | 'VERIFICATION';
  targetId: string;
  adminId: string;
  content: string;
};

export type IssueData = {
  assignedAdminId: string | null;
  assignedDepartment: AdminRole | null;
};

export type TransferToAdminParams = {
  targetType: 'REPORT' | 'DISPUTE' | 'VERIFICATION';
  targetId: string;
  adminId: string;
  adminRole: AdminRole;
  adminUsername: string;
  newAdminId: string;
  note?: string;
};

export type TransferToDepartmentParams = {
  targetType: 'REPORT' | 'DISPUTE' | 'VERIFICATION';
  targetId: string;
  adminId: string;
  adminRole: AdminRole;
  adminUsername: string;
  newDepartment: AdminRole;
  note?: string;
};

export type UnassignIssueParams = {
  targetType: 'REPORT' | 'DISPUTE' | 'VERIFICATION';
  targetId: string;
  adminId: string;
  adminRole: AdminRole;
  adminUsername: string;
  note?: string;
};

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
      type: 'REPORT' | 'DISPUTE' | 'VERIFICATION';
    }>
  > {
    // We aggregate counts and limited rows from each table
    const reports = await prisma.report
      .findMany({
        where: this.buildWhereClause(filter),
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
        where: this.buildWhereClause(filter),
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
        where: this.buildWhereClause(filter),
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

    const all = [...reports, ...disputes, ...verifications].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return all.slice(0, 50); // limit unified response
  }

  private buildWhereClause(filter: any): Record<string, any> {
    const where: any = {};
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

    const assignedDept = params.adminRole !== 'SUPER_ADMIN'
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
      category: 'ISSUES',
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

    // Enforce same-department constraint on admin-to-admin transfers
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
      category: 'ISSUES',
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
      category: 'ISSUES',
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
      category: 'ISSUES',
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
    if (targetType === 'REPORT') {
      return prisma.report.findUnique({
        where: { id: targetId },
        select: { assignedAdminId: true, assignedDepartment: true },
      });
    } else if (targetType === 'DISPUTE') {
      return prisma.dispute.findUnique({
        where: { id: targetId },
        select: { assignedAdminId: true, assignedDepartment: true },
      });
    } else if (targetType === 'VERIFICATION') {
      return prisma.workerVerification.findUnique({
        where: { id: targetId },
        select: { assignedAdminId: true, assignedDepartment: true },
      });
    }
    return null;
  }

  private async updateIssue(
    targetType: string,
    targetId: string,
    data: Partial<IssueData>
  ): Promise<any> {
    if (targetType === 'REPORT') {
      return prisma.report.update({ where: { id: targetId }, data });
    } else if (targetType === 'DISPUTE') {
      return prisma.dispute.update({ where: { id: targetId }, data });
    } else if (targetType === 'VERIFICATION') {
      return prisma.workerVerification.update({ where: { id: targetId }, data });
    }
  }
}
