import { Router } from 'express';
import AdminPlatformUsersController from '../../../controllers/AdminPlatformUsersController.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../../middlewares/validateRequest.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import {
  CreatePlatformUserSchema,
  UpdatePlatformUserSchema,
  AdminUserExtendedFilterSchema,
  AdminUserIdParamsSchema,
  SuspendUserSchema,
  BanUserSchema,
  UserActivityParamsSchema,
  UserActivityQuerySchema,
  CreateWorkingHoursSchema,
  UpdateWorkingHoursSchema,
  OccupiedSlotIdParamsSchema,
  CreateOccupiedSlotSchema,
  UpdateOccupiedSlotSchema,
} from '../../../schemas/requests/admin-platform-users.request.js';

const router: Router = Router();
const controller = new AdminPlatformUsersController();

router.use(authenticateAdminAccess);
router.use(validateCsrf);
router.use(requireAdminPermission(['USER_MANAGEMENT']));

// ============================================
// User Listing and Details
// ============================================

router.get('/', validateQuery(AdminUserExtendedFilterSchema), controller.listUsers);
router.post('/', validateBody(CreatePlatformUserSchema), controller.createUser);
router.get('/:userId', validateParams(AdminUserIdParamsSchema), controller.getUser);
router.patch('/:userId', validateParams(AdminUserIdParamsSchema), validateBody(UpdatePlatformUserSchema), controller.updateUser);

// ============================================
// User Status Management
// ============================================

router.post('/:userId/suspend', validateParams(AdminUserIdParamsSchema), validateBody(SuspendUserSchema), controller.suspendUser);
router.post('/:userId/ban', validateParams(AdminUserIdParamsSchema), validateBody(BanUserSchema), controller.banUser);
router.post('/:userId/reactivate', validateParams(AdminUserIdParamsSchema), controller.reactivateUser);
router.post('/:userId/force-logout', validateParams(AdminUserIdParamsSchema), controller.forceLogout);

// ============================================
// User Activity
// ============================================

router.get('/:userId/activity', validateParams(UserActivityParamsSchema), validateQuery(UserActivityQuerySchema), controller.getUserActivity);

// ============================================
// Working Hours Management
// ============================================

router.post('/:userId/working-hours', validateParams(AdminUserIdParamsSchema), validateBody(CreateWorkingHoursSchema), controller.createWorkingHours);
router.patch('/:userId/working-hours', validateParams(AdminUserIdParamsSchema), validateBody(UpdateWorkingHoursSchema), controller.updateWorkingHours);
router.delete('/:userId/working-hours', validateParams(AdminUserIdParamsSchema), validateBody(CreateWorkingHoursSchema.pick({ day: true })), controller.deleteWorkingHours);

// ============================================
// Occupied Time Slots Management
// ============================================

router.post('/:userId/occupied-slots', validateParams(AdminUserIdParamsSchema), validateBody(CreateOccupiedSlotSchema), controller.createOccupiedSlot);
router.patch('/:userId/occupied-slots/:slotId', validateParams(OccupiedSlotIdParamsSchema), validateBody(UpdateOccupiedSlotSchema), controller.updateOccupiedSlot);
router.delete('/:userId/occupied-slots/:slotId', validateParams(OccupiedSlotIdParamsSchema), controller.deleteOccupiedSlot);

export default router;
