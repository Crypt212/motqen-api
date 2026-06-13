import { Router } from 'express';
import { z } from 'zod';

// ════════════════════════════════════════════════════════════════════════════
// CONTROLLERS
// ════════════════════════════════════════════════════════════════════════════

import { login, logout, refreshAccessToken } from '../../../controllers/AdminAuthController.js';
import { adminDashboardController } from '../../../state.js';
import { adminUsersController } from '../../../state.js';
import { escrowController } from '../../../state.js';
import { refundController } from '../../../state.js';
import { withdrawalAdminController } from '../../../state.js';
import { workerEarningsController } from '../../../state.js';

// ════════════════════════════════════════════════════════════════════════════
// MIDDLEWARES
// ════════════════════════════════════════════════════════════════════════════

import {
  authenticateAdminAccess,
  requireAdminPermission,
  authenticateAdminRefresh,
} from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../../../middlewares/validateRequest.js';
import { sensitiveIpRateLimiter } from '../../../middlewares/rateLimitMiddleware.js';

// ════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ════════════════════════════════════════════════════════════════════════════

import { AdminLoginSchema } from '../../../schemas/requests/admin-auth.request.js';
import {
  financialSummaryQuerySchema,
  activityLogQuerySchema,
  userAggregationParamsSchema,
} from '../../../schemas/financial/dashboard.schema.js';

const router: Router = Router();

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1: AUTHENTICATION ENDPOINTS (Public & Semi-Public)
// ════════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/v1/admin/auth/login
 * @desc    Admin login with username and password
 * @access  Public (rate-limited to prevent brute force)
 */
router.post(
  '/auth/login',
  sensitiveIpRateLimiter,
  validateBody(AdminLoginSchema),
  login
);

/**
 * @route   POST /api/v1/admin/auth/logout
 * @desc    Admin logout, invalidate session
 * @access  Private (admin)
 */
router.post('/auth/logout', authenticateAdminAccess, logout);

/**
 * @route   GET /api/v1/admin/auth/access
 * @desc    Refresh access token using refresh token from cookie
 * @access  Private (admin with valid refresh token)
 */
router.get(
  '/auth/access',
  authenticateAdminRefresh,
  refreshAccessToken
);

// ════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE: Apply authentication & CSRF to all subsequent routes
// ════════════════════════════════════════════════════════════════════════════

router.use(authenticateAdminAccess, validateCsrf);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2: DASHBOARD SUMMARY & ANALYTICS
// ════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/admin/dashboard/summary
 * @desc    Get financial dashboard summary with optional date range filter
 * @access  Private (admin with FINANCIAL_MONITOR permission)
 */
router.get(
  '/dashboard/summary',
  requireAdminPermission(['FINANCIAL_MONITOR']),
  validateQuery(financialSummaryQuerySchema),
  adminDashboardController.getSummary
);

/**
 * @route   GET /api/v1/admin/dashboard/activity-log
 * @desc    Get activity log entries with optional filters
 * @access  Private (admin with FINANCIAL_MONITOR permission)
 */
router.get(
  '/dashboard/activity-log',
  requireAdminPermission(['FINANCIAL_MONITOR']),
  validateQuery(activityLogQuerySchema),
  adminDashboardController.getActivityLog
);

/**
 * @route   GET /api/v1/admin/dashboard/users/:userId/aggregation
 * @desc    Get financial aggregation data for a specific user
 * @access  Private (admin with FINANCIAL_MONITOR permission)
 */
router.get(
  '/dashboard/users/:userId/aggregation',
  requireAdminPermission(['FINANCIAL_MONITOR']),
  validateParams(userAggregationParamsSchema),
  adminDashboardController.getUserAggregation
);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3: ADMIN MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/admin/admins/available
 * @desc    Get list of available (active) admins
 * @access  Private (admin)
 */
router.get('/admins/available', adminUsersController.getAvailableAdmins);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4: FINANCIAL OPERATIONS - ESCROW MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

/**
 * @route   GET /api/v1/admin/finance/escrow-holds
 * @desc    List all escrow holds with optional pagination and filters
 * @access  Private (admin)
 */
