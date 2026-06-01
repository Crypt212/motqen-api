import { Router } from 'express';
import AdminUsersController from '../../../controllers/AdminUsersController.js';
import {
  authenticateAdminAccess,
  requireAdminPermission,
} from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateBody } from '../../../middlewares/validateRequest.js';
import { CreateAdminSchema } from '../../../schemas/requests/admin-users.request.js';

const router: Router = Router();
const controller = new AdminUsersController();

router.use(authenticateAdminAccess);
router.use(validateCsrf);
// Only SUPER_ADMIN can manage admins
router.use(requireAdminPermission([])); // Empty array means ONLY SUPER_ADMIN

router.get('/', controller.listAdmins);
router.post('/', validateBody(CreateAdminSchema), controller.createAdmin);
router.patch('/:adminId/role', controller.updateRole);
router.patch('/:adminId/status', controller.updateStatus);
router.post('/:adminId/force-logout', controller.forceLogout);

export default router;
