import {
  Proposal,
  ProposalWithWorkerSummary,
  ProposalCreateInput,
  ProposalFilter,
  ProposalStatus,
} from '../../domain/proposal.entity.js';
import { PaginatedResultMeta, PaginationOptions, SortOptions } from '../../types/query.js';
import { IDType } from './Repository.js';

export default interface IProposalRepository {
  find({ filter }: { filter: ProposalFilter }): Promise<Proposal | null>;
  findMany({
    filter,
    pagination,
    sort,
  }: {
    filter: ProposalFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Proposal>;
  }): Promise<PaginatedResultMeta & { proposals: Proposal[] }>;
  findManyWithWorkerSummary({
    filter,
    pagination,
    sort,
  }: {
    filter: ProposalFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Proposal>;
  }): Promise<PaginatedResultMeta & { proposals: ProposalWithWorkerSummary[] }>;
  create({ proposal }: { proposal: ProposalCreateInput }): Promise<Proposal>;
  updateStatus({
    filter,
    status,
  }: {
    filter: ProposalFilter;
    status: ProposalStatus;
  }): Promise<Proposal>;
  bulkDismiss({ filter }: { filter: ProposalFilter }): Promise<void>;
  countRecentByWorker({
    workerProfileId,
    since,
  }: {
    workerProfileId: IDType;
    since: Date;
  }): Promise<number>;
}
