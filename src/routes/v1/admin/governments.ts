import { Router } from 'express';
import { governmentController } from '../../../state.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateBody, validateParams } from '../../../middlewares/validateRequest.js';
import {
  CreateGovernmentSchema,
  GovernmentIdParamsSchema,
  UpdateGovernmentSchema,
} from '../../../schemas/requests/government.request.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';

const router: Router = Router();

router.use(authenticateAdminAccess);
router.use(validateCsrf);
router.use(requireAdminPermission([])); // SUPER_ADMIN only

router.post(
  '/',
  validateBody(CreateGovernmentSchema),
  governmentController.createGovernment
);

router.put(
  '/:governmentId',
  validateParams(GovernmentIdParamsSchema),
  validateBody(UpdateGovernmentSchema),
  governmentController.updateGovernment
);

router.delete(
  '/:governmentId',
  validateParams(GovernmentIdParamsSchema),
  governmentController.deleteGovernment
);

export default router;
