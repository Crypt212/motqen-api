import { Request, Response } from 'express';
import { PaymentService } from '../services/financial/PaymentService.js';
import { IPaymentProvider } from '../providers/interfaces/IPaymentProvider.js';
import { PaymobWebhookPayload, paymobWebhookSchema } from '../schemas/financial/payment.schema.js';
import { webhookEventRepository } from 'src/state.js';
import { randomUUID } from 'crypto';


export class WebhookController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentProvider: IPaymentProvider
  ) { }

  public handlePaymobWebhook = async (req: Request, res: Response): Promise<void> => {
    try {

      let body = req.body as PaymobWebhookPayload;

      let webhookEvent = (await webhookEventRepository.create({
        providerEventId: String(body?.obj?.id || randomUUID()),
        provider: 'PAYMOB',
        eventType: 'TRANSACTION',
        status: 'RECEIVED',
        rawPayload: body,
      }));

      if (webhookEvent.created === false) {
        if (webhookEvent.event.status === 'PROCESSED') {
          res.status(200).send('DUPLICATED');
          return;
        }
        // status = RECEIVED أو FAILED 
        // اتسجل قبل كده بس 
        // processing مكملش
        // كمّل بنفس الـ
        // event.id
      }

      const hmacHeader = req.query.hmac || req.headers['hmac'] || '';
      const rawBody = JSON.stringify(body);
      let event = webhookEvent.event
      event.providerEventId = String(body?.obj?.id || randomUUID());

      if (!this.paymentProvider.verifyWebhookSignature(rawBody, String(hmacHeader))) {
        await webhookEventRepository.update(event.id, {
          status: 'FAILED',
          failureReason: "INVALID_SIGNATURE"
        })
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      const parsed = paymobWebhookSchema.safeParse(req.body);
      if (!parsed.success) {        
        await webhookEventRepository.update(event.id, {
          status: 'FAILED',
          failureReason: "INVALID_SHAPE"
        })
        res.status(200).send('Invalid shape');
        return;
      }
      
      res.status(200).json({ status: 'success' });
      await this.paymentService.processWebhook(req.body,event.id);

    } catch (e) {
      console.error('Error processing webhook:', e);
      // Return 200 even for errors to prevent flooding retries from Paymob
      res.status(200).json({ status: 'error', message: 'Logged for review' });
    }
  };
}


