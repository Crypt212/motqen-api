import { asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import AppError from '../errors/AppError.js';
import { userService, userRepository, sessionRepository, adminAuditLogService } from '../state.js';
import {
  AdminUserIdParamsSchema,
  CreatePlatformUserSchema,
  AdminUserFilterSchema,
} from '../schemas/requests/admin-platform-users.request.js';
import { parseQueryParams } from '../schemas/common.js';
import { AdminRole, AdminAuditCategory } from '../generated/prisma/client.js';

export default class AdminPlatformUsersController {
  listUsers = asyncHandler(async (req, res) => {
    const { filter, pagination, sort } = parseQueryParams(req.query as Record<string, unknown>, AdminUserFilterSchema);
    const result = await userService.findMany({ filter, pagination, sort });
    new SuccessResponse('Users retrieved successfully', result, 200).send(res);
  });

  getUser = asyncHandler(async (req, res) => {
    const parsed = AdminUserIdParamsSchema.parse(req.params);
    const user = await userService.get({ filter: { id: parsed.userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const locations = await userService.getLocations({ filter: { userId: user.id } });
    const state = await userService.getStatus({ filter: { id: user.id } });

    new SuccessResponse('User retrieved successfully', { user, locations, state }, 200).send(res);
  });

  createUser = asyncHandler(async (req, res) => {
    const body = CreatePlatformUserSchema.parse(req.body);
    const { role, ...userData } = body;

    // Prisma User.role is either USER or ADMIN. CLIENT and WORKER profiles are linked to USER.
    const createdUser = await userRepository.create({
      user: {
        ...userData,
        role: 'USER',
      } as any,
    });

    // Create the profile based on selection
    if (role === 'WORKER') {
      const { workerProfileRepository } = await import('../state.js');
      await workerProfileRepository.create({
        userId: createdUser.id,
        workerProfile: {
          experienceYears: 0,
          isInTeam: false,
          acceptsUrgentJobs: false,
        },
      });
    } else if (role === 'CLIENT') {
      const { clientProfileRepository } = await import('../state.js');
      await clientProfileRepository.create({
        userId: createdUser.id,
        clientProfile: {},
      });
    }

    const adminRole = req.adminState?.role as AdminRole;
    await adminAuditLogService.record({
      actor: req.adminState ? {
        adminId: req.adminState.adminId,
        username: req.adminState.username,
        role: adminRole,
      } : null,
      action: 'USER_CREATED',
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'WARNING',
      targetType: 'USER',
      targetId: createdUser.id,
      metadata: { role },
    });

    new SuccessResponse('User created successfully', createdUser, 201).send(res);
  });

  suspendUser = asyncHandler(async (req, res) => {
    const params = AdminUserIdParamsSchema.parse(req.params);
    const { reason } = req.body as { reason?: string };

    const user = await userService.get({ filter: { id: params.userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await userRepository.update({
      filter: { id: params.userId },
      user: { status: 'SUSPENDED' } as any,
    });

    const adminRole = req.adminState?.role as AdminRole;
    await adminAuditLogService.record({
      actor: req.adminState ? {
        adminId: req.adminState.adminId,
        username: req.adminState.username,
        role: adminRole,
      } : null,
      action: 'USER_SUSPENDED',
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'WARNING',
      targetType: 'USER',
      targetId: params.userId,
      metadata: { reason },
    });

    new SuccessResponse('User suspended successfully', updated, 200).send(res);
  });

  banUser = asyncHandler(async (req, res) => {
    const params = AdminUserIdParamsSchema.parse(req.params);
    const { reason } = req.body as { reason?: string };

    const user = await userService.get({ filter: { id: params.userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await userRepository.update({
      filter: { id: params.userId },
      user: { status: 'BANNED' } as any,
    });

    // Revoke sessions
    const adminId = req.adminState?.adminId ?? 'system';
    await sessionRepository.revokeMany({
      filter: { userId: params.userId },
      revokedBy: adminId,
    });

    const adminRole = req.adminState?.role as AdminRole;
    await adminAuditLogService.record({
      actor: req.adminState ? {
        adminId: req.adminState.adminId,
        username: req.adminState.username,
        role: adminRole,
      } : null,
      action: 'USER_BANNED',
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'CRITICAL',
      targetType: 'USER',
      targetId: params.userId,
      metadata: { reason },
    });

    new SuccessResponse('User banned successfully', updated, 200).send(res);
  });

  reactivateUser = asyncHandler(async (req, res) => {
    const params = AdminUserIdParamsSchema.parse(req.params);

    const user = await userService.get({ filter: { id: params.userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await userRepository.update({
      filter: { id: params.userId },
      user: { status: 'ACTIVE' } as any,
    });

    const adminRole = req.adminState?.role as AdminRole;
    await adminAuditLogService.record({
      actor: req.adminState ? {
        adminId: req.adminState.adminId,
        username: req.adminState.username,
        role: adminRole,
      } : null,
      action: 'USER_ACTIVATED', // USER_ACTIVATED matches existing audit logs enum
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'INFO',
      targetType: 'USER',
      targetId: params.userId,
      metadata: null,
    });

    new SuccessResponse('User reactivated successfully', updated, 200).send(res);
  });

  forceLogout = asyncHandler(async (req, res) => {
    const params = AdminUserIdParamsSchema.parse(req.params);
    const adminId = req.adminState?.adminId ?? 'system';

    const user = await userService.get({ filter: { id: params.userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await sessionRepository.revokeMany({ filter: { userId: params.userId }, revokedBy: adminId });

    const adminRole = req.adminState?.role as AdminRole;
    await adminAuditLogService.record({
      actor: req.adminState ? {
        adminId: req.adminState.adminId,
        username: req.adminState.username,
        role: adminRole,
      } : null,
      action: 'ADMIN_FORCE_LOGOUT',
      category: 'USER_MANAGEMENT' as AdminAuditCategory,
      severity: 'WARNING',
      targetType: 'USER',
      targetId: params.userId,
      metadata: null,
    });

    new SuccessResponse('User sessions revoked successfully', null, 200).send(res);
  });
}
