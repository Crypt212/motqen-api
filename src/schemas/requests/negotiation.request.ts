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

export const ProposalNegotiationParamsSchema = z.object({
  orderId: UUIDSchema,
  proposalId: UUIDSchema,
  negotiationId: UUIDSchema,
});

export const CreateNegotiationSchema = z
  .object({
    price: z
      .number({ message: 'price must be a number' })
      .positive('price must be a positive number')
      .optional(),
    startDate: z.coerce
      .date()
      .refine((d) => d > new Date(), { message: 'startDate must be in the future' })
      .optional()
      .nullable(),
    estimatedDurationHours: z
      .number()
      .int()
      .positive('estimatedDurationHours must be positive')
      .optional(),
    note: z.string().max(500, 'note must be at most 500 characters').optional(),
  })
  .refine(
    (data) =>
      data.price !== undefined ||
      data.startDate !== undefined ||
      data.estimatedDurationHours !== undefined ||
      data.note !== undefined,
    {
      message: 'Must provide at least one field to negotiate (price, startDate, estimatedDurationHours, or note)',
    }
  );

export type CreateNegotiationDTO = z.infer<typeof CreateNegotiationSchema>;
