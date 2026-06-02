import { Request, asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import AppError from '../errors/AppError.js';
import { workerProfileRepository } from '../state.js';
import { adminAuditLogService } from '../state.js';
import { AdminAuditCategory, VerificationRejectionReason } from '../generated/prisma/client.js';
import { AdminRole } from '../domain/admin.entity.js';

export default class AdminVerificationsController {
  private async enforceOwnership(req: Request, verificationId: string): Promise<Record<string, unknown> | null> {
    if (!req.adminState) throw new AppError('Unauthorized', 401);
    if (req.adminState.role === 'SUPER_ADMIN') return null;
    const verification = await workerProfileRepository.findVerificationById(verificationId);
    if (!verification) throw new AppError('Verification not found', 404);
    if (verification.assignedAdminId !== req.adminState.adminId) {
      throw new AppError('Cannot access a verification issue you do not own', 403);
    }
    return verification;
  }

  getVerification = asyncHandler(async (req, res): Promise<void> => {
    const { id } = req.params as { id: string };
    let verification = await this.enforceOwnership(req, id);
    if (!verification) {
      verification = await workerProfileRepository.findVerificationById(id);
      if (!verification) throw new AppError('Verification not found', 404);
    }
    new SuccessResponse('Verification retrieved', { verification }, 200).send(res);
  });

  rejectVerification = asyncHandler(async (req, res): Promise<void> => {
    const { id } = req.params as { id: string };
    const { rejectionReasons, rejectionNote } = req.body;

    if (!rejectionReasons || !Array.isArray(rejectionReasons) || rejectionReasons.length === 0) {
      throw new AppError('rejectionReasons array is required', 400);
    }

    if (rejectionReasons.includes('OTHER') && !rejectionNote) {
      throw new AppError('rejectionNote is required when OTHER is selected', 400);
    }

    await this.enforceOwnership(req, id);

    const updated = await workerProfileRepository.updateVerificationStatus(id, {
      status: 'REJECTED',
      rejectionReasons: rejectionReasons as VerificationRejectionReason[],
      rejectionNote,
    });

    const adminRole = req.adminState.role as AdminRole;
    await adminAuditLogService.record({
      actor: {
        adminId: req.adminState.adminId,
        username: req.adminState.username,
        role: adminRole,
      },
      action: 'VERIFICATION_REJECTED',
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'WARNING',
      targetType: 'VERIFICATION',
      targetId: id,
      metadata: { rejectionReasons, rejectionNote },
    });

    new SuccessResponse('Verification rejected successfully', { updated }, 200).send(res);
  });

  approveVerification = asyncHandler(async (req, res): Promise<void> => {
    const { id } = req.params as { id: string };

    let verification = await this.enforceOwnership(req, id);
    if (!verification) {
      verification = await workerProfileRepository.findVerificationById(id);
      if (!verification) throw new AppError('Verification not found', 404);
    }

    if (verification.status !== 'PENDING') {
      throw new AppError('Only pending verifications can be approved', 400);
    }

    const updated = await workerProfileRepository.updateVerificationStatus(id, {
      status: 'APPROVED',
    });

    const adminRole = req.adminState.role as AdminRole;
    await adminAuditLogService.record({
      actor: {
        adminId: req.adminState.adminId,
        username: req.adminState.username,
        role: adminRole,
      },
      action: 'VERIFICATION_APPROVED',
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'INFO',
      targetType: 'VERIFICATION',
      targetId: id,
      metadata: null,
    });

    new SuccessResponse('Verification approved successfully', { updated }, 200).send(res);
  });
}
