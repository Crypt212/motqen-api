import { Router } from 'express';
import { withdrawalAdminController, workerEarningsController } from '../../../state.js';
import { authenticateAccess, isActive } from '../../../middlewares/authMiddleware.js';
import { validateBody, validateParams } from '../../../middlewares/validateRequest.js';
import { authorizeAdmin } from '../../../middlewares/accessMiddleware.js';
import { z } from 'zod';


const router = Router();

const idParamsSchema = z.object({ id: z.string().uuid() });
const rejectBodySchema = z.object({ notes: z.string().optional() });
const completePayoutBodySchema = z.object({
  proof_of_payment_url: z.string().url(),
  external_reference_id: z.string().min(1),
});
const failPayoutBodySchema = z.object({ reason: z.string().optional() });


router.use(authenticateAccess, isActive, authorizeAdmin);


router.get('/withdraw-requests', workerEarningsController.listWithdrawRequests);


router.post('/withdraw-requests/:id/start-processing', validateParams(idParamsSchema), withdrawalAdminController.startProcessing);


router.post('/withdraw-requests/:id/reject', validateParams(idParamsSchema), validateBody(rejectBodySchema), withdrawalAdminController.rejectRequest);


router.post('/payout-executions/:id/complete', validateParams(idParamsSchema), validateBody(completePayoutBodySchema), withdrawalAdminController.completePayout);


router.post('/payout-executions/:id/fail', validateParams(idParamsSchema), validateBody(failPayoutBodySchema), withdrawalAdminController.failPayout);


router.get('/worker-debts', workerEarningsController.listWithdrawRequests);


router.post('/worker-debts/:id/settle', validateParams(idParamsSchema), withdrawalAdminController.settleDebt);

export default router;
