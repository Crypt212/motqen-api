import { asyncHandler } from '../../types/asyncHandler.js';
import { WithdrawalService } from '../../services/financial/WithdrawalService.js';
import { IDType } from '../../repositories/interfaces/Repository.js';
import SuccessResponse from '../../responses/successResponse.js';
import { serializeBigints } from '../../utils/serializeBigints.js';

export class WithdrawalAdminController {
  constructor(private readonly withdrawalService: WithdrawalService) {}
  /**
   * Start processing a withdrawal (PENDING → IN_PROGRESS).
   * Replaces the old approveRequest.
   */
  public startProcessing = asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const adminId = req.userState?.userId as IDType;
    
    const execution = await this.withdrawalService.startProcessing(id, adminId);
    
    new SuccessResponse("Processing started", execution).send(res);
  });

  
  public rejectRequest = asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { notes } = req.body;
    const adminId = req.userState?.userId as IDType;
    
    await this.withdrawalService.rejectRequest(id, adminId, notes);
    
    new SuccessResponse("Request rejected successfully").send(res);
  });

  /**
   * Complete payout (requires proof of payment URL + external ref ID).
   * Only allowed when request is IN_PROGRESS.
   */
  public completePayout = asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { external_reference_id, proof_of_payment_url } = req.body;
    const adminId = req.userState?.userId as IDType;

    await this.withdrawalService.completePayout(
      id, 
      proof_of_payment_url, 
      external_reference_id, 
      adminId
    );
    
    new SuccessResponse("Payout completed successfully").send(res);
  });

  public failPayout = asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { reason } = req.body;
    const adminId = req.userState?.userId as IDType;
    
    await this.withdrawalService.failPayout(id, reason, adminId);
    
    new SuccessResponse("Payout marked as failed").send(res);
  });

  public listDebts = asyncHandler(async (req, res) => {
    const { limit, offset } = req.query;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 20;
    const parsedOffset = offset ? parseInt(offset as string, 10) : 0;

    const debts = await this.withdrawalService.listWorkerDebts(parsedLimit, parsedOffset);

    new SuccessResponse("Debts fetched successfully", serializeBigints(debts)).send(res);
  });

  public settleDebt = asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const adminId = req.userState?.userId as IDType;
    /*
     مجرد فكره قد تحذف
     دي لحالة ان حصل شكوي و خصمنا الفلوس منوا بالسالب بعد ما بعتها ف الوركر رجع الفلوس للكلاينت
     ساعتها الادمن لو وجد دليل يرجع المبلغ اللي رده 
     حاليا بيشيل كلوا 
     لو اتوافق ع الفكره نفسها هنغير ويبقي في اما 
     amount or deptId 
     بحيث نرجعلوا جزء معين
    */
    const result = await this.withdrawalService.settleDebt(id, adminId);

    new SuccessResponse("Debt settled successfully", serializeBigints(result)).send(res);
  });
}