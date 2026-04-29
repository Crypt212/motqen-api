import { Router } from 'express';
import { negotiationController } from '../../state.js';
import { validateBody, validateParams } from '../../middlewares/validateRequest.js';
import {
  CreateNegotiationSchema,
  NegotiationIdParamsSchema,
  OrderIdForNegotiationParamsSchema,
} from '../../schemas/negotiation.js';

const router = Router();

router.post('/', validateBody(CreateNegotiationSchema), negotiationController.create);
router.get(
  '/order/:orderId',
  validateParams(OrderIdForNegotiationParamsSchema),
  negotiationController.listByOrder
);
router.post(
  '/:negotiationId/accept',
  validateParams(NegotiationIdParamsSchema),
  negotiationController.accept
);
router.post(
  '/:negotiationId/reject',
  validateParams(NegotiationIdParamsSchema),
  negotiationController.reject
);

export default router;