router.get('/finance/escrow-holds', escrowController.list);

/**
 * @route   POST /api/v1/admin/finance/escrow-holds/:id/release
 * @desc    Manually release an escrow hold by ID
 * @access  Private (admin)
 */
router.post(
  '/finance/escrow-holds/:id/release',
  validateParams(z.object({ id: z.string().uuid() })),
  escrowController.manualRelease
);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5: FINANCIAL OPERATIONS - REFUND PROCESSING
// ════════════════════════════════════════════════════════════════════════════

/**
 * @route   POST /api/v1/admin/finance/orders/:orderId/refunds
 * @desc    Initiate refund for an order (idempotent operation)
 * @access  Private (admin)
 */
router.post(
  '/finance/orders/:orderId/refunds',
  validateParams(z.object({ orderId: z.string().uuid() })),
  refundController.initiateRefund
);

/**
 * @route   GET /api/v1/admin/finance/orders/:orderId/refunds
 * @desc    List all refunds for a specific order
 * @access  Private (admin)
 */
router.get(
  '/finance/orders/:orderId/refunds',
  validateParams(z.object({ orderId: z.string().uuid() })),
  refundController.listRefunds
);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6: FINANCIAL OPERATIONS - WITHDRAWAL MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

// Reusable validation schemas for withdrawal operations
const idParamsSchema = z.object({ id: z.string().uuid() });
const rejectBodySchema = z.object({ notes: z.string().optional() });
const completePayoutBodySchema = z.object({
  proof_of_payment_url: z.string().url(),
  external_reference_id: z.string().min(1),
});
const failPayoutBodySchema = z.object({ reason: z.string().optional() });

/**
 * @route   GET /api/v1/admin/finance/withdraw-requests
 * @desc    List all withdrawal requests with pagination
 * @access  Private (admin)
 */
router.get('/finance/withdraw-requests', workerEarningsController.listWithdrawRequests);

/**
 * @route   POST /api/v1/admin/finance/withdraw-requests/:id/start-processing
 * @desc    Start processing a withdrawal request
 * @access  Private (admin)
 */
router.post(
  '/finance/withdraw-requests/:id/start-processing',
  validateParams(idParamsSchema),
  withdrawalAdminController.startProcessing
);

/**
 * @route   POST /api/v1/admin/finance/withdraw-requests/:id/reject
 * @desc    Reject a withdrawal request with optional notes
 * @access  Private (admin)
 */
router.post(
  '/finance/withdraw-requests/:id/reject',
  validateParams(idParamsSchema),
  validateBody(rejectBodySchema),
  withdrawalAdminController.rejectRequest
);

/**
 * @route   POST /api/v1/admin/finance/payout-executions/:id/complete
 * @desc    Mark a payout execution as completed with proof of payment
 * @access  Private (admin)
 */
router.post(
  '/finance/payout-executions/:id/complete',
  validateParams(idParamsSchema),
  validateBody(completePayoutBodySchema),
  withdrawalAdminController.completePayout
);

/**
 * @route   POST /api/v1/admin/finance/payout-executions/:id/fail
 * @desc    Mark a payout execution as failed with optional reason
 * @access  Private (admin)
 */
router.post(
  '/finance/payout-executions/:id/fail',
  validateParams(idParamsSchema),
  validateBody(failPayoutBodySchema),
  withdrawalAdminController.failPayout
);

/**
 * @route   GET /api/v1/admin/finance/worker-debts
 * @desc    List all worker debts with pagination
 * @access  Private (admin)
 */
router.get('/finance/worker-debts', workerEarningsController.listWithdrawRequests);

/**
 * @route   POST /api/v1/admin/finance/worker-debts/:id/settle
 * @desc    Settle a worker debt
 * @access  Private (admin)
 */
router.post(
  '/finance/worker-debts/:id/settle',
  validateParams(idParamsSchema),
  withdrawalAdminController.settleDebt
);

// ════════════════════════════════════════════════════════════════════════════
// EXPORT
// ════════════════════════════════════════════════════════════════════════════

export default router;
