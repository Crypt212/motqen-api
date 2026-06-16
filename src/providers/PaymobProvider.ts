import crypto from 'crypto';
import environment from '../configs/environment.js';
import { IPaymentProvider } from './interfaces/IPaymentProvider.js';
import { IDType } from 'src/repositories/interfaces/Repository.js';
import { createAxiosInstance } from './axios.js';
import { PaymobIntentionResponse } from './interfaces/IpaymobResponses.js';
export class PaymobProvider implements IPaymentProvider {
  private cachedAuthToken: string | null = null;
  private authTokenExpiresAt: number = 0;
  private api = createAxiosInstance('https://accept.paymob.com');
  private integrationIds = environment.paymob.integrationIds;

  private apiKey = environment.paymob.apiKey;
  private publicKey = environment.paymob.publicKey;
  private secretKey = environment.paymob.secretKey;
  private async setAuth(): Promise<string> {
    const apiKey = environment.paymob.apiKey;

    const response = await this.api.post('/api/auth/tokens', {
      api_key: apiKey,
    });

    this.cachedAuthToken = response.data.token;
    this.authTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    return this.cachedAuthToken;
  }

  verifyWebhookSignature(payload: string, hmacHeader: string): boolean {
    const secret = environment.paymob.hmacSecret;
    if (!secret) {
      console.warn('PAYMOB_HMAC_SECRET is not configured');
      return false;
    }
    try {
      const parsed = JSON.parse(payload);
      if (!parsed.obj) return false;

      if (!/^[a-fA-F0-9]+$/.test(hmacHeader)) return false;

      const obj = parsed.obj;
      const safe = (val: String | undefined | null): string =>
        val === null || val === undefined ? '' : String(val);

      // Build concatenated string based on Paymob spec
      const concatenatedFields = [
        safe(obj.amount_cents),
        safe(obj.created_at),
        safe(obj.currency),
        safe(obj.error_occured),
        safe(obj.has_parent_transaction),
        safe(obj.id),
        safe(obj.integration_id),
        safe(obj.is_3d_secure),
        safe(obj.is_auth),
        safe(obj.is_capture),
        safe(obj.is_refunded),
        safe(obj.is_standalone_payment),
        safe(obj.is_voided),
        safe(typeof obj.order === 'object' ? obj.order?.id : obj.order),
        safe(obj.owner),
        safe(obj.pending),
        safe(obj.source_data?.pan),
        safe(obj.source_data?.sub_type),
        safe(obj.source_data?.type),
        safe(obj.success),
      ].join('');

      const computedHmac = crypto
        .createHmac('sha512', secret)
        .update(concatenatedFields)
        .digest('hex');

      const computedBuf = Buffer.from(computedHmac, 'hex');
      const receivedBuf = Buffer.from(hmacHeader, 'hex');

      if (computedBuf.length !== receivedBuf.length) return false;

      return crypto.timingSafeEqual(computedBuf, receivedBuf);
    } catch (err) {
      console.error('Error verifying payload HMAC:', err);
      return false;
    }
  }
  async initiateRefund(
    transactionId: string,
    amountInCents: number
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      let authToken = this.cachedAuthToken;
      if (!authToken || Date.now() > this.authTokenExpiresAt) {
        authToken = await this.setAuth();
      }

      const response = await this.api.post('/api/acceptance/void_refund/refund', {
        auth_token: authToken,
        transaction_id: transactionId,
        amount_cents: amountInCents,
      });

      return { success: true, refundId: String(response.data.id) };
    } catch (err: any) {
      console.error('Paymob refund error:', err.response?.data || err.message);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }

  async createPaymentIntention(
    orderInfo: {
      amountCents: number;
      orderId: string;
      specialReference?: string;
      description?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
    },
    billingData: Record<string, any>,
    userId: IDType
  ): Promise<string> {
    if (!this.apiKey || !this.integrationIds || !this.publicKey) {
      throw new Error('Paymob API Key, Integration ID, or Iframe ID is missing in configuration');
    }

    try {
      //   let authToken = this.cachedAuthToken;
      //   if (!authToken || Date.now() > this.authTokenExpiresAt) {
      //     authToken = await this.setAuth();
      //   }
      let order = await this.api.post<PaymobIntentionResponse>(
        '/v1/intention/',
        {
          amount: orderInfo.amountCents, // placeholder for test only i will delete it
          currency: 'EGP',
          payment_methods: [...this.integrationIds],
          items: [
            {
              name: orderInfo.description || 'طلب خدمه',
              amount: orderInfo.amountCents,
              description: orderInfo.description || 'طلب خدمه',
              quantity: 1,
            },
          ],
          billing_data: {
            apartment: 'dumy',
            first_name: orderInfo.firstName || 'ala',
            last_name: orderInfo.lastName || 'zain',
            street: 'dumy',
            building: 'dumy',
            phone_number: orderInfo.phone || '+201112385149',
            city: 'dumy',
            country: 'EG',
            email: orderInfo.email || 'test@example.com',
            floor: 'dumy',
            state: 'dumy',
          },
          special_reference: orderInfo.specialReference || orderInfo.orderId || 'ahshs',
          expiration: 1800,
          notification_url: `${environment.api.baseUrl}/api/v1/webhooks/paymob`,
          redirection_url: `MOTQEN://payment`,
        },
        {
          headers: {
            Authorization: `Token ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const paymentToken = order.data.client_secret;
      return `https://accept.paymob.com/unifiedcheckout/?publicKey=${this.publicKey}&clientSecret=${paymentToken}`;
    } catch (err: any) {
      throw new Error(
        `Failed to create Paymob payment iframe: ${JSON.stringify(err.response.data)}`
      );
    }
  }
}
