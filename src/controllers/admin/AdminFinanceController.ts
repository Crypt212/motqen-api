import { asyncHandler } from '../../types/asyncHandler.js';
import { AdminFinanceService } from '../../services/admin/AdminFinanceService.js';
import SuccessResponse from '../../responses/successResponse.js';
import AppError from '../../errors/AppError.js';

export class AdminFinanceController {
  constructor(private readonly service: AdminFinanceService) {}

  public listPayments = asyncHandler(async (req, res) => {
    const data = await this.service.listPayments(req.query);
    new SuccessResponse('Payments retrieved successfully', data).send(res);
  });

  public getPayment = asyncHandler(async (req, res) => {
    const data = await this.service.getPayment(req.params.id as string);
    new SuccessResponse('Payment retrieved successfully', data).send(res);
  });

  public listEscrowHolds = asyncHandler(async (req, res) => {
    const data = await this.service.listEscrowHolds(req.query);
    new SuccessResponse('Escrow holds retrieved successfully', data).send(res);
  });

  public releaseEscrow = asyncHandler(async (req, res) => {
    const data = await this.service.releaseEscrow(req.params.id as string, req.body.note);
    new SuccessResponse('Escrow released successfully', data).send(res);
  });

  public listLedgerEntries = asyncHandler(async (req, res) => {
    const data = await this.service.listLedgerEntries(req.query);
    new SuccessResponse('Ledger entries retrieved successfully', data).send(res);
  });

  public listWorkerBalances = asyncHandler(async (req, res) => {
    const data = await this.service.listWorkerBalances(req.query);
    new SuccessResponse('Worker balances retrieved successfully', data).send(res);
  });

  public getWorkerBalanceWithLedger = asyncHandler(async (req, res) => {
    const data = await this.service.getWorkerBalanceWithLedger(req.params.workerId as string);
    new SuccessResponse('Worker balance retrieved successfully', data).send(res);
  });

  public listWithdrawals = asyncHandler(async (req, res) => {
    const data = await this.service.listWithdrawals(req.query);
    new SuccessResponse('Withdrawals retrieved successfully', data).send(res);
  });

  public getWithdrawal = asyncHandler(async (req, res) => {
    const data = await this.service.getWithdrawal(req.params.id as string);
    new SuccessResponse('Withdrawal retrieved successfully', data).send(res);
  });

  public approveWithdrawal = asyncHandler(async (req, res) => {
    const adminId = req.adminState?.adminId;
    if (!adminId) throw new AppError('Unauthorized', 401);
    const data = await this.service.approveWithdrawal(req.params.id as string, adminId, req.body.note);
    new SuccessResponse('Withdrawal approved successfully', data).send(res);
  });

  public rejectWithdrawal = asyncHandler(async (req, res) => {
    const adminId = req.adminState?.adminId;
    if (!adminId) throw new AppError('Unauthorized', 401);
    const data = await this.service.rejectWithdrawal(req.params.id as string, adminId, req.body.reason);
    new SuccessResponse('Withdrawal rejected successfully', data).send(res);
  });

  public listPayouts = asyncHandler(async (req, res) => {
    const data = await this.service.listPayouts(req.query);
    new SuccessResponse('Payouts retrieved successfully', data).send(res);
  });

  public getPayout = asyncHandler(async (req, res) => {
    const data = await this.service.getPayout(req.params.id as string);
    new SuccessResponse('Payout retrieved successfully', data).send(res);
  });

  public listRefunds = asyncHandler(async (req, res) => {
    const data = await this.service.listRefunds(req.query);
    new SuccessResponse('Refunds retrieved successfully', data).send(res);
  });

  public getRefund = asyncHandler(async (req, res) => {
    const data = await this.service.getRefund(req.params.id as string);
    new SuccessResponse('Refund retrieved successfully', data).send(res);
  });

  public issueRefund = asyncHandler(async (req, res) => {
    const adminId = req.adminState?.adminId;
    if (!adminId) throw new AppError('Unauthorized', 401);
    const data = await this.service.issueRefund(req.body, adminId);
    new SuccessResponse('Refund issued successfully', data, 201).send(res);
  });

  public listWorkerDebts = asyncHandler(async (req, res) => {
    const data = await this.service.listWorkerDebts(req.query);
    new SuccessResponse('Worker debts retrieved successfully', data).send(res);
  });

  public waiveWorkerDebt = asyncHandler(async (req, res) => {
    const adminId = req.adminState?.adminId;
    if (!adminId) throw new AppError('Unauthorized', 401);
    const data = await this.service.waiveWorkerDebt(req.params.id as string, req.body.notes, adminId);
    new SuccessResponse('Worker debt waived successfully', data).send(res);
  });

  public listAuditLogs = asyncHandler(async (req, res) => {
    const data = await this.service.listAuditLogs(req.query);
    new SuccessResponse('Audit logs retrieved successfully', data).send(res);
  });

  public listFeeRules = asyncHandler(async (_req, res) => {
    const data = await this.service.listFeeRules();
    new SuccessResponse('Fee rules retrieved successfully', data).send(res);
  });

  public getActiveFeeRule = asyncHandler(async (_req, res) => {
    const data = await this.service.getActiveFeeRule();
    new SuccessResponse('Active fee rule retrieved successfully', data).send(res);
  });

  public createFeeRule = asyncHandler(async (req, res) => {
    const data = await this.service.createFeeRule(req.body);
    new SuccessResponse('Fee rule created successfully', data, 201).send(res);
  });

  public getSummary = asyncHandler(async (_req, res) => {
    const data = await this.service.getSummary();
    new SuccessResponse('Financial summary retrieved successfully', data).send(res);
  });
}
