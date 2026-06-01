import { AdminState, asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import AppError from '../errors/AppError.js';
import { reportRepository } from '../state.js';
import { adminAuditLogService } from '../state.js';
import { ReportStatusUpdateInput } from '../domain/report.entity.js';
import { AdminRole } from 'src/domain/admin.entity.js';
import { Report } from 'src/domain/report.entity.js';

export default class AdminReportsController {
  private async enforceOwnership(adminState: AdminState, reportId: string): Promise<Report | null> {
    if (adminState.role === 'SUPER_ADMIN') return null;
    const report = await reportRepository.findById({ id: reportId });
    if (!report) throw new AppError('Report not found', 404);
    if (report.assignedAdminId !== adminState.adminId) {
      throw new AppError('Cannot access a report issue you do not own', 403);
    }
    return report;
  }

  getReport = asyncHandler(async (req, res): Promise<void> => {
    const { id } = req.params as { id: string };
    let report = await this.enforceOwnership(req.adminState, id);
    if (!report) {
      report = await reportRepository.findById({ id });
      if (!report) throw new AppError('Report not found', 404);
    }
    new SuccessResponse('Report retrieved', { report }, 200).send(res);
  });

  updateStatus = asyncHandler(async (req, res): Promise<void> => {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    await this.enforceOwnership(req.adminState, id);

    const updated = await reportRepository.updateStatusById({
      id,
      status: { status },
    } as { id: string; status: ReportStatusUpdateInput });

    const adminRole = req.adminState.role as AdminRole;
    await adminAuditLogService.record({
      actor: {
        adminId: req.adminState.adminId,
        username: req.adminState.username,
        role: adminRole,
      },
      action: 'REPORT_STATUS_CHANGED',
      category: 'REPORT_MODERATION',
      severity: 'INFO',
      targetType: 'REPORT',
      targetId: id,
      metadata: { newStatus: status },
    });

    new SuccessResponse('Report status updated', { updated }, 200).send(res);
  });
}
