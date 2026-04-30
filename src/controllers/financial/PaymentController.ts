import { Request, Response } from 'express';
import { PaymentService } from '../../services/financial/PaymentService.js';
import { asyncHandler } from '../../types/asyncHandler.js';
import SuccessResponse from '../../responses/successResponse.js';

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  public getPaymentIframe = asyncHandler(async (req: Request & { userState?: { userId: string } }, res: Response) => {
    const orderId = String(req.params.orderId);
    const userId = req.userState?.userId;
    const iframeUrl = await this.paymentService.createPaymentIframe(orderId, userId);
    new SuccessResponse('Payment iframe generated successfully', { iframeUrl }, 200).send(res);
  });
}
