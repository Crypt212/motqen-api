import { Router } from 'express';
import { workerEarningsController } from '../../../state.js';
import { authenticateAccess, isActive } from '../../../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticateAccess, isActive, (req, res, next) => {
  if ((req as any).userState?.role !== 'WORKER') {
    res.status(403).json({ error: 'Worker role required' });
    return;
  }
  next();
});

/**
 * @swagger
 * /workers/me/earnings:
 *   get:
 *     summary: Get my earnings balance
 *     description: Returns the authenticated worker's earnings balance breakdown including total earned, withdrawn, pending, on hold, and available amounts. Worker role required.
 *     tags: [Worker Earnings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Earnings balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/WorkerEarningsBalance'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Worker profile required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: 'Worker profile required'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', workerEarningsController.getMyEarnings);

/**
 * @swagger
 * /workers/me/earnings/withdraw-requests:
 *   get:
 *     summary: List my withdraw requests
 *     description: Returns a paginated list of the authenticated worker's withdraw requests. Worker role required.
 *     tags: [Worker Earnings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of withdraw requests
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Worker profile required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/withdraw-requests', workerEarningsController.listWithdrawRequests);

/**
 * @swagger
 * /workers/me/earnings/withdraw-requests:
 *   post:
 *     summary: Create withdraw request
 *     description: Creates a new withdraw request for the authenticated worker. Worker role required. Amount is in cents.
 *     tags: [Worker Earnings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WithdrawRequestInput'
 *     responses:
 *       201:
 *         description: Withdraw request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Worker profile required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/withdraw-requests', workerEarningsController.createWithdrawRequest);

/**
 * @swagger
 * /workers/me/earnings/payout-methods:
 *   get:
 *     summary: List my payout methods
 *     description: Returns all payout methods for the authenticated worker. Worker role required.
 *     tags: [Worker Earnings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: List of payout methods
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Worker profile required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/payout-methods', workerEarningsController.listPayoutMethods);

/**
 * @swagger
 * /workers/me/earnings/payout-methods:
 *   post:
 *     summary: Add payout method
 *     description: Adds a new payout method for the authenticated worker. Worker role required.
 *     tags: [Worker Earnings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayoutMethodInput'
 *     responses:
 *       201:
 *         description: Payout method added successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Worker profile required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/payout-methods', workerEarningsController.addPayoutMethod);

export default router;
