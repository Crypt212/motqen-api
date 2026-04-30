import { Router } from 'express';
import { withdrawalAdminController } from '../../../state.js';
import { authenticateAccess, authorizeAdmin } from '../../../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateAccess, authorizeAdmin);

/**
 * @swagger
 * /admin/withdraw-requests:
 *   get:
 *     summary: List withdraw requests (admin)
 *     tags: [Withdrawals (Admin)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of withdraw requests
 */
router.get('/withdraw-requests', withdrawalAdminController.listRequests);

/**
 * @swagger
 * /admin/withdraw-requests/{id}/start-processing:
 *   post:
 *     summary: Start processing a withdrawal (PENDING → IN_PROGRESS)
 *     tags: [Withdrawals (Admin)]
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
 *         description: Processing started, payout execution created
 */
router.post('/withdraw-requests/:id/start-processing', withdrawalAdminController.startProcessing);

/**
 * @swagger
 * /admin/withdraw-requests/{id}/reject:
 *   post:
 *     summary: Reject withdraw request
 *     tags: [Withdrawals (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request rejected
 */
router.post('/withdraw-requests/:id/reject', withdrawalAdminController.rejectRequest);

/**
 * @swagger
 * /admin/payout-executions/{id}/complete:
 *   post:
 *     summary: Complete payout execution (requires proof of payment)
 *     tags: [Withdrawals (Admin)]
 *     security:
 *       - bearerAuth: []
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
 *             required: [proof_of_payment_url, external_reference_id]
 *             properties:
 *               proof_of_payment_url:
 *                 type: string
 *                 description: URL of proof of payment upload
 *               external_reference_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payout completed
 *       400:
 *         description: Missing proof_of_payment_url
 */
router.post('/payout-executions/:id/complete', withdrawalAdminController.completePayout);

/**
 * @swagger
 * /admin/payout-executions/{id}/fail:
 *   post:
 *     summary: Mark payout execution as failed
 *     tags: [Withdrawals (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payout marked as failed
 */
router.post('/payout-executions/:id/fail', withdrawalAdminController.failPayout);

/**
 * @swagger
 * /admin/worker-debts:
 *   get:
 *     summary: List worker debts
 *     tags: [Withdrawals (Admin)]
 *     parameters:
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
 *         description: List of worker debts
 */
router.get('/worker-debts', withdrawalAdminController.listDebts);

/**
 * @swagger
 * /admin/worker-debts/{id}/settle:
 *   post:
 *     summary: Settle worker debt
 *     tags: [Withdrawals (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Debt settled
 */
router.post('/worker-debts/:id/settle', withdrawalAdminController.settleDebt);

export default router;
