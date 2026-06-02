import { asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import { adminUsersService, adminAuthService } from '../state.js';
import { AdminRole, AdminStatus } from '../domain/admin.entity.js';

export default class AdminUsersController {
  listAdmins = asyncHandler(async (req, res): Promise<void> => {
    const admins = await adminUsersService.listAdmins();
    new SuccessResponse('Admins listed successfully', admins, 200).send(res);
  });

  createAdmin = asyncHandler(async (req, res): Promise<void> => {
    const admin = await adminUsersService.createAdmin({
      data: req.body,
      actorId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });

    // Omit passwordHash from response
    const { passwordHash, ...adminSafe } = admin as any;
    new SuccessResponse('Admin created successfully', adminSafe, 201).send(res);
  });

  updateRole = asyncHandler(async (req, res): Promise<void> => {
    const adminId = req.params.adminId as string;
    const { role } = req.body;
    const updated = await adminUsersService.updateAdminRole({
      adminId,
      role: role as AdminRole,
      actorId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });
    new SuccessResponse('Admin role updated successfully', updated, 200).send(res);
  });

  updateStatus = asyncHandler(async (req, res): Promise<void> => {
    let adminId = req.params.adminId as string;
    const { status } = req.body;
    const updated = await adminUsersService.updateAdminStatus({
      adminId,
      status: status as AdminStatus,
      actorId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });
    new SuccessResponse('Admin status updated successfully', updated, 200).send(res);
  });

  forceLogout = asyncHandler(async (req, res): Promise<void> => {
    const adminId = req.params.adminId as string;
    await adminAuthService.revokeSessionsForAdmin(adminId, req.adminState.adminId);
    new SuccessResponse('Admin sessions revoked successfully', null, 200).send(res);
  });

  getAvailableAdmins = asyncHandler(async (req, res): Promise<void> => {
    const department = req.query.department as AdminRole | undefined;
    const admins = await adminUsersService.l istAvailableAdmins({ department });
    const adminsSafe = admins.map(({ passwordHash, ...adminSafe }) => adminSafe);
    new SuccessResponse('Available admins retrieved successfully', adminsSafe, 200).send(res);
  });
}
