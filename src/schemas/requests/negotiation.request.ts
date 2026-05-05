/**
 * @fileoverview Negotiation Zod schemas for request validation
 * @module schemas/negotiations
 */

import { z } from '../../libs/zod.js';
import { UUIDSchema } from '../common.js';

/**
 * Validates :orderId path parameter.
 */
export const OrderIdParamsSchema = z.object({
  orderId: UUIDSchema,
});

/**
 * Validates POST /orders/:orderId/negotiations body.
 */
export const CreateNegotiationSchema = z.object({
  price: z
    .number({ message: 'price must be a number' })
    .positive('price must be a positive number'),
  note: z.string().max(500, 'note must be at most 500 characters').optional(),
});

export type CreateNegotiationDTO = z.infer<typeof CreateNegotiationSchema>;
