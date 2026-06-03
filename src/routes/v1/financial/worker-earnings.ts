import { Router } from 'express';
import { workerEarningsController } from '../../../state.js';
import { authenticateAccess, isActive } from '../../../middlewares/authMiddleware.js';
import { authorizeWorker } from '../../../middlewares/accessMiddleware.js';
import { validateBody, validateParams } from '../../../middlewares/validateRequest.js';
import { withdrawRequestSchema, payoutMethodSchema, updatePayoutMethodSchema } from '../../../schemas/financial/withdrawal.schema.js';
import { sensitiveIpRateLimiter } from '../../../middlewares/rateLimitMiddleware.js';
import { z } from 'zod';

const router = Router();
const idParamsSchema = z.object({ id: z.string().uuid() });

router.use(authenticateAccess, isActive, authorizeWorker);


router.get('/', workerEarningsController.getMyEarnings);


router.get('/withdraw-requests', workerEarningsController.listWithdrawRequests);


router.get('/withdraw-requests/:id', validateParams(idParamsSchema), workerEarningsController.getWithdrawRequest);


router.post(
  '/withdraw-requests',
  sensitiveIpRateLimiter,
  validateBody(withdrawRequestSchema),
  workerEarningsController.createWithdrawRequest
);


router.get('/payout-methods', workerEarningsController.listPayoutMethods);


router.post('/payout-methods', validateBody(payoutMethodSchema), workerEarningsController.addPayoutMethod);


router.put(
  '/payout-methods/:id',
  validateParams(idParamsSchema),
  validateBody(updatePayoutMethodSchema),
  workerEarningsController.updatePayoutMethod
);


router.delete(
  '/payout-methods/:id',
  validateParams(idParamsSchema),
  workerEarningsController.deletePayoutMethod
);

export default router;
