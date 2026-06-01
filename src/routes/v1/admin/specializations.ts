import { Router } from 'express';
import {
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
  createSubSpecialization,
  deleteSubSpecialization,
} from '../../../controllers/SpecializationController.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateBody, validateParams } from '../../../middlewares/validateRequest.js';
import {
  CreateSpecializationSchema,
  CreateSubSpecializationSchema,
  SpecializationIdParamsSchema,
  SubSpecializationIdParamsSchema,
  UpdateSpecializationSchema,
} from '../../../schemas/requests/specialization.request.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';

const router: Router = Router();

router.use(authenticateAdminAccess);
router.use(validateCsrf);
router.use(requireAdminPermission([])); // SUPER_ADMIN only

router.post(
  '/',
  validateBody(CreateSpecializationSchema),
  createSpecialization
);

router.put(
  '/:specializationId',
  validateParams(SpecializationIdParamsSchema),
  validateBody(UpdateSpecializationSchema),
  updateSpecialization
);

router.delete(
  '/:specializationId',
  validateParams(SpecializationIdParamsSchema),
  deleteSpecialization
);

router.post(
  '/:specializationId/sub-specializations',
  validateParams(SpecializationIdParamsSchema),
  validateBody(CreateSubSpecializationSchema),
  createSubSpecialization
);

router.delete(
  '/:specializationId/sub-specializations/:subSpecializationId',
  validateParams(SpecializationIdParamsSchema),
  validateParams(SubSpecializationIdParamsSchema),
  deleteSubSpecialization
);

export default router;
