import { z } from "zod";

// ── الـfields اللي بنستخدمها فعلاً ──────────────────────────────
// obj.id              → providerEventId (TX1)
// obj.success         → قرار الـpayment (TX1, TX2)
// obj.amount_cents    → amount validation (TX1)
// obj.merchant_order_id → orderId extraction (Phase 0)
// obj.currency        → Payment record (TX2)
// obj.data.txn_response_code / message → PaymentAttempt (TX1)
// obj.source_data     → PaymentAttempt metadata (TX1)
// obj.order.id        → Paymob internal order ref

export const paymobWebhookSchema = z.object({
  type: z.string(),

  obj: z.object({

    id: z
      .union([z.string(), z.number()])
      .transform(String),

    success: z.boolean(),

    amount_cents: z
      .union([z.number(), z.string()])
      .transform((v) => {
        const n = Number(v);
        if (!Number.isInteger(n) || n <= 0)
          throw new Error('amount_cents must be a positive integer');
        return n;
      }),

    currency: z.string().optional().default('EGP'),

    order: z.object({
      id: z
        .union([z.string(), z.number()])
        .transform(String),
      merchant_order_id: z   // ✅ هنا مش في obj مباشرة
        .string()
        .min(1),
    }),

    data: z
      .object({
        txn_response_code: z.string().optional(),
        message: z.string().optional(),
        acq_response_code: z.string().optional(),
      })
      .optional(),

    source_data: z
      .object({
        type: z.string().optional(),
        sub_type: z.string().optional(),
        pan: z.string().optional(),
      })
      .optional(),
    
    metadata: z.object().optional(),
  }),
});

export type PaymobWebhookPayload = z.infer<typeof paymobWebhookSchema>;