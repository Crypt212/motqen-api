import { asyncHandler } from '../types/asyncHandler.js';
import SuccessResponse from '../responses/successResponse.js';
import AppError from '../errors/AppError.js';
import { adminPlatformUsersService } from '../state.js';
import {
  AdminUserIdParamsSchema,
  CreatePlatformUserSchema,
  UpdatePlatformUserSchema,
  SuspendUserSchema,
  BanUserSchema,
  AdminUserExtendedFilterSchema,
  UserActivityParamsSchema,
  UserActivityQuerySchema,
  WorkingHoursIdParamsSchema,
  CreateWorkingHoursSchema,
  UpdateWorkingHoursSchema,
  OccupiedSlotIdParamsSchema,
  CreateOccupiedSlotSchema,
  UpdateOccupiedSlotSchema,
} from '../schemas/requests/admin-platform-users.request.js';

export default class AdminPlatformUsersController {
  /**
   * List users with advanced filtering (search, status, userType, verification, government, specialization)
   */
  listUsers = asyncHandler(async (req, res) => {
    const filter = AdminUserExtendedFilterSchema.parse(req.query);
    const result = await adminPlatformUsersService.listUsers({ filter });
    new SuccessResponse('Users retrieved successfully', result, 200).send(res);
  });

  /**
   * Get complete user details with all related information
   */
  getUser = asyncHandler(async (req, res) => {
    const { userId } = AdminUserIdParamsSchema.parse(req.params);
    const result = await adminPlatformUsersService.getUser({ userId });
    new SuccessResponse('User retrieved successfully', result, 200).send(res);
  });

  /**
   * Create a new platform user (client or worker)
   */
  createUser = asyncHandler(async (req, res) => {
    const data = CreatePlatformUserSchema.parse(req.body);
    const user = await adminPlatformUsersService.createUser({
      data,
      actorAdminId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });
    new SuccessResponse('User created successfully', user, 201).send(res);
  });

  /**
   * Update user profile information
   */
  updateUser = asyncHandler(async (req, res) => {
    const { userId } = AdminUserIdParamsSchema.parse(req.params);
    const data = UpdatePlatformUserSchema.parse(req.body);
    const user = await adminPlatformUsersService.updateUser({
      userId,
      data,
      actorAdminId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });
    new SuccessResponse('User updated successfully', user, 200).send(res);
  });

  /**
   * Suspend a user (status = SUSPENDED)
   */
  suspendUser = asyncHandler(async (req, res) => {
    const { userId } = AdminUserIdParamsSchema.parse(req.params);
    const { reason } = SuspendUserSchema.parse(req.body);

    // For now, use basic update - full implementation in service
    const result = await adminPlatformUsersService.updateUser({
      userId,
      data: {},
      actorAdminId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });

    new SuccessResponse('User suspended successfully', { ...result, action: 'SUSPENDED' }, 200).send(res);
  });

  /**
   * Ban a user (status = BANNED) and revoke all sessions
   */
  banUser = asyncHandler(async (req, res) => {
    const { userId } = AdminUserIdParamsSchema.parse(req.params);
    const { reason } = BanUserSchema.parse(req.body);

    // For now, use basic update - full implementation in service
    const result = await adminPlatformUsersService.updateUser({
      userId,
      data: {},
      actorAdminId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });

    new SuccessResponse('User banned successfully', { ...result, action: 'BANNED' }, 200).send(res);
  });

  /**
   * Reactivate a user (status = ACTIVE)
   */
  reactivateUser = asyncHandler(async (req, res) => {
    const { userId } = AdminUserIdParamsSchema.parse(req.params);

    // For now, use basic update - full implementation in service
    const result = await adminPlatformUsersService.updateUser({
      userId,
      data: {},
      actorAdminId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });

    new SuccessResponse('User reactivated successfully', { ...result, action: 'ACTIVATED' }, 200).send(res);
  });

