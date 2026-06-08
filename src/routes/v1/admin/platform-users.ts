import { Router } from 'express';
import AdminPlatformUsersController from '../../../controllers/AdminPlatformUsersController.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../../middlewares/validateRequest.js';
import { CreatePlatformUserSchema, AdminUserIdParamsSchema, AdminUserQuerySchema } from '../../../schemas/requests/admin-platform-users.request.js';

const router: Router = Router();
const controller = new AdminPlatformUsersController();

router.use(authenticateAdminAccess, requireAdminPermission(['USER_MANAGEMENT']));

router.get('/', validateQuery(AdminUserQuerySchema), controller.listUsers);
router.get('/:userId', validateParams(AdminUserIdParamsSchema), controller.getUser);
router.post('/', validateBody(CreatePlatformUserSchema), controller.createUser);
router.post('/:userId/suspend', validateParams(AdminUserIdParamsSchema), controller.updateStatus);
router.post('/:userId/ban', validateParams(AdminUserIdParamsSchema), controller.updateStatus);
router.post('/:userId/reactivate', validateParams(AdminUserIdParamsSchema), controller.updateStatus);
router.post('/:userId/force-logout', validateParams(AdminUserIdParamsSchema), controller.forceLogout);

export default router;
import { Router } from 'express';
import AdminPlatformUsersController from '../../../controllers/AdminPlatformUsersController.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../../middlewares/validateRequest.js';
import {
  CreatePlatformUserSchema,
  UpdateUserStatusSchema,
  AdminUserIdParamsSchema,
  AdminUserExtendedFilterSchema,
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

// Apply middleware to all routes
router.use(authenticateAdminAccess);
router.use(validateCsrf);
router.use(requireAdminPermission(['USER_MANAGEMENT']));

// ============================================
// User Listing and Details
// ============================================

// List users with advanced filtering
router.get('/', validateQuery(AdminUserExtendedFilterSchema), controller.listUsers);

// Create a new user
router.post('/', validateBody(CreatePlatformUserSchema), controller.createUser);
router.get('/:userId', validateParams(AdminUserIdParamsSchema), controller.getUserById);
router.patch('/:userId/status', validateParams(AdminUserIdParamsSchema), validateBody(UpdateUserStatusSchema), controller.updateUserStatus);
router.post('/:userId/force-logout', validateParams(AdminUserIdParamsSchema), controller.forceLogout);

// ============================================
// User Activity
// ============================================

// Get user activity
router.get('/:userId/activity', validateParams(UserActivityParamsSchema), validateQuery(UserActivityQuerySchema), controller.getUserActivity);

// ============================================
// Working Hours Management
// ============================================

// Create working hours
router.post('/:userId/working-hours', validateParams(AdminUserIdParamsSchema), validateBody(CreateWorkingHoursSchema), controller.createWorkingHours);

// Update working hours
router.patch('/:userId/working-hours', validateParams(AdminUserIdParamsSchema), validateBody(UpdateWorkingHoursSchema), controller.updateWorkingHours);

// Delete working hours
router.delete('/:userId/working-hours', validateParams(AdminUserIdParamsSchema), validateBody(CreateWorkingHoursSchema.pick({ day: true })), controller.deleteWorkingHours);

// ============================================
// Occupied Time Slots Management
// ============================================

// Create occupied slot
router.post('/:userId/occupied-slots', validateParams(AdminUserIdParamsSchema), validateBody(CreateOccupiedSlotSchema), controller.createOccupiedSlot);

// Update occupied slot
router.patch('/:userId/occupied-slots/:slotId', validateParams(OccupiedSlotIdParamsSchema), validateBody(UpdateOccupiedSlotSchema), controller.updateOccupiedSlot);

// Delete occupied slot
router.delete('/:userId/occupied-slots/:slotId', validateParams(OccupiedSlotIdParamsSchema), controller.deleteOccupiedSlot);

export default router;
