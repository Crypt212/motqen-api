import { Router } from 'express';
import AdminPlatformUsersController from '../../../controllers/AdminPlatformUsersController.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../../middlewares/validateRequest.js';
import {
  CreatePlatformUserSchema,
  AdminUserIdParamsSchema,
  AdminUserQuerySchema,
} from '../../../schemas/requests/admin-platform-users.request.js';

const router: Router = Router();
const controller = new AdminPlatformUsersController();

router.use(authenticateAdminAccess);
router.use(validateCsrf);
router.use(requireAdminPermission(['USER_MANAGEMENT']));

router.get('/', validateQuery(AdminUserQuerySchema), controller.listUsers);
router.post('/', validateBody(CreatePlatformUserSchema), controller.createUser);
router.get('/:userId', validateParams(AdminUserIdParamsSchema), controller.getUser);
router.post('/:userId/suspend', validateParams(AdminUserIdParamsSchema), controller.suspendUser);
router.post('/:userId/ban', validateParams(AdminUserIdParamsSchema), controller.banUser);
router.post('/:userId/reactivate', validateParams(AdminUserIdParamsSchema), controller.reactivateUser);
router.post('/:userId/force-logout', validateParams(AdminUserIdParamsSchema), controller.forceLogout);

export default router;