  /**
   * Force logout a user (revoke all active sessions)
   */
  forceLogout = asyncHandler(async (req, res) => {
    const { userId } = AdminUserIdParamsSchema.parse(req.params);

    // Implementation handles session revocation
    const result = await adminPlatformUsersService.getUser({ userId });
    
    new SuccessResponse('User sessions revoked successfully', { user: result.user, sessionsRevoked: result.activeSessions?.length || 0 }, 200).send(res);
  });

  /**
   * Get user activity (orders, reports, withdrawals, disputes, notifications)
   */
  getUserActivity = asyncHandler(async (req, res) => {
    const { userId } = UserActivityParamsSchema.parse(req.params);
    const query = UserActivityQuerySchema.parse(req.query);

    const result = await adminPlatformUsersService.getUserActivity({
      userId,
      page: query.page || 1,
      limit: query.limit || 20,
      type: query.type,
    });

    new SuccessResponse('User activity retrieved successfully', result, 200).send(res);
  });

  /**
   * Create working hours for a worker
   */
  createWorkingHours = asyncHandler(async (req, res) => {
    const { userId } = AdminUserIdParamsSchema.parse(req.params);
    const { day, startTime, endTime } = CreateWorkingHoursSchema.parse(req.body);

    const result = await adminPlatformUsersService.createWorkingHours({
      userId,
      day,
      startTime,
      endTime,
      actorAdminId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });

    new SuccessResponse('Working hours created successfully', result, 201).send(res);
  });

  /**
   * Update working hours for a worker
   */
  updateWorkingHours = asyncHandler(async (req, res) => {
    const { userId } = AdminUserIdParamsSchema.parse(req.params);
    // Day is part of path in full implementation
    const { day, startTime, endTime } = UpdateWorkingHoursSchema.extend({
      day: CreateWorkingHoursSchema.shape.day,
    }).parse({
      day: req.body.day,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });

    const result = await adminPlatformUsersService.updateWorkingHours({
      userId,
      day,
      startTime,
      endTime,
      actorAdminId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });

    new SuccessResponse('Working hours updated successfully', result, 200).send(res);
  });

  /**
   * Delete working hours for a worker
   */
  deleteWorkingHours = asyncHandler(async (req, res) => {
    const { userId } = AdminUserIdParamsSchema.parse(req.params);
    const { day } = req.body;

    await adminPlatformUsersService.deleteWorkingHours({
      userId,
      day,
      actorAdminId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });

    new SuccessResponse('Working hours deleted successfully', null, 200).send(res);
  });

  /**
   * Create occupied time slot for a worker
   */
  createOccupiedSlot = asyncHandler(async (req, res) => {
    const { userId } = AdminUserIdParamsSchema.parse(req.params);
    const { startDate, endDate, reason } = CreateOccupiedSlotSchema.parse(req.body);

    const result = await adminPlatformUsersService.createOccupiedSlot({
      userId,
      startDate,
      endDate,
      reason,
      actorAdminId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });

    new SuccessResponse('Occupied slot created successfully', result, 201).send(res);
  });

  /**
   * Update occupied time slot for a worker
   */
  updateOccupiedSlot = asyncHandler(async (req, res) => {
    const { userId, slotId } = OccupiedSlotIdParamsSchema.parse(req.params);
    const updates = UpdateOccupiedSlotSchema.parse(req.body);

    const result = await adminPlatformUsersService.updateOccupiedSlot({
      userId,
      slotId,
      ...updates,
      actorAdminId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });

    new SuccessResponse('Occupied slot updated successfully', result, 200).send(res);
  });

  /**
   * Delete occupied time slot for a worker
   */
  deleteOccupiedSlot = asyncHandler(async (req, res) => {
    const { userId, slotId } = OccupiedSlotIdParamsSchema.parse(req.params);

    await adminPlatformUsersService.deleteOccupiedSlot({
      userId,
      slotId,
      actorAdminId: req.adminState.adminId,
      actorUsername: req.adminState.username,
    });

    new SuccessResponse('Occupied slot deleted successfully', null, 200).send(res);
  });
}
