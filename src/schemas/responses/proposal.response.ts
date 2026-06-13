import { z } from '../../libs/zod.js';
import { SuccessResponseSchema } from '../responses.js';
import { PaginationResponseSchema } from '../common.js';
import { ProposalObjectSchema, ProposalWithWorkerSummarySchema } from '../entities/proposal.js';

export const ProposalResponseSchema = SuccessResponseSchema(
  z.object({ proposal: ProposalWithWorkerSummarySchema })
);
export type ProposalResponseDTO = z.infer<typeof ProposalResponseSchema>;

export const ProposalListResponseSchema = SuccessResponseSchema(
  PaginationResponseSchema.extend({ proposals: z.array(ProposalWithWorkerSummarySchema) })
);
export type ProposalListResponseDTO = z.infer<typeof ProposalListResponseSchema>;

export const ProposalRejectResponseSchema = SuccessResponseSchema(
  z.object({ proposal: ProposalObjectSchema })
);
export type ProposalRejectResponseDTO = z.infer<typeof ProposalRejectResponseSchema>;

export const ProposalWithdrawResponseSchema = SuccessResponseSchema(
  z.object({ proposal: ProposalObjectSchema })
);
export type ProposalWithdrawResponseDTO = z.infer<typeof ProposalWithdrawResponseSchema>;

export const SubmitProposalResponseSchema = ProposalResponseSchema;
export type SubmitProposalResponseDTO = z.infer<typeof SubmitProposalResponseSchema>;

export const ListProposalsResponseSchema = ProposalListResponseSchema;
export type ListProposalsResponseDTO = z.infer<typeof ListProposalsResponseSchema>;

export const GetMyProposalResponseSchema = ProposalResponseSchema;
export type GetMyProposalResponseDTO = z.infer<typeof GetMyProposalResponseSchema>;

export const GetProposalByIdResponseSchema = ProposalResponseSchema;
export type GetProposalByIdResponseDTO = z.infer<typeof GetProposalByIdResponseSchema>;
