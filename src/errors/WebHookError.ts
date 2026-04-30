// errors/webhook.errors.ts
import { WebhookErrorCode } from 'src/errors/appErrorDetails/WebhookErrorCode.js';
import AppError from './AppError.js';
import { WebhookContext } from 'src/services/financial/PaymentService.js';

const NON_RETRYABLE_CODES = new Set<WebhookErrorCode>([
  'MISSING_MERCHANT_ORDER_ID',
  'INVALID_ORDER_ID_FORMAT',
  'INVALID_PAYLOAD',
  'INVALID_SPECIAL_REFERENCE',
  'ORDER_REFERENCE_MISMATCH',
  'ORDER_NOT_FOUND',
  'USER_ORDER_MISMATCH',
  'AMOUNT_MISMATCH',
  'DUPLICATE_WEBHOOK',
  'DUPLICATE_PAYMENT',
  'UNALLOCATED_FUNDS',
  'MISSING_USER_ID'
]);

const RETRYABLE_CODES = new Set<WebhookErrorCode>([
  'NO_FEE_RULE',
]);

// ── Base webhook error ──────────────────────────────────────
export class WebhookProcessingError extends AppError {
  constructor(
    public readonly code: WebhookErrorCode,
    public readonly ctx: Partial<WebhookContext>,
    message?: string,
  ) {
    super(message ?? code, 422);
    this.name = 'WebhookProcessingError';
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** مشكلة مؤقتة — ممكن تتحل بـretry */
  get retryable(): boolean {
    return RETRYABLE_CODES.has(this.code);
  }

  /** مشكلة في الداتا — رد بـ200 عشان Paymob ميعيدش الإرسال */
  get shouldReturn200(): boolean {
    return NON_RETRYABLE_CODES.has(this.code);
  }
}

// ── Validation errors (NON_RETRYABLE) ──────────────────────
export class WebhookValidationError extends WebhookProcessingError {
  constructor(
    code: WebhookErrorCode,
    ctx: Partial<WebhookContext>,
    message?: string,
  ) {
    super(code, ctx, message ?? code);
    this.name = 'WebhookValidationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ── Amount mismatch (NON_RETRYABLE) ────────────────────────
export class AmountMismatchError extends WebhookProcessingError {
  constructor(
    public readonly orderId: string,
    public readonly expected: bigint,
    public readonly actual: bigint,
    ctx: Partial<WebhookContext>,
  ) {
    super(
      'AMOUNT_MISMATCH',
      ctx,
      `Order ${orderId}: expected ${expected} cents, got ${actual} cents`,
    );
    this.name = 'AmountMismatchError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}