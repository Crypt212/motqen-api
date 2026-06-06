import { Router } from 'express';
import AdminOrdersController from '../../../controllers/AdminOrdersController.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../../../middlewares/validateRequest.js';
import { OrderQuerySchema, OrderIdParamsSchema } from '../../../schemas/requests/order.request.js';

const router: Router = Router();
const controller = new AdminOrdersController();

router.use(authenticateAdminAccess);
router.use(validateCsrf);
router.use(requireAdminPermission(['USER_MANAGEMENT', 'FINANCIAL_MONITOR', 'ISSUES_MANAGEMENT']));

router.get('/', validateQuery(OrderQuerySchema), controller.listOrders);
router.get('/:orderId', validateParams(OrderIdParamsSchema), controller.getOrderById);

export default router;
