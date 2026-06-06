import { Router } from 'express';
import { adminDashboardController } from '../../../state.js';
import { authenticateAccess } from '../../../middlewares/authMiddleware.js';
import { authorizeAdmin } from '../../../middlewares/accessMiddleware.js';

const router: Router = Router();

router.use(authenticateAccess, authorizeAdmin);

/**
 * @swagger
 * /admin/financial/summary:
 *   get:
 *     summary: Get financial dashboard summary
 *     tags: [Admin Financial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Financial summary
 */
router.get('/summary', adminDashboardController.getSummary);

/**
 * @swagger
 * /admin/financial/activity-log:
 *   get:
 *     summary: Get activity log
 *     description: Returns activity log entries. Supports filtering by entity, actor, or recent entries.
 *     tags: [Admin Financial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *       - in: query
 *         name: actorId
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Activity log entries
 */
router.get('/activity-log', adminDashboardController.getActivityLog);

/**
 * @swagger
 * /admin/financial/users/{userId}/aggregation:
 *   get:
 *     summary: Get full user profile aggregation
 *     description: Returns user info, transaction history, work history, ratings, and disputes involvement. Optimized for admin dashboard.
 *     tags: [Admin Financial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User aggregation data
 *       404:
 *         description: User not found
 */
router.get('/users/:userId/aggregation', adminDashboardController.getUserAggregation);

export default router;
