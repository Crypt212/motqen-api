import { Router } from 'express';
import { z } from 'zod';
import { adminNotificationController } from '../../../state.js';
import { authenticateAdminAccess } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateBody, validateParams } from '../../../middlewares/validateRequest.js';

const router: Router = Router();
const idParamsSchema = z.object({ id: z.string().uuid() });
const notificationPayloadSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  target: z.enum(['all', 'users', 'craftsmen']),
});

router.use(authenticateAdminAccess, validateCsrf);

router.get('/', adminNotificationController.listNotifications);
router.post('/', validateBody(notificationPayloadSchema), adminNotificationController.sendNewNotification);
router.get('/templates', adminNotificationController.listTemplates);
router.post('/templates', validateBody(notificationPayloadSchema), adminNotificationController.createTemplate);
router.get('/:id', validateParams(idParamsSchema), adminNotificationController.getNotification);
router.delete('/:id', validateParams(idParamsSchema), adminNotificationController.deleteNotification);
router.post('/:id/send', validateParams(idParamsSchema), adminNotificationController.sendNotification);

export default router;
