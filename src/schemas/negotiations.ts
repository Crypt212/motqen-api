/**
 * @fileoverview Negotiation Zod schemas for request validation
 * @module schemas/negotiations
 */

import { z } from '../libs/zod.js';

/**
 * Validates :orderId path parameter.
 */
export const OrderIdParamsSchema = z.object({
  orderId: z.string().uuid('orderId must be a valid UUID'),
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
