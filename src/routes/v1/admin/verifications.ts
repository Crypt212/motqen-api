import { Router } from 'express';
import { adminVerificationsController } from '../../../state.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';

const router: Router = Router();

router.use(authenticateAdminAccess);
router.use(validateCsrf);
router.use(requireAdminPermission(['USER_MANAGEMENT']));

/**
 * @swagger
 * /admin/verifications/{id}:
 *   get:
 *     summary: Retrieve details of a worker verification issue
 *     tags: [Admin Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification issue retrieved
 */
router.get('/:id', adminVerificationsController.getVerification);

/**
 * @swagger
 * /admin/verifications/{id}/approve:
 *   post:
 *     summary: Approve a worker verification
 *     tags: [Admin Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification approved successfully
 */
router.post('/:id/approve', adminVerificationsController.approveVerification);

/**
 * @swagger
 * /admin/verifications/{id}/reject:
 *   post:
 *     summary: Reject a worker verification
 *     tags: [Admin Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification rejected successfully
 */
router.post('/:id/reject', adminVerificationsController.rejectVerification);

export default router;
