import { z } from '../../libs/zod.js';
import { UUIDSchema, createQuerySchema } from '../common.js';
import { ProposalFilterSchema } from '../entities/proposal.js';

export const CreateProposalSchema = z.object({});

export type CreateProposalDTO = z.infer<typeof CreateProposalSchema>;

export const ProposalIdParamsSchema = z.object({
  proposalId: UUIDSchema,
});

export const OrderProposalParamsSchema = z.object({
  orderId: UUIDSchema,
  proposalId: UUIDSchema,
});

export const ProposalQuerySchema = createQuerySchema(ProposalFilterSchema);
export type ProposalQuery = z.infer<typeof ProposalQuerySchema>;

import { EmptySchema } from '../common.js';
import { OrderIdParamsSchema } from './order.request.js';

export const SubmitProposalRequestSchema = CreateProposalSchema;
export type SubmitProposalRequestDTO = z.infer<typeof SubmitProposalRequestSchema>;
export const SubmitProposalQuerySchema = EmptySchema;
export type SubmitProposalQueryDTO = z.infer<typeof SubmitProposalQuerySchema>;
export const SubmitProposalParamsSchema = OrderIdParamsSchema;
export type SubmitProposalParamsDTO = z.infer<typeof SubmitProposalParamsSchema>;

export const ListProposalsRequestSchema = EmptySchema;
export type ListProposalsRequestDTO = z.infer<typeof ListProposalsRequestSchema>;
export const ListProposalsQuerySchema = ProposalQuerySchema;
export type ListProposalsQueryDTO = z.infer<typeof ListProposalsQuerySchema>;
export const ListProposalsParamsSchema = OrderIdParamsSchema;
export type ListProposalsParamsDTO = z.infer<typeof ListProposalsParamsSchema>;

export const GetMyProposalRequestSchema = EmptySchema;
export type GetMyProposalRequestDTO = z.infer<typeof GetMyProposalRequestSchema>;
export const GetMyProposalQuerySchema = EmptySchema;
export type GetMyProposalQueryDTO = z.infer<typeof GetMyProposalQuerySchema>;
export const GetMyProposalParamsSchema = OrderIdParamsSchema;
export type GetMyProposalParamsDTO = z.infer<typeof GetMyProposalParamsSchema>;

export const GetProposalByIdRequestSchema = EmptySchema;
export type GetProposalByIdRequestDTO = z.infer<typeof GetProposalByIdRequestSchema>;
export const GetProposalByIdQuerySchema = EmptySchema;
export type GetProposalByIdQueryDTO = z.infer<typeof GetProposalByIdQuerySchema>;
export const GetProposalByIdParamsSchema = OrderProposalParamsSchema;
export type GetProposalByIdParamsDTO = z.infer<typeof GetProposalByIdParamsSchema>;

export const WithdrawProposalRequestSchema = EmptySchema;
export type WithdrawProposalRequestDTO = z.infer<typeof WithdrawProposalRequestSchema>;
export const WithdrawProposalQuerySchema = EmptySchema;
export type WithdrawProposalQueryDTO = z.infer<typeof WithdrawProposalQuerySchema>;
export const WithdrawProposalParamsSchema = OrderProposalParamsSchema;
export type WithdrawProposalParamsDTO = z.infer<typeof WithdrawProposalParamsSchema>;

export const RejectProposalRequestSchema = EmptySchema;
export type RejectProposalRequestDTO = z.infer<typeof RejectProposalRequestSchema>;
export const RejectProposalQuerySchema = EmptySchema;
export type RejectProposalQueryDTO = z.infer<typeof RejectProposalQuerySchema>;
export const RejectProposalParamsSchema = OrderProposalParamsSchema;
export type RejectProposalParamsDTO = z.infer<typeof RejectProposalParamsSchema>;
