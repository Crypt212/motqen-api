import { Router } from 'express';
import { adminWorkersController } from '../../../state.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateBody, validateQuery, validateParams } from '../../../middlewares/validateRequest.js';
import {
  AdminWorkerQuerySchema,
  ManualWorkerCreateSchema,
  RejectWorkerSchema,
  SuspendWorkerSchema,
} from '../../../schemas/requests/admin-workers.request.js';
import { z } from '../../../libs/zod.js';
import { UUIDSchema } from '../../../schemas/common.js';

const router: Router = Router();

router.use(authenticateAdminAccess);
router.use(validateCsrf);
router.use(requireAdminPermission(['USER_MANAGEMENT']));

const WorkerIdParamSchema = z.object({
  workerId: UUIDSchema,
});

/**
 * @swagger
 * tags:
 *   name: Admin Workers
 *   description: Worker account management, verification reviews, and administrative moderation dashboard
 */

/**
 * @swagger
 * /admin/workers:
 *   get:
 *     summary: Retrieve list of all workers with pagination and filters
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: accountStatus
 *         schema:
 *           type: string
 *           enum: [ACTIVE, SUSPENDED, BANNED]
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *       - in: query
 *         name: government
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of workers retrieved successfully
 *       401:
 *         description: Unauthorized admin session
 *       403:
 *         description: Forbidden admin role permissions
 */
router.get('/', validateQuery(AdminWorkerQuerySchema), adminWorkersController.listWorkers);

/**
 * @swagger
 * /admin/workers:
 *   post:
 *     summary: Manually create a worker profile (e.g. for showcase/testing)
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - governmentId
 *               - cityId
 *               - specializationIds
 *             properties:
 *               firstName:
 *                 type: string
 *               middleName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *                 description: Valid Egyptian phone number
 *               governmentId:
 *                 type: string
 *                 format: uuid
 *               cityId:
 *                 type: string
 *                 format: uuid
 *               specializationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Worker manually onboarded successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Phone number already registered
 */
router.post('/', validateBody(ManualWorkerCreateSchema), adminWorkersController.createWorker);

/**
 * @swagger
 * /admin/workers/{workerId}:
 *   get:
 *     summary: Retrieve comprehensive worker profile details
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Worker details retrieved successfully
 *       404:
 *         description: Worker not found
 */
router.get('/:workerId', validateParams(WorkerIdParamSchema), adminWorkersController.getWorkerDetails);

/**
 * @swagger
 * /admin/workers/{workerId}/approve:
 *   post:
 *     summary: Approve pending worker verification review
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Worker verification approved successfully
 *       400:
 *         description: Only pending verifications can be approved
 *       404:
 *         description: Verification record not found
 */
router.post('/:workerId/approve', validateParams(WorkerIdParamSchema), adminWorkersController.approveWorker);

/**
 * @swagger
 * /admin/workers/{workerId}/reject:
 *   post:
 *     summary: Reject pending worker verification review
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejectionReasons
 *             properties:
 *               rejectionReasons:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [BLURRY_IMAGE, EXPIRED_ID, MISMATCHED_PERSON, MISSING_DOCUMENT, INVALID_DOCUMENT, OTHER]
 *               rejectionNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Worker verification rejected successfully
 *       400:
 *         description: Rejection reasons required or note missing when OTHER specified
 *       404:
 *         description: Verification record not found
 */
router.post('/:workerId/reject', validateParams(WorkerIdParamSchema), validateBody(RejectWorkerSchema), adminWorkersController.rejectWorker);

/**
 * @swagger
 * /admin/workers/{workerId}/suspend:
 *   post:
 *     summary: Suspend worker account
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Worker account suspended successfully
 *       404:
 *         description: Worker profile not found
 */
router.post('/:workerId/suspend', validateParams(WorkerIdParamSchema), validateBody(SuspendWorkerSchema), adminWorkersController.suspendWorker);

/**
 * @swagger
 * /admin/workers/{workerId}/reactivate:
 *   post:
 *     summary: Reactivate suspended/banned worker account
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Worker account reactivated successfully
 *       404:
 *         description: Worker profile not found
 */
router.post('/:workerId/reactivate', validateParams(WorkerIdParamSchema), adminWorkersController.reactivateWorker);

/**
 * @swagger
 * /admin/workers/{workerId}/ban:
 *   post:
 *     summary: Ban worker account and revoke active sessions
 *     tags: [Admin Workers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Worker account banned successfully
 *       404:
 *         description: Worker profile not found
 */
router.post('/:workerId/ban', validateParams(WorkerIdParamSchema), validateBody(SuspendWorkerSchema), adminWorkersController.banWorker);

export default router;
