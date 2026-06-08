import { Router } from 'express';
import { adminCasesController } from '../../../state.js';
import {
  authenticateAdminAccess,
  requireAdminPermission,
} from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateParams, validateQuery } from '../../../middlewares/validateRequest.js';
import {
  AdminCaseDetailParamsSchema,
  AdminCaseListQuerySchema,
  AdminCaseStatsQuerySchema,
} from '../../../schemas/requests/adminCase.request.js';

const router: Router = Router();

router.use(authenticateAdminAccess);
router.use(validateCsrf);
router.use(
  requireAdminPermission([
    'SUPER_ADMIN',
    'USER_MANAGEMENT',
    'FINANCIAL_MONITOR',
    'ISSUES_MANAGEMENT',
  ])
);

router.get('/stats', validateQuery(AdminCaseStatsQuerySchema), adminCasesController.getCaseStats);
router.get('/', validateQuery(AdminCaseListQuerySchema), adminCasesController.listCases);
router.get(
  '/:caseType/:caseId',
  validateParams(AdminCaseDetailParamsSchema),
  adminCasesController.getCaseDetail
);

export default router;
