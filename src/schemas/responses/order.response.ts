import { z } from 'zod';

const BaseSuccessResponse = z.object({
  status: z.literal('success'),
  message: z.string(),
});

export const OrderObjectSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  workerProfileId: z.string().uuid(),
  specializationId: z.string().uuid(),
  locationId: z.string().uuid(),
  orderStatus: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED']),
  scheduledDate: z.date().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  rate: z.number().optional().nullable(),
  rateComment: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const OrderListResponseSchema = BaseSuccessResponse.extend({
  data: z.object({
    orders: z.array(OrderObjectSchema),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  }),
});

export const OrderResponseSchema = BaseSuccessResponse.extend({
  data: OrderObjectSchema,
});
