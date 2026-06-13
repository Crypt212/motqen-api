import { z } from '../../libs/zod.js';

import { SuccessResponseSchema } from "../responses.js";
import { PaginationResponseSchema } from '../common.js';
import { OrderObjectViewSchema as OrderObjectSchema } from '../entities/order.js';

export const OrderListResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ orders: z.array(OrderObjectSchema) })
);
export type OrderListResponseDTO = z.infer<typeof OrderListResponseSchema>;

export const OrderResponseSchema = SuccessResponseSchema(z.object({ order: OrderObjectSchema }),);
export type OrderResponseDTO = z.infer<typeof OrderResponseSchema>;

import { MessageOnlyResponseSchema } from '../responses.js';
import { LocationResponseSchema } from './location.response.js';

export const CreateOrderResponseSchema = OrderResponseSchema;
export type CreateOrderResponseDTO = z.infer<typeof CreateOrderResponseSchema>;

export const GetOrdersResponseSchema = OrderListResponseSchema;
export type GetOrdersResponseDTO = z.infer<typeof GetOrdersResponseSchema>;

export const GetOrderByIdResponseSchema = OrderResponseSchema;
export type GetOrderByIdResponseDTO = z.infer<typeof GetOrderByIdResponseSchema>;

export const CancelOrderResponseSchema = MessageOnlyResponseSchema;
export type CancelOrderResponseDTO = z.infer<typeof CancelOrderResponseSchema>;

export const GetOrderLocationResponseSchema = LocationResponseSchema;
export type GetOrderLocationResponseDTO = z.infer<typeof GetOrderLocationResponseSchema>;

export const StartWorkResponseSchema = OrderResponseSchema;
export type StartWorkResponseDTO = z.infer<typeof StartWorkResponseSchema>;

export const FinishWorkResponseSchema = OrderResponseSchema;
export type FinishWorkResponseDTO = z.infer<typeof FinishWorkResponseSchema>;

export const RateOrderResponseSchema = MessageOnlyResponseSchema;
export type RateOrderResponseDTO = z.infer<typeof RateOrderResponseSchema>;
