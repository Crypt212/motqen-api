import { Router } from 'express';
import { adminIssuesController } from '../../../state.js';
import { authenticateAdminAccess } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';

const router: Router = Router();

router.use(authenticateAdminAccess);
router.use(validateCsrf);

/**
 * @swagger
 * /admin/issues:
 *   get:
 *     summary: Get unified queue of reports, disputes, and verifications
 *     tags: [Admin Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unified queue retrieved
 */
router.get('/', adminIssuesController.getUnifiedQueue);

/**
 * @swagger
 * /admin/issues/claim:
 *   post:
 *     summary: Claim an unassigned issue
 *     tags: [Admin Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Issue claimed successfully
 */
router.post('/claim', adminIssuesController.claimIssue);

/**
 * @swagger
 * /admin/issues/transfer-admin:
 *   post:
 *     summary: Transfer an issue to another admin
 *     tags: [Admin Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Issue transferred successfully
 */
router.post('/transfer-admin', adminIssuesController.transferToAdmin);

/**
 * @swagger
 * /admin/issues/transfer-department:
 *   post:
 *     summary: Transfer an issue to another department
 *     tags: [Admin Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Issue transferred successfully
 */
router.post('/transfer-department', adminIssuesController.transferToDepartment);

/**
 * @swagger
 * /admin/issues/unassign:
 *   post:
 *     summary: Return an issue to the unassigned queue
 *     tags: [Admin Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Issue unassigned successfully
 */
router.post('/unassign', adminIssuesController.unassignIssue);

/**
 * @swagger
 * /admin/issues/{targetType}/{targetId}/notes:
 *   get:
 *     summary: Get notes for an issue
 *     tags: [Admin Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notes retrieved
 */
router.get('/:targetType/:targetId/notes', adminIssuesController.getNotes);

/**
 * @swagger
 * /admin/issues/{targetType}/{targetId}/notes:
 *   post:
 *     summary: Add a note to an issue
 *     tags: [Admin Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Note added successfully
 */
router.post('/:targetType/:targetId/notes', adminIssuesController.addNote);

/**
 * @swagger
 * /admin/issues/{targetType}/{targetId}/history:
 *   get:
 *     summary: Get assignment history for an issue
 *     tags: [Admin Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: History retrieved
 */
router.get('/:targetType/:targetId/history', adminIssuesController.getHistory);

export default router;
