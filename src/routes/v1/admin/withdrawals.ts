import { Router } from 'express';
import { withdrawalAdminController } from '../../../state.js';
import {
  authenticateAdminAccess,
  requireAdminPermission,
} from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../../middlewares/validateRequest.js';
import {
  idParamsSchema,
  rejectWithdrawRequestBodySchema,
  completePayoutBodySchema,
  failPayoutBodySchema,
  listDebtsQuerySchema,
  listWithdrawRequestsQuerySchema,
} from '../../../schemas/financial/withdrawal.schema.js';

const router: Router = Router();

router.use(authenticateAdminAccess, requireAdminPermission(['FINANCIAL_MONITOR']));
router.use(validateCsrf);

router.get(
  '/withdraw-requests',
  validateQuery(listWithdrawRequestsQuerySchema),
  withdrawalAdminController.listWithdrawRequests
);

router.post(
  '/withdraw-requests/:id/start-processing',
  validateParams(idParamsSchema),
  withdrawalAdminController.startProcessing
);

router.post(
  '/withdraw-requests/:id/reject',
  validateParams(idParamsSchema),
  validateBody(rejectWithdrawRequestBodySchema),
  withdrawalAdminController.rejectRequest
);

router.post(
  '/payout-executions/:id/complete',
  validateParams(idParamsSchema),
  validateBody(completePayoutBodySchema),
  withdrawalAdminController.completePayout
);

router.post(
  '/payout-executions/:id/fail',
  validateParams(idParamsSchema),
  validateBody(failPayoutBodySchema),
  withdrawalAdminController.failPayout
);

router.get(
  '/worker-debts',
  validateQuery(listDebtsQuerySchema),
  withdrawalAdminController.listDebts
);

router.post(
  '/worker-debts/:id/settle',
  validateParams(idParamsSchema),
  withdrawalAdminController.settleDebt
);

export default router;
