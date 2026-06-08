import { asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import { userService, userRepository, sessionRepository } from '../state.js';
import { AdminUserFilterSchema, AdminUserIdParamsSchema, CreatePlatformUserSchema, UpdateUserStatusSchema } from '../schemas/requests/admin-platform-users.request.js';
import { parseQueryParams } from '../schemas/common.js';

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
      return new SuccessResponse('User not found', null, 404).send(res);
    }

    const locations = await userService.getLocations({ filter: { userId: user.id } });
    const state = await userService.getStatus({ filter: { id: user.id } });

    new SuccessResponse('User retrieved successfully', { user, locations, state }, 200).send(res);
  });

  createUser = asyncHandler(async (req, res) => {
    const body = CreatePlatformUserSchema.parse(req.body);
    const created = await userRepository.create({ user: body as any });
    new SuccessResponse('User created successfully', created, 201).send(res);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const params = AdminUserIdParamsSchema.parse(req.params);
    const body = UpdateUserStatusSchema.parse(req.body);
    const updated = await userRepository.update({ filter: { id: params.userId }, user: { status: body.status } as any });
    new SuccessResponse('User status updated successfully', updated, 200).send(res);
  });

  forceLogout = asyncHandler(async (req, res) => {
    const params = AdminUserIdParamsSchema.parse(req.params);
    const adminId = req.adminState?.adminId ?? 'system';
    await sessionRepository.revokeMany({ filter: { userId: params.userId }, revokedBy: adminId });
    new SuccessResponse('User sessions revoked successfully', null, 200).send(res);
  });
}
import AppError from '../errors/AppError.js';
import SuccessResponse from '../responses/successResponse.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { parseQueryParams } from '../schemas/common.js';
import { AdminUserFilterSchema } from '../schemas/requests/admin-platform-users.request.js';
import { sessionRepository, userRepository, userService } from '../state.js';

export default class AdminPlatformUsersController {
  listUsers = asyncHandler(async (req, res) => {
    const { filter, pagination, sort } = parseQueryParams(req.query, AdminUserFilterSchema);
    const result = await userService.findMany({ filter, pagination, sort });
    new SuccessResponse('Users retrieved successfully', result, 200).send(res);
  });

  getUserById = asyncHandler(async (req, res) => {
    const userId = req.params.userId as string;
    const user = await userService.get({ filter: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    new SuccessResponse('User retrieved successfully', { user }, 200).send(res);
  });

  createUser = asyncHandler(async (req, res) => {
    const payload = req.body;
    const user = await userRepository.create({ user: payload });
    new SuccessResponse('User created successfully', { user }, 201).send(res);
  });

  updateUserStatus = asyncHandler(async (req, res) => {
    const userId = req.params.userId as string;
    const { status } = req.body as { status: string };
    const user = await userService.update({ filter: { id: userId }, data: { status } });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    new SuccessResponse('User status updated successfully', { user }, 200).send(res);
  });

  forceLogout = asyncHandler(async (req, res) => {
    const userId = req.params.userId as string;
    await sessionRepository.revokeMany({
      filter: { userId },
      revokedBy: req.adminState.adminId,
    });
    new SuccessResponse('User sessions revoked successfully', null, 200).send(res);
  });
}
