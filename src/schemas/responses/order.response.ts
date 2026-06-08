import { z } from '../../libs/zod.js';

import { SuccessResponseSchema } from "../responses.js";
import { OrderObjectSchema, PaginationResponseSchema } from '../common.js';

export const OrderListResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ orders: z.array(OrderObjectSchema) })
);
export type OrderListResponseDTO = z.infer<typeof OrderListResponseSchema>;

export const OrderResponseSchema = SuccessResponseSchema(z.object({ order: OrderObjectSchema }),);
export type OrderResponseDTO = z.infer<typeof OrderResponseSchema>;
