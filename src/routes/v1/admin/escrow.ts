import { Router } from 'express';
import { escrowController } from '../../../state.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateParams, validateQuery } from '../../../middlewares/validateRequest.js';
import {
  escrowHoldIdParamsSchema,
  listEscrowHoldsQuerySchema,
} from '../../../schemas/financial/escrow.schema.js';

const router: Router = Router();

router.use(authenticateAdminAccess, requireAdminPermission(['FINANCIAL_MONITOR']));
router.use(validateCsrf);

router.get('/', validateQuery(listEscrowHoldsQuerySchema), escrowController.list);

router.post(
  '/:id/release',
  validateParams(escrowHoldIdParamsSchema),
  escrowController.manualRelease
);

export default router;
