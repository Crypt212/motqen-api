import Service, { tryCatch } from './Service.js';
import IProposalRepository from '../repositories/interfaces/ProposalRepository.js';
import IOrderRepository from '../repositories/interfaces/OrderRepository.js';
import IWorkerProfileRepository from '../repositories/interfaces/WorkerRepository.js';
import { TransactionManager } from '../repositories/prisma/TransactionManager.js';
import AppError from '../errors/AppError.js';
import { Proposal, ProposalWithWorkerSummary, ProposalStatus } from '../domain/proposal.entity.js';
import { VerificationStatus, OrderStatus } from 'src/generated/prisma/enums.js';
import ProposalRepository from '../repositories/prisma/ProposalRepository.js';
import OrderRepository from '../repositories/prisma/OrderRepository.js';
import NegotiationRepository from '../repositories/prisma/NegotiationRepository.js';
import { IDType } from '../repositories/interfaces/Repository.js';

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
    workerUserId,
    price,
    note,
  }: {
    orderId: string;
    workerUserId: string;
    price: number;
    note?: string | null;
  }): Promise<Proposal> {
    return tryCatch(async () => {
      // 1. Get worker profile and verify they are approved
      const workerProfile = await this.workerProfileRepository.find({ workerFilter: { userId: workerUserId } });
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
      if (order.orderStatus !== 'OPEN') {
        throw new AppError('This order is no longer open for proposals', 400);
      }

      // 3. Check for existing duplicate proposal
      const existingProposal = await this.proposalRepository.find({
        filter: { orderId, workerProfileId: workerProfile.id },
      });
      if (existingProposal) {
        throw new AppError('You have already submitted a proposal for this order', 400);
      }

      // 4. Enforce rate limit (10 proposals per hour per worker)
      const oneHourAgo = new Date(Date.now() - 3600000);
      const recentCount = await this.proposalRepository.countRecentByWorker({
        workerProfileId: workerProfile.id,
        since: oneHourAgo,
      });
      if (recentCount >= 10) {
        throw new AppError('Rate limit exceeded: You can only submit up to 10 proposals per hour', 429);
      }

      // 5. Create proposal
      return await this.proposalRepository.create({
        proposal: {
          orderId,
          workerProfileId: workerProfile.id,
          initialPrice: price,
          note,
        },
      });
    });
  }

  async getProposals({
    orderId,
    userId,
  }: {
    orderId: string;
    userId: string;
  }): Promise<ProposalWithWorkerSummary[]> {
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
        filter: { orderId },
      });
      return result.proposals;
    });
  }

  async getProposalById({
    proposalId,
    userId,
  }: {
    proposalId: string;
    userId: string;
  }): Promise<ProposalWithWorkerSummary> {
    return tryCatch(async () => {
      const result = await this.proposalRepository.findManyWithWorkerSummary({
        filter: { id: proposalId },
      });
      const proposal = result.proposals[0];
      if (!proposal) {
        throw new AppError('Proposal not found', 404);
      }

      const order = await this.orderRepository.find({ filter: { id: proposal.orderId } });
      if (!order) {
        throw new AppError('Order associated with this proposal not found', 404);
      }

      // Access control: Client who posted order OR Worker who submitted proposal
      const isClient = order.clientUserId === userId;
      const isWorker = proposal.workerProfile.userId === userId;

      if (!isClient && !isWorker) {
        throw new AppError('Access denied', 403);
      }

      return proposal;
    });
  }

  async acceptProposal({
    orderId,
    proposalId,
    clientUserId,
  }: {
    orderId: string;
    proposalId: string;
    clientUserId: string;
  }): Promise<Proposal> {
    return tryCatch(async () => {
      // Execute atomically using Serializable transaction
      return await this.transactionManager.execute(
        {
          proposalRepo: ProposalRepository,
          orderRepo: OrderRepository,
          negotiationRepo: NegotiationRepository,
        },
        async ({ proposalRepo, orderRepo, negotiationRepo }) => {
          // 1. Fetch proposal
          const proposal = await proposalRepo.find({ filter: { id: proposalId } });
          if (!proposal) {
            throw new AppError('Proposal not found', 404);
          }
          if (proposal.orderId !== orderId) {
            throw new AppError('Proposal does not belong to this order', 400);
          }
          if (proposal.status !== 'PENDING' && proposal.status !== 'NEGOTIATING') {
            throw new AppError('Only pending or negotiating proposals can be accepted', 400);
          }

          // 2. Fetch order and check ownership + status
          const order = await orderRepo.find({ filter: { id: orderId } });
          if (!order) {
            throw new AppError('Order not found', 404);
          }
          if (order.clientUserId !== clientUserId) {
            throw new AppError('Access denied: Only order owner can accept proposals', 403);
          }
          if (order.orderStatus !== 'OPEN') {
            throw new AppError('Only open orders can accept proposals', 400);
          }

          // 3. Fetch worker profile and verify they are approved
          const workerProfile = await this.workerProfileRepository.find({ workerFilter: { id: proposal.workerProfileId } });
          if (!workerProfile) {
            throw new AppError('Worker profile not found', 400);
          }
          const verification = await this.workerProfileRepository.findVerification({
            workerFilter: { id: workerProfile.id },
          });
          if (!verification || verification.status !== VerificationStatus.APPROVED) {
            throw new AppError('Worker is no longer verified and approved', 400);
          }

          // 4. Determine final price
          const latestNegotiation = await negotiationRepo.findLatestByProposalId({ proposalId });
          const finalPrice = latestNegotiation ? latestNegotiation.price : proposal.initialPrice;

          // 5. Update accepted proposal status
          const updatedProposal = await proposalRepo.updateStatus({
            filter: { id: proposalId },
            status: 'ACCEPTED',
          });

          // 6. Dismiss all other proposals
          await proposalRepo.bulkDismiss({ filter: { orderId, status: 'PENDING' } });
          await proposalRepo.bulkDismiss({ filter: { orderId, status: 'NEGOTIATING' } });

          // 7. Update order assignment and transition status to WORKER_SELECTED
          await orderRepo.update({
            filter: { id: orderId },
            order: {
              workerUserId: workerProfile.userId,
              orderStatus: 'WORKER_SELECTED',
              finalPrice,
            },
          });

          return updatedProposal;
        },
        { isolationLevel: 'Serializable' }
      );
    });
  }
}
