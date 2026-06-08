import { z } from '../../libs/zod.js';
import { SuccessResponseSchema } from '../responses.js';
import { ProposalObjectSchema, ProposalWithWorkerSummarySchema, PaginationResponseSchema } from '../common.js';

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
