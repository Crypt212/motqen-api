import { asyncHandler } from 'src/types/asyncHandler.js';
import { EscrowService } from '../../services/financial/EscrowService.js';
import SuccessResponse from 'src/responses/successResponse.js';

export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  public manualRelease = asyncHandler(async (req, res): Promise<void> => {
    const holdId = req.params.id as string;
    if (!holdId) {
      res.status(400).json({ error: 'holdId required' });
      return;
    }

    await this.escrowService.releaseHold(holdId);

    new SuccessResponse(`Hold ${holdId} released`, null, 200).send(res);
  });

  public list = asyncHandler(async (req, res): Promise<void> => {
    const { status, orderId, limit, offset } = req.query;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 20;
    const parsedOffset = offset ? parseInt(offset as string, 10) : 0;

    const holds = await this.escrowService.listHolds(
      {
        status: status as string,
        orderId: orderId as string,
      },
      parsedLimit,
      parsedOffset
    );

    res.status(200).json({ status: 'success', data: holds });
  });
}
