import SuccessResponse from '../responses/successResponse.js';
import { asyncHandler } from '../types/asyncHandler.js';
import { notificationService } from '../state.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const cursor = req.query.cursor as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const result = await notificationService.getNotifications(userId, cursor, limit);

  new SuccessResponse('Notifications retrieved successfully', result, 200).send(res);
});

export const markAllRead = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;

  await notificationService.markAllRead(userId);

  new SuccessResponse('All notifications marked as read', { success: true }, 200).send(res);
});
