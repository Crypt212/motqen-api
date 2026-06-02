import { Router } from 'express';
import { refundController } from '../../../state.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateBody, validateParams } from '../../../middlewares/validateRequest.js';
import { initiateRefundSchema, orderIdParamsSchema } from '../../../schemas/financial/refund.schema.js';

const router: Router = Router({ mergeParams: true });

router.use(authenticateAdminAccess, requireAdminPermission(['FINANCIAL_MONITOR']));
router.use(validateCsrf);

router.post(
  '/',
  validateParams(orderIdParamsSchema),
  validateBody(initiateRefundSchema),
  refundController.initiateRefund
);

router.get('/', validateParams(orderIdParamsSchema), refundController.listRefunds);

export default router;
