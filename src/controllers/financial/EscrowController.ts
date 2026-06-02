import { asyncHandler } from 'src/types/asyncHandler.js';
import { EscrowService } from '../../services/financial/EscrowService.js';
import SuccessResponse from 'src/responses/successResponse.js';

export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  public manualRelease = asyncHandler(async (req, res): Promise<void> => {
    const holdId = req.params.id as string;

    await this.escrowService.releaseHold(holdId);

    new SuccessResponse(`Hold ${holdId} released`, null, 200).send(res);
  });

  public list = asyncHandler(async (req, res): Promise<void> => {
    const holds = await this.escrowService.listHolds(
      {
        status: req.query.status as string | undefined,
        orderId: req.query.orderId as string | undefined,
      },
      Number(req.query.limit),
      Number(req.query.offset)
    );

    new SuccessResponse('Escrow holds retrieved successfully', holds, 200).send(res);
  });
}
