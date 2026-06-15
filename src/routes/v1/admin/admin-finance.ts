import { Router } from 'express';
import { z } from 'zod';
import { adminFinanceController } from '../../../state.js';
import { authenticateAdminAccess, requireAdminPermission } from '../../../middlewares/adminAuthMiddleware.js';
import { validateCsrf } from '../../../middlewares/csrfMiddleware.js';
import { validateBody, validateParams } from '../../../middlewares/validateRequest.js';

const router: Router = Router();
const idParamsSchema = z.object({ id: z.string().uuid() });
const workerIdParamsSchema = z.object({ workerId: z.string().uuid() });

router.use(authenticateAdminAccess, requireAdminPermission(['FINANCIAL_MONITOR']));
router.use(validateCsrf);

router.get('/payments', adminFinanceController.listPayments);
router.get('/payments/:id', validateParams(idParamsSchema), adminFinanceController.getPayment);

router.get('/escrow', adminFinanceController.listEscrowHolds);
router.post(
  '/escrow/:id/release',
  validateParams(idParamsSchema),
  validateBody(z.object({ note: z.string().optional() })),
  adminFinanceController.releaseEscrow
);

router.get('/ledger', adminFinanceController.listLedgerEntries);

router.get('/worker-balances', adminFinanceController.listWorkerBalances);
router.get(
  '/worker-balances/:workerId',
  validateParams(workerIdParamsSchema),
  adminFinanceController.getWorkerBalanceWithLedger
);

router.get('/withdrawals', adminFinanceController.listWithdrawals);
router.get('/withdrawals/:id', validateParams(idParamsSchema), adminFinanceController.getWithdrawal);
router.post(
  '/withdrawals/:id/approve',
  validateParams(idParamsSchema),
  validateBody(z.object({ note: z.string().optional() })),
  adminFinanceController.approveWithdrawal
);
router.post(
  '/withdrawals/:id/reject',
  validateParams(idParamsSchema),
  validateBody(z.object({ reason: z.string().min(1) })),
  adminFinanceController.rejectWithdrawal
);

router.get('/payouts', adminFinanceController.listPayouts);
router.get('/payouts/:id', validateParams(idParamsSchema), adminFinanceController.getPayout);

router.get('/refunds', adminFinanceController.listRefunds);
router.get('/refunds/:id', validateParams(idParamsSchema), adminFinanceController.getRefund);
router.post(
  '/refunds',
  validateBody(
    z.object({
      paymentId: z.string().uuid(),
      amount: z.number().positive(),
      refundType: z.enum(['full', 'partial']),
      reason: z.string().min(1),
    })
  ),
  adminFinanceController.issueRefund
);

router.get('/worker-debts', adminFinanceController.listWorkerDebts);
router.post(
  '/worker-debts/:id/waive',
  validateParams(idParamsSchema),
  validateBody(z.object({ notes: z.string().min(1) })),
  adminFinanceController.waiveWorkerDebt
);

router.get('/audit-log', adminFinanceController.listAuditLogs);

router.get('/fee-rules', adminFinanceController.listFeeRules);
router.get('/fee-rules/active', adminFinanceController.getActiveFeeRule);
router.post(
  '/fee-rules',
  validateBody(
    z.object({
      platformFeePercent: z.number().min(0).max(100),
      effectiveFrom: z.string(),
      description: z.string().min(1),
    })
  ),
  adminFinanceController.createFeeRule
);

router.get('/summary', adminFinanceController.getSummary);

export default router;
