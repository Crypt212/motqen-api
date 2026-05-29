/**
 * @fileoverview API Routes - Main router combining all route modules
 * @module routes/api
*/

import { Router } from 'express';
import authRouter from './auth.js';
import dashboardRouter from './dashboard.js';
import governmentRouter from './governments.js';
import specializationRouter from './specializations.js';
import chatRouter from './chat.js';
import { isActive, authenticateAccess } from '../../middlewares/authMiddleware.js';
import { sensitiveIpRateLimiter } from '../../middlewares/rateLimitMiddleware.js';
import workersRouter from './workers.js';
import ordersRouter from './orders.js';
import notificationRouter from './notifications.js';
import escrowRouter from './financial/escrow.js';
import workerEarningsRouter from './financial/worker-earnings.js';
import withdrawalAdminRouter from './financial/withdrawals.js';
import refundRouter from './financial/refunds.js';
import adminDashboardRouter from './financial/admin-dashboard.js';
import disputeRouter from './financial/disputes.js';
import paymentsRouter from './payments.js';
import reportsRouter from './reports.js';

const mainRouter = Router();

mainRouter.use('/auth', sensitiveIpRateLimiter, authRouter);
mainRouter.use('/me', authenticateAccess, isActive, dashboardRouter);
mainRouter.use('/chat', authenticateAccess, isActive, chatRouter);
mainRouter.use('/workers', workersRouter);
mainRouter.use('/governments', governmentRouter);
mainRouter.use('/specializations', specializationRouter);
mainRouter.use('/orders', authenticateAccess, isActive, ordersRouter);
mainRouter.use('/notifications', authenticateAccess, isActive, notificationRouter);

mainRouter.use('/admin/escrow-holds', escrowRouter);
mainRouter.use('/admin/orders/:orderId/refunds', refundRouter);
mainRouter.use('/admin/financial', adminDashboardRouter);
mainRouter.use('/admin/disputes', disputeRouter);
mainRouter.use('/admin', withdrawalAdminRouter);
mainRouter.use('/workers/me/earnings', workerEarningsRouter);
mainRouter.use('/payments', paymentsRouter);
mainRouter.use('/reports', authenticateAccess, isActive, reportsRouter);

export default mainRouter;
