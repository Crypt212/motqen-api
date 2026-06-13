import { Router } from 'express';

// ════════════════════════════════════════════════════════════════════════════
// CONSOLIDATED DASHBOARD APIs (21 endpoints)
// ════════════════════════════════════════════════════════════════════════════
import adminApiRouter from './api.js';

// ════════════════════════════════════════════════════════════════════════════
// OTHER ADMIN ROUTERS (non-dashboard specific)
// ════════════════════════════════════════════════════════════════════════════
import disputeRouter from './disputes.js';
import adminAuditLogsRouter from './audit-logs.js';
import adminIssuesRouter from './issues.js';
import adminVerificationsRouter from './verifications.js';
import adminReportsRouter from './reports.js';
import adminGovernmentsRouter from './governments.js';
import adminSpecializationsRouter from './specializations.js';
import adminPlatformUsersRouter from './platform-users.js';
import adminUsersRouter from './users.js';
import adminOrdersRouter from './orders.js';
import adminWorkersRouter from './workers.js';
import adminCasesRouter from './cases.js';

const adminRouter: Router = Router();

// ════════════════════════════════════════════════════════════════════════════
// Mount consolidated admin dashboard APIs (covers auth, dashboard, finance, etc.)
// ════════════════════════════════════════════════════════════════════════════
adminRouter.use('/', adminApiRouter);

// ════════════════════════════════════════════════════════════════════════════
// Mount other admin routers
// ════════════════════════════════════════════════════════════════════════════
adminRouter.use('/audit-logs', adminAuditLogsRouter);
adminRouter.use('/issues', adminIssuesRouter);
adminRouter.use('/cases', adminCasesRouter);
adminRouter.use('/verifications', adminVerificationsRouter);
adminRouter.use('/reports', adminReportsRouter);
adminRouter.use('/governments', adminGovernmentsRouter);
adminRouter.use('/specializations', adminSpecializationsRouter);
adminRouter.use('/platform-users', adminPlatformUsersRouter);
adminRouter.use('/users', adminUsersRouter);
adminRouter.use('/orders', adminOrdersRouter);
adminRouter.use('/disputes', disputeRouter);
adminRouter.use('/workers', adminWorkersRouter); // Mount workers at /api/v1/admin/workers

export default adminRouter;
