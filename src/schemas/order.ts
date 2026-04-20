import { z } from '../libs/zod.js';
import { UUIDSchema, buildFilterSchema, createQuerySchema } from './common.js';
import { OrderFilterDescriptor } from '../domain/order.entity.js';

export const CreateOrderSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1),
  subSpecializationId: UUIDSchema,
  locationId: UUIDSchema,
  startDate: z.coerce
    .date()
    .refine((d) => d > new Date(), { message: 'startDate must be in the future' }),
  isUrgent: z.boolean().default(false),
});

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;

export const SpecifyRangeSchema = z
  .object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((data) => data.endTime > data.startTime, { message: 'endTime must be after startTime' });

export type SpecifyRangeDTO = z.infer<typeof SpecifyRangeSchema>;

export const OrderIdParamsSchema = z.object({
  orderId: UUIDSchema,
});

export const OrderFilterSchema = buildFilterSchema(OrderFilterDescriptor);
export const OrderQuerySchema = createQuerySchema(OrderFilterSchema);
export type OrderQuery = z.infer<typeof OrderQuerySchema>;
