import { z } from 'zod';
import { NegotiationObjectSchema, PaginationResponseSchema } from '../common.js';
import { SuccessResponseSchema } from "../responses.js";

export const NegotiationListResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ negotiations: z.array(NegotiationObjectSchema) })
);
export type NegotiationListResponseDTO = z.infer<typeof NegotiationListResponseSchema>;

export const NegotiationResponseSchema = SuccessResponseSchema(
  z.object({ negotiation: NegotiationObjectSchema })
);
export type NegotiationResponseDTO = z.infer<typeof NegotiationResponseSchema>;
