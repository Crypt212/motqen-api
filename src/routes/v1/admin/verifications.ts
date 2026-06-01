import { Router } from 'express';
import { adminVerificationsController } from '../../../state.js';
import { authenticateAdminAccess } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';

const router: Router = Router();

router.use(authenticateAdminAccess);
router.use(validateCsrf);

router.get('/:id', adminVerificationsController.getVerification);
router.post('/:id/reject', adminVerificationsController.rejectVerification);

export default router;
