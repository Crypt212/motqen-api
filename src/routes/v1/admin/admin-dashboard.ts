import { Router } from 'express';
import { adminDashboardController } from '../../../state.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateParams, validateQuery } from '../../../middlewares/validateRequest.js';
import {
  activityLogQuerySchema,
  financialSummaryQuerySchema,
  userAggregationParamsSchema,
} from '../../../schemas/financial/dashboard.schema.js';

const router: Router = Router();

router.use(authenticateAdminAccess, requireAdminPermission(['FINANCIAL_MONITOR']));
router.use(validateCsrf);

router.get('/summary', validateQuery(financialSummaryQuerySchema), adminDashboardController.getSummary);

router.get(
  '/activity-log',
  validateQuery(activityLogQuerySchema),
  adminDashboardController.getActivityLog
);

router.get(
  '/users/:userId/aggregation',
  validateParams(userAggregationParamsSchema),
  adminDashboardController.getUserAggregation
);

export default router;
