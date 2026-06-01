import { Router } from 'express';
import {
  getAdminAuditMetrics,
  listAdminAuditLogs,
} from '../../../controllers/AdminAuditLogController.js';
import { authenticateAdminAccess } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateQuery } from '../../../middlewares/validateRequest.js';
import {
  AdminAuditLogQuerySchema,
  AdminAuditMetricsQuerySchema,
} from '../../../schemas/requests/admin-audit-logs.request.js';

const adminAuditLogsRouter: Router = Router();

adminAuditLogsRouter.use(authenticateAdminAccess);
adminAuditLogsRouter.use(validateCsrf);
adminAuditLogsRouter.get('/', validateQuery(AdminAuditLogQuerySchema), listAdminAuditLogs);
adminAuditLogsRouter.get(
  '/metrics',
  validateQuery(AdminAuditMetricsQuerySchema),
  getAdminAuditMetrics
);

export default adminAuditLogsRouter;
