import { z } from 'zod';
import { PaginationResponseSchema } from '../common.js';
import { NegotiationViewSchema as NegotiationObjectSchema } from '../entities/negotiations.js';
import { SuccessResponseSchema } from "../responses.js";

export const NegotiationListResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ negotiations: z.array(NegotiationObjectSchema) })
);
export type NegotiationListResponseDTO = z.infer<typeof NegotiationListResponseSchema>;

export const NegotiationResponseSchema = SuccessResponseSchema(
  z.object({ negotiation: NegotiationObjectSchema })
);
export type NegotiationResponseDTO = z.infer<typeof NegotiationResponseSchema>;

import { OrderResponseSchema } from './order.response.js';

export const GetNegotiationsResponseSchema = NegotiationListResponseSchema;
export type GetNegotiationsResponseDTO = z.infer<typeof GetNegotiationsResponseSchema>;
export const CreateNegotiationResponseSchema = NegotiationResponseSchema;
export type CreateNegotiationResponseDTO = z.infer<typeof CreateNegotiationResponseSchema>;
export const AcceptNegotiationResponseSchema = OrderResponseSchema;
export type AcceptNegotiationResponseDTO = z.infer<typeof AcceptNegotiationResponseSchema>;
export const RejectNegotiationResponseSchema = NegotiationResponseSchema;
export type RejectNegotiationResponseDTO = z.infer<typeof RejectNegotiationResponseSchema>;
export const CancelNegotiationResponseSchema = NegotiationResponseSchema;
export type CancelNegotiationResponseDTO = z.infer<typeof CancelNegotiationResponseSchema>;
