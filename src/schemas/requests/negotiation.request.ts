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

import { EmptySchema, createFilterMetadata, createQuerySchema } from '../common.js';

export const NegotiationFilterSchema = createFilterMetadata({});

export const GetNegotiationsRequestSchema = EmptySchema;
export type GetNegotiationsRequestDTO = z.infer<typeof GetNegotiationsRequestSchema>;
export const GetNegotiationsQuerySchema = createQuerySchema(NegotiationFilterSchema);
export type GetNegotiationsQueryDTO = z.infer<typeof GetNegotiationsQuerySchema>;
export const GetNegotiationsParamsSchema = ProposalNegotiationParamsSchema.omit({ negotiationId: true }).extend({ proposalId: UUIDSchema.optional() });
export type GetNegotiationsParamsDTO = z.infer<typeof GetNegotiationsParamsSchema>;

export const CreateNegotiationRequestSchema = CreateNegotiationSchema;
export type CreateNegotiationRequestDTO = z.infer<typeof CreateNegotiationRequestSchema>;
export const CreateNegotiationQuerySchema = EmptySchema;
export type CreateNegotiationQueryDTO = z.infer<typeof CreateNegotiationQuerySchema>;
export const CreateNegotiationParamsSchema = GetNegotiationsParamsSchema;
export type CreateNegotiationParamsDTO = z.infer<typeof CreateNegotiationParamsSchema>;

export const AcceptNegotiationRequestSchema = EmptySchema;
export type AcceptNegotiationRequestDTO = z.infer<typeof AcceptNegotiationRequestSchema>;
export const AcceptNegotiationQuerySchema = EmptySchema;
export type AcceptNegotiationQueryDTO = z.infer<typeof AcceptNegotiationQuerySchema>;
export const AcceptNegotiationParamsSchema = GetNegotiationsParamsSchema;
export type AcceptNegotiationParamsDTO = z.infer<typeof AcceptNegotiationParamsSchema>;

export const RejectNegotiationRequestSchema = EmptySchema;
export type RejectNegotiationRequestDTO = z.infer<typeof RejectNegotiationRequestSchema>;
export const RejectNegotiationQuerySchema = EmptySchema;
export type RejectNegotiationQueryDTO = z.infer<typeof RejectNegotiationQuerySchema>;
export const RejectNegotiationParamsSchema = GetNegotiationsParamsSchema;
export type RejectNegotiationParamsDTO = z.infer<typeof RejectNegotiationParamsSchema>;

export const CancelNegotiationRequestSchema = EmptySchema;
export type CancelNegotiationRequestDTO = z.infer<typeof CancelNegotiationRequestSchema>;
export const CancelNegotiationQuerySchema = EmptySchema;
export type CancelNegotiationQueryDTO = z.infer<typeof CancelNegotiationQuerySchema>;
export const CancelNegotiationParamsSchema = GetNegotiationsParamsSchema;
export type CancelNegotiationParamsDTO = z.infer<typeof CancelNegotiationParamsSchema>;
