import { z } from '../../libs/zod.js';
import { UUIDSchema, buildFilterSchema, createQuerySchema } from '../common.js';
import { ProposalFilterDescriptor } from '../../domain/proposal.entity.js';

export const CreateProposalSchema = z.object({});

export type CreateProposalDTO = z.infer<typeof CreateProposalSchema>;

export const ProposalIdParamsSchema = z.object({
  proposalId: UUIDSchema,
});

export const OrderProposalParamsSchema = z.object({
  orderId: UUIDSchema,
  proposalId: UUIDSchema,
});

export const ProposalFilterSchema = buildFilterSchema(ProposalFilterDescriptor);
export const ProposalQuerySchema = createQuerySchema(ProposalFilterSchema);
export type ProposalQuery = z.infer<typeof ProposalQuerySchema>;
