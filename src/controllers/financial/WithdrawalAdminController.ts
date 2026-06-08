import { asyncHandler } from '../../types/asyncHandler.js';
import { WithdrawalService } from '../../services/financial/WithdrawalService.js';
import { IDType } from '../../repositories/interfaces/Repository.js';
import SuccessResponse from '../../responses/successResponse.js';
import { serializeBigints } from '../../utils/serializeBigints.js';
import AppError from '../../errors/AppError.js';
import { WithdrawRequestStatus, PayoutMethodType } from '../../domain/financial/withdrawal.entity.js';
import { adminAuditLogService } from '../../state.js';
import { AdminRole } from '../../domain/admin.entity.js';

export class WithdrawalAdminController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  public listWithdrawRequests = asyncHandler(async (req, res) => {
    const data = await this.withdrawalService.listWithdrawRequests({
      filter: {
        workerProfileId: req.query.workerProfileId as string | undefined,
        status: req.query.status as WithdrawRequestStatus | undefined,
        payoutMethodType: req.query.payoutMethodType as PayoutMethodType | undefined,
        createdFrom: req.query.createdFrom as Date | undefined,
        createdTo: req.query.createdTo as Date | undefined,
        workerName: req.query.workerName as string | undefined,
        phoneNumber: req.query.phoneNumber as string | undefined,
      },
      cursor: req.query.cursor as string | undefined,
      limit: Number(req.query.limit),
      sort: {
        sortBy: req.query.sortBy as 'createdAt' | 'amount',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      },
    });

    new SuccessResponse('Withdraw requests retrieved successfully', serializeBigints(data), 200).send(res);
  });

  public getWithdrawRequest = asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const request = await this.withdrawalService.getWithdrawRequestForAdmin(id);
    new SuccessResponse('Withdraw request details retrieved successfully', serializeBigints(request), 200).send(res);
  });

  public startProcessing = asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const adminId = req.adminState?.adminId as IDType;
    if (!adminId) throw new AppError('Unauthorized', 401);

    const execution = await this.withdrawalService.startProcessing(id, adminId);

    new SuccessResponse('Processing started', execution).send(res);
  });

  public rejectRequest = asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { notes } = req.body;
    const adminId = req.adminState?.adminId as IDType;
    if (!adminId) throw new AppError('Unauthorized', 401);

    await this.withdrawalService.rejectRequest(id, adminId, notes);

    await adminAuditLogService.record({
      actor: {
        adminId,
        username: req.adminState!.username,
        role: req.adminState!.role as AdminRole,
      },
      action: 'WITHDRAWAL_REJECTED',
      category: 'FINANCIAL',
      severity: 'WARNING',
      targetType: 'WITHDRAW_REQUEST',
      targetId: id,
      metadata: { notes },
    });

    new SuccessResponse('Request rejected successfully').send(res);
  });

  public completePayout = asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { externalReferenceId, notes } = req.body;
    const adminId = req.adminState?.adminId as IDType;
    if (!adminId) throw new AppError('Unauthorized', 401);

    const file = req.file;
    if (!file) {
      throw new AppError('A proof of payment image is required', 400);
    }

    await this.withdrawalService.completePayout(
      id,
      file.buffer, // we'll update service to accept a buffer instead of URL
      externalReferenceId,
      notes,
      adminId
    );

    await adminAuditLogService.record({
      actor: {
        adminId,
        username: req.adminState!.username,
        role: req.adminState!.role as AdminRole,
      },
      action: 'PAYOUT_COMPLETED',
      category: 'FINANCIAL',
      severity: 'INFO',
      targetType: 'PAYOUT_EXECUTION',
      targetId: id,
      metadata: { externalReferenceId, notes },
    });

    new SuccessResponse('Payout completed successfully').send(res);
  });

  public failPayout = asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { reason } = req.body;
    const adminId = req.adminState?.adminId as IDType;
    if (!adminId) throw new AppError('Unauthorized', 401);

    await this.withdrawalService.failPayout(id, reason, adminId);

    new SuccessResponse('Payout marked as failed').send(res);
  });

  public getPayoutExecutionProof = asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const proof = await this.withdrawalService.getPayoutExecutionProof(id);
    new SuccessResponse('Payout execution proof retrieved successfully', proof).send(res);
  });

  public listDebts = asyncHandler(async (req, res) => {
    const debts = await this.withdrawalService.listWorkerDebts(
      Number(req.query.limit),
      Number(req.query.offset)
    );

    new SuccessResponse('Debts fetched successfully', serializeBigints(debts)).send(res);
  });

  public settleDebt = asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const adminId = req.adminState?.adminId as IDType;
    if (!adminId) throw new AppError('Unauthorized', 401);

    const result = await this.withdrawalService.settleDebt(id, adminId);

    new SuccessResponse('Debt settled successfully', serializeBigints(result)).send(res);
  });
}
