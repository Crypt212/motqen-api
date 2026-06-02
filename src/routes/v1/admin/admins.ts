import { Router } from 'express';
import { adminUsersController } from '../../../state.js';
import { authenticateAdminAccess } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';

const router: Router = Router();

router.use(authenticateAdminAccess);
router.use(validateCsrf);

/**
 * @swagger
 * /admin/admins/available:
 *   get:
 *     summary: Get a list of available (active) admins
 *     tags: [Admin Discovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Optional department (role) filter
 *     responses:
 *       200:
 *         description: List of available admins retrieved
 */
router.get('/available', adminUsersController.getAvailableAdmins);

export default router;
