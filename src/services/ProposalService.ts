import Service, { tryCatch } from './Service.js';
import IProposalRepository from '../repositories/interfaces/ProposalRepository.js';
import IOrderRepository from '../repositories/interfaces/OrderRepository.js';
import IWorkerProfileRepository from '../repositories/interfaces/WorkerRepository.js';
import { TransactionManager } from '../repositories/prisma/TransactionManager.js';
import AppError from '../errors/AppError.js';
import { Proposal, ProposalWithWorkerSummary } from '../domain/proposal.entity.js';
import { VerificationStatus } from 'src/generated/prisma/enums.js';
import ProposalRepository from '../repositories/prisma/ProposalRepository.js';
import NegotiationRepository from '../repositories/prisma/NegotiationRepository.js';
import { IDType } from 'src/repositories/interfaces/Repository.js';
import { PaginatedResultMeta } from 'src/types/query.js';
import { notificationService } from '../state.js';

interface ProposalServiceDeps {
  proposalRepository: IProposalRepository;
  orderRepository: IOrderRepository;
  workerProfileRepository: IWorkerProfileRepository;
  transactionManager: TransactionManager;
}

export default class ProposalService extends Service {
  private proposalRepository: IProposalRepository;
  private orderRepository: IOrderRepository;
  private workerProfileRepository: IWorkerProfileRepository;
  private transactionManager: TransactionManager;

  constructor(deps: ProposalServiceDeps) {
    super();
    this.proposalRepository = deps.proposalRepository;
    this.orderRepository = deps.orderRepository;
    this.workerProfileRepository = deps.workerProfileRepository;
    this.transactionManager = deps.transactionManager;
  }

  async submitProposal({
    orderId,
    userId,
  }: {
    orderId: IDType;
    userId: IDType;
  }): Promise<Proposal> {
    return tryCatch(async () => {
      // 1. Get worker profile and verify they are approved
      const workerProfile = await this.workerProfileRepository.find({ workerFilter: { userId: userId } });
      if (!workerProfile) {
        throw new AppError('Worker profile not found', 400);
      }


      const verification = await this.workerProfileRepository.findVerification({
        workerFilter: { id: workerProfile.id },
      });
      if (!verification || verification.status !== VerificationStatus.APPROVED) {
        throw new AppError('Only verified workers can submit proposals', 403);
      }

      // 2. Find the order and check if it is open and global
      const order = await this.orderRepository.find({ filter: { id: orderId } });
      if (!order) {
        throw new AppError('Order not found', 404);
      }
      if (order.orderMode !== 'GLOBAL') {
        throw new AppError('Proposals can only be submitted for global orders', 400);
      }
      if (order.orderStatus !== 'PENDING') {
        throw new AppError('This order is no longer open for proposals', 400);
      }

      // 3. Verify they are not proposing to themselves if they are both client and worker
      if (order.clientUserId === userId) {
        throw new AppError('Cannot propose to yourself', 400);
      }


      // 4. Check for existing duplicate proposal
      const existingProposal = await this.proposalRepository.find({
        filter: { orderId, workerProfileId: workerProfile.id },
      });
      if (existingProposal) {
        return existingProposal;
      }

      // 5. Enforce rate limit (10 proposals per hour per worker)
      const oneHourAgo = new Date(Date.now() - 3600000);
      const recentCount = await this.proposalRepository.countRecentByWorker({
        workerProfileId: workerProfile.id,
        since: oneHourAgo,
      });
      if (recentCount >= 10) {
        throw new AppError('Rate limit exceeded: You can only submit up to 10 proposals per hour', 429);
      }

      // 6. Create proposal and initial negotiation atomically
      const proposal = await this.transactionManager.execute(
        { proposalRepo: ProposalRepository, negotiationRepo: NegotiationRepository },
        async ({ proposalRepo, negotiationRepo }) => {
          const proposal = await proposalRepo.create({
            proposal: {
              orderId,
              workerProfileId: workerProfile.id,
            },
          });

          await negotiationRepo.create({
            data: {
              orderId,
              proposalId: proposal.id,
              senderId: order.clientUserId,
              direction: 'CLIENT_TO_WORKER',
              price: order.initialPrice ?? 0,
              startDate: order.startDate ?? new Date(),
              estimatedDurationHours: order.estimatedDurationHours ?? 1,
            },
          });

          return proposal;
        }
      );

      // Notify the client — NEW_PROPOSAL
      notificationService.notify(order.clientUserId, {
        type: 'NEW_PROPOSAL',
        ctx: { orderId: order.id, orderTitle: order.title },
      }).catch(() => {});

      return proposal;
    });
  }

  async getProposals({
    orderId,
    userId,
    filter,
    pagination,
    sort,
  }: {
    orderId: IDType;
    userId: IDType;
    filter?: any;
    pagination?: any;
    sort?: any;
  }): Promise<PaginatedResultMeta & { proposals: ProposalWithWorkerSummary[] }> {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: orderId } });
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Access control: only the client who posted the order can view all proposals
      if (order.clientUserId !== userId) {
        throw new AppError('Access denied: Only the order owner can view proposals', 403);
      }

      const result = await this.proposalRepository.findManyWithWorkerSummary({
        filter: { ...filter, orderId },
        pagination,
        sort,
      });
      return result;
    });
  }

  async getMyProposal({
    orderId,
    workerProfileId
  }: {
    orderId: IDType;
    workerProfileId: IDType;
  }): Promise<ProposalWithWorkerSummary> {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: orderId } });
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const result = await this.proposalRepository.findManyWithWorkerSummary({
        filter: { workerProfileId, orderId },
      });

      const proposal = result.proposals[0];
      if (!proposal) {
        throw new AppError('You have not proposed for this order', 404);
      }

      return proposal;
    });
  }
  async getProposalById({
    proposalId,
    orderId,
    userId,
  }: {
    proposalId: IDType;
    orderId: IDType;
    userId: IDType;
  }): Promise<ProposalWithWorkerSummary> {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: orderId } });
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const result = await this.proposalRepository.findManyWithWorkerSummary({
        filter: { id: proposalId, orderId },
      });

      const proposal = result.proposals[0];
      if (!proposal) {
        throw new AppError('Proposal not found', 404);
      }

      // Access control: Client who posted order or worker who proposed can view
      const isClient = order.clientUserId === userId;
      const isWorker = proposal.workerProfile.userId === userId;

      if (!isClient && !isWorker) {
        throw new AppError('Access denied', 403);
      }

      return proposal;
    });
  }


}
