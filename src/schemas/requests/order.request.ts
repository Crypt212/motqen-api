import { z } from '../../libs/zod.js';
import { UUIDSchema, createQuerySchema } from '../common.js';
import { OrderFilterSchema } from '../entities/order.js';

export const CreateOrderSchema = z.object({
  orderData: z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1),
    subSpecializationId: UUIDSchema,
    workerUserId: UUIDSchema.optional().nullable(),
    locationId: UUIDSchema,
    initialPrice: z.number().positive({ message: 'initialPrice must be positive' }),
    startDate: z.coerce.date().refine((d) => d > new Date(), { message: 'startDate must be in the future' }),
    estimatedDurationHours: z.number().int().positive({ message: 'estimatedDurationHours must be positive' }),
    isUrgent: z.boolean(),
    orderMode: z.enum(['DIRECT', 'GLOBAL']).default('DIRECT').optional(),
  })
});

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;

export const OrderIdParamsSchema = z.object({
  orderId: UUIDSchema,
});

export const OrderRateSchema = z.object({
  rate: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const OrderQuerySchema = createQuerySchema(OrderFilterSchema);
export type OrderQuery = z.infer<typeof OrderQuerySchema>;

import { EmptySchema } from '../common.js';

export const CreateOrderRequestSchema = CreateOrderSchema;
export type CreateOrderRequestDTO = z.infer<typeof CreateOrderRequestSchema>;
export const CreateOrderQuerySchema = EmptySchema;
export type CreateOrderQueryDTO = z.infer<typeof CreateOrderQuerySchema>;
export const CreateOrderParamsSchema = EmptySchema;
export type CreateOrderParamsDTO = z.infer<typeof CreateOrderParamsSchema>;

export const GetOrdersRequestSchema = EmptySchema;
export type GetOrdersRequestDTO = z.infer<typeof GetOrdersRequestSchema>;
export const GetOrdersQuerySchema = OrderQuerySchema;
export type GetOrdersQueryDTO = z.infer<typeof GetOrdersQuerySchema>;
export const GetOrdersParamsSchema = EmptySchema;
export type GetOrdersParamsDTO = z.infer<typeof GetOrdersParamsSchema>;

export const GetOrderByIdRequestSchema = EmptySchema;
export type GetOrderByIdRequestDTO = z.infer<typeof GetOrderByIdRequestSchema>;
export const GetOrderByIdQuerySchema = EmptySchema;
export type GetOrderByIdQueryDTO = z.infer<typeof GetOrderByIdQuerySchema>;
export const GetOrderByIdParamsSchema = OrderIdParamsSchema;
export type GetOrderByIdParamsDTO = z.infer<typeof GetOrderByIdParamsSchema>;

export const CancelOrderRequestSchema = EmptySchema;
export type CancelOrderRequestDTO = z.infer<typeof CancelOrderRequestSchema>;
export const CancelOrderQuerySchema = EmptySchema;
export type CancelOrderQueryDTO = z.infer<typeof CancelOrderQuerySchema>;
export const CancelOrderParamsSchema = OrderIdParamsSchema;
export type CancelOrderParamsDTO = z.infer<typeof CancelOrderParamsSchema>;

export const GetOrderLocationRequestSchema = EmptySchema;
export type GetOrderLocationRequestDTO = z.infer<typeof GetOrderLocationRequestSchema>;
export const GetOrderLocationQuerySchema = EmptySchema;
export type GetOrderLocationQueryDTO = z.infer<typeof GetOrderLocationQuerySchema>;
export const GetOrderLocationParamsSchema = OrderIdParamsSchema;
export type GetOrderLocationParamsDTO = z.infer<typeof GetOrderLocationParamsSchema>;

export const StartWorkRequestSchema = EmptySchema;
export type StartWorkRequestDTO = z.infer<typeof StartWorkRequestSchema>;
export const StartWorkQuerySchema = EmptySchema;
export type StartWorkQueryDTO = z.infer<typeof StartWorkQuerySchema>;
export const StartWorkParamsSchema = OrderIdParamsSchema;
export type StartWorkParamsDTO = z.infer<typeof StartWorkParamsSchema>;

export const FinishWorkRequestSchema = EmptySchema;
export type FinishWorkRequestDTO = z.infer<typeof FinishWorkRequestSchema>;
export const FinishWorkQuerySchema = EmptySchema;
export type FinishWorkQueryDTO = z.infer<typeof FinishWorkQuerySchema>;
export const FinishWorkParamsSchema = OrderIdParamsSchema;
export type FinishWorkParamsDTO = z.infer<typeof FinishWorkParamsSchema>;

export const RateOrderRequestSchema = OrderRateSchema;
export type RateOrderRequestDTO = z.infer<typeof RateOrderRequestSchema>;
export const RateOrderQuerySchema = EmptySchema;
export type RateOrderQueryDTO = z.infer<typeof RateOrderQuerySchema>;
export const RateOrderParamsSchema = OrderIdParamsSchema;
export type RateOrderParamsDTO = z.infer<typeof RateOrderParamsSchema>;
