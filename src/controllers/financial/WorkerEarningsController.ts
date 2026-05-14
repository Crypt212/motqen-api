import { WithdrawalService } from '../../services/financial/WithdrawalService.js';
import { asyncHandler } from '../../types/asyncHandler.js';
import AppError from '../../errors/AppError.js';
import SuccessResponse from '../../responses/successResponse.js';
import { ListWithdrawRequestsOptions } from '../../schemas/financial/withdrawal.schema.js';
import { WithdrawRequestStatus, PayoutMethodType } from '../../domain/financial/withdrawal.entity.js';
import { serializeBigints } from '../../utils/serializeBigints.js';

export class WorkerEarningsController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  public getMyEarnings = asyncHandler(async (req, res) => {
    const workerProfileId = req.userState?.worker?.id;
    if (!workerProfileId) {
      throw new AppError('Worker profile required', 403);
    }

    const balance = await this.withdrawalService.getBalance(workerProfileId);

    new SuccessResponse('Balance retrieved successfully', serializeBigints(balance), 200).send(res);
  });

  public listWithdrawRequests = asyncHandler(async (req, res) => {
    let workerProfileId: string | undefined;

    if (req?.userState?.role === 'ADMIN') {
      workerProfileId = req.query.workerProfileId as string | undefined;
    } else {
      workerProfileId = req.userState?.worker?.id;
      if (!workerProfileId) throw new AppError('Worker profile required', 403);
    }

    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const cursor = req.query.cursor as string | undefined;
    const sortBy = req.query.sortBy === 'amount' ? 'amount' : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
    const status = req.query.status as WithdrawRequestStatus | undefined;
    const payoutMethodType = req.query.payoutMethodType as PayoutMethodType | undefined;

    const data = await this.withdrawalService.listWithdrawRequests({
      filter: { workerProfileId, status, payoutMethodType },
      cursor,
      limit,
      sort: { sortBy, sortOrder },
    });

    new SuccessResponse('Withdraw requests retrieved successfully', data, 200).send(res);
  });

  public createWithdrawRequest = asyncHandler(async (req, res) => {
    const workerProfileId = req.userState?.worker?.id;
    if (!workerProfileId) {
      throw new AppError('Worker profile required', 403);
    }

    const data = await this.withdrawalService.createWithdrawRequest(
      workerProfileId,
      BigInt(req.body.amount),
      req.body.payout_method_id,
      req.body.idempotency_key
    );

    new SuccessResponse('Withdraw request created successfully', data.request, 201).send(res);
  });

  public listPayoutMethods = asyncHandler(async (req, res) => {
    const workerProfileId = req.userState?.worker?.id;
    if (!workerProfileId) {
      throw new AppError('Worker profile required', 403);
    }

    const data = await this.withdrawalService.listPayoutMethods(workerProfileId);

    new SuccessResponse('Payout methods retrieved successfully', data, 200).send(res);
  });

  public addPayoutMethod = asyncHandler(async (req, res) => {
    const workerProfileId = req.userState?.worker?.id;
    if (!workerProfileId) {
      throw new AppError('Worker profile required', 403);
    }

    const data = await this.withdrawalService.addPayoutMethod(workerProfileId, req.body);

    new SuccessResponse('Payout method added successfully', data, 201).send(res);
  });

  public getWithdrawRequest = asyncHandler(async (req, res) => {
    const workerProfileId = req.userState?.worker?.id;
    if (!workerProfileId) throw new AppError('Worker profile required', 403);

    const data = await this.withdrawalService.getWithdrawRequest(
      req.params.id as string,
      workerProfileId
    );

    new SuccessResponse('Withdraw request retrieved successfully', data, 200).send(res);
  });

  public updatePayoutMethod = asyncHandler(async (req, res) => {
    const workerProfileId = req.userState?.worker?.id;
    if (!workerProfileId) throw new AppError('Worker profile required', 403);

    const data = await this.withdrawalService.updatePayoutMethod(
      req.params.id as string,
      workerProfileId,
      req.body
    );

    new SuccessResponse('Payout method updated successfully', data, 200).send(res);
  });

  public deletePayoutMethod = asyncHandler(async (req, res) => {
    const workerProfileId = req.userState?.worker?.id;
    if (!workerProfileId) throw new AppError('Worker profile required', 403);

    await this.withdrawalService.deletePayoutMethod(req.params.id as string, workerProfileId);

    new SuccessResponse('Payout method deleted successfully', null, 200).send(res);
  });
}
