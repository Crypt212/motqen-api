import { Router } from 'express';
import { adminPlatformDashboardController } from '../../../state.js';
import { authenticateAdminAccess } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';

const router: Router = Router();

router.use(authenticateAdminAccess, validateCsrf);

router.get('/stats', adminPlatformDashboardController.getStats);
router.get('/recent-events', adminPlatformDashboardController.getRecentEvents);

export default router;
