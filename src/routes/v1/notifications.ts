import { Router } from 'express';
import { getNotifications, markAllRead } from '../../controllers/NotificationController.js';
import { validateQuery } from '../../middlewares/validateRequest.js';
import { z } from 'zod';

const notificationRouter: Router = Router();

const GetNotificationsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

notificationRouter.get('/', validateQuery(GetNotificationsQuerySchema), getNotifications);
notificationRouter.post('/mark-all-read', markAllRead);

export default notificationRouter;
