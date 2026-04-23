import { Router } from 'express';
import { orderController } from '../../state.js';
import { validateBody, validateQuery, validateParams } from '../../middlewares/validateRequest.js';
import {
  CreateOrderSchema,
  OrderQuerySchema,
  OrderIdParamsSchema,
  SpecifyRangeSchema,
} from '../../schemas/order.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { files: 3 } });

router.post(
  '/',
  upload.array('images', 3),
  validateBody(CreateOrderSchema),
  orderController.create
);
router.get('/', validateQuery(OrderQuerySchema), orderController.list);
router.get('/:orderId', validateParams(OrderIdParamsSchema), orderController.getById);
router.delete('/:orderId', validateParams(OrderIdParamsSchema), orderController.cancel);
router.post(
  '/:orderId/specify-range',
  validateParams(OrderIdParamsSchema),
  validateBody(SpecifyRangeSchema),
  orderController.specifyRange
);
router.post('/:orderId/start-work', validateParams(OrderIdParamsSchema), orderController.startWork);
router.post(
  '/:orderId/finish-work',
  validateParams(OrderIdParamsSchema),
  orderController.finishWork
);

export default router;
