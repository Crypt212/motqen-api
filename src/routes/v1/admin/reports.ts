import { Router } from 'express';
import { adminReportsController } from '../../../state.js';
import { authenticateAdminAccess } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';

const router: Router = Router();

router.use(authenticateAdminAccess);
router.use(validateCsrf);

router.get('/:id', adminReportsController.getReport);
router.patch('/:id/status', adminReportsController.updateStatus);

export default router;
