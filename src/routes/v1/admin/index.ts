import { Router } from 'express';
import escrowRouter from './escrow.js';
import withdrawalAdminRouter from './withdrawals.js';
import refundRouter from './refunds.js';
import adminDashboardRouter from './admin-dashboard.js';
import disputeRouter from './disputes.js';
import adminAuthRouter from './auth.js';
import adminUsersRouter from './users.js';
import adminAuditLogsRouter from './audit-logs.js';
import adminIssuesRouter from './issues.js';
import adminVerificationsRouter from './verifications.js';
import adminReportsRouter from './reports.js';
import adminGovernmentsRouter from './governments.js';
import adminSpecializationsRouter from './specializations.js';
import adminAdminsRouter from './admins.js';
import adminPlatformUsersRouter from './platform-users.js';
import adminOrdersRouter from './orders.js';

const adminRouter: Router = Router();

adminRouter.use('/auth', adminAuthRouter);
adminRouter.use('/users', adminUsersRouter);
adminRouter.use('/platform-users', adminPlatformUsersRouter);
adminRouter.use('/audit-logs', adminAuditLogsRouter);
adminRouter.use('/issues', adminIssuesRouter);
adminRouter.use('/cases', adminCasesRouter);
adminRouter.use('/verifications', adminVerificationsRouter);
adminRouter.use('/reports', adminReportsRouter);
adminRouter.use('/governments', adminGovernmentsRouter);
adminRouter.use('/specializations', adminSpecializationsRouter);
adminRouter.use('/admins', adminAdminsRouter);
adminRouter.use('/escrow-holds', escrowRouter);
adminRouter.use('/orders/:orderId/refunds', refundRouter);
adminRouter.use('/orders', adminOrdersRouter);
adminRouter.use('/finance', adminDashboardRouter);
adminRouter.use('/disputes', disputeRouter);
adminRouter.use('/', withdrawalAdminRouter);

export default adminRouter;
