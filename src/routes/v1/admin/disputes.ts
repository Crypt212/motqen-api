import { Router } from 'express';
import { disputeController } from '../../../state.js';
import {
  authenticateAdminAccess,
  requireAdminPermission,
} from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';

const router: Router = Router();

router.use(authenticateAdminAccess, requireAdminPermission(['FINANCIAL_MONITOR']));
router.use(validateCsrf);

/**
 * @swagger
 * /admin/disputes:
 *   get:
 *     summary: List disputes
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, AWAITING_INFO, RESOLVED, DISMISSED]
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of disputes
 */
router.get('/', disputeController.listDisputes);

/**
 * @swagger
 * /admin/disputes:
 *   post:
 *     summary: Open a new dispute
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId:
 *                 type: string
 *               evidence:
 *                 type: array
 *               flaggedMessageIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               eventTimeline:
 *                 type: array
 *     responses:
 *       201:
 *         description: Dispute created
 */
router.post('/', disputeController.openDispute);

/**
 * @swagger
 * /admin/disputes/{id}:
 *   get:
 *     summary: Get dispute details with messages and transaction logs
 *     tags: [Disputes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dispute details
 */
router.get('/:id', disputeController.getDispute);

/**
 * @swagger
 * /admin/disputes/{id}/request-info:
 *   post:
 *     summary: Request more information from the user
 *     tags: [Disputes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Info requested
 */
router.post('/:id/request-info', disputeController.requestMoreInfo);

/**
 * @swagger
 * /admin/disputes/{id}/resolve:
 *   post:
 *     summary: Resolve a dispute (decision + reason required)
 *     tags: [Disputes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resolution, reason]
 *             properties:
 *               resolution:
 *                 type: string
 *                 enum: [REFUND_CLIENT, FAVOR_WORKER, PARTIAL_REFUND, NO_ACTION]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dispute resolved
 */
router.post('/:id/resolve', disputeController.resolveDispute);

/**
 * @swagger
 * /admin/disputes/{id}/messages:
 *   get:
 *     summary: Get dispute messages
 *     tags: [Disputes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dispute messages
 */
router.get('/:id/messages', disputeController.getMessages);

/**
 * @swagger
 * /admin/disputes/{id}/messages:
 *   post:
 *     summary: Add a message to a dispute
 *     tags: [Disputes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message added
 */
router.post('/:id/messages', disputeController.addMessage);

export default router;
