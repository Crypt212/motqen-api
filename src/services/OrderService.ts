import Service, { tryCatch } from './Service.js';
import IOrderRepository from '../repositories/interfaces/OrderRepository.js';
import ILocationRepository from '../repositories/interfaces/LocationRepository.js';
import { TransactionManager } from '../repositories/prisma/TransactionManager.js';
import OrderRepository from '../repositories/prisma/OrderRepository.js';
import WorkerOccupiedTimeSlotRepository from '../repositories/prisma/WorkerOccupiedTimeSlotRepository.js';
import AppError from '../errors/AppError.js';
import uploadToCloudinary from '../providers/cloudinaryProvider.js';
import { Order, OrderFilter } from '../domain/order.entity.js';
import { PaginationOptions, SortOptions } from '../types/query.js';
import { canTransitionOrderStatus, canTransitionWorkStatus } from '../utils/stateMachine.js';
import { CreateOrderDTO } from '../schemas/requests/order.request.js';
import { OrderStatus, VerificationStatus } from 'src/generated/prisma/enums.js';
import WorkerProfileRepository from 'src/repositories/prisma/WorkerRepository.js';
import SpecializationRepository from 'src/repositories/prisma/SpecializationRepository.js';
import ProposalRepository from '../repositories/prisma/ProposalRepository.js';
import NegotiationRepository from '../repositories/prisma/NegotiationRepository.js';
import IWorkerProfileRepository from 'src/repositories/interfaces/WorkerRepository.js';
import { Role } from 'src/domain/user.entity.js';
import { EscrowService } from './financial/EscrowService.js';
import { IDType } from 'src/repositories/interfaces/Repository.js';

interface OrderServiceDeps {
  orderRepository: IOrderRepository;
  workerProfileRepository: IWorkerProfileRepository;
  locationRepository: ILocationRepository;
  transactionManager: TransactionManager;
}

export default class OrderService extends Service {
  private orderRepository: IOrderRepository;
  private workerProfileRepository: IWorkerProfileRepository;
  private locationRepository: ILocationRepository;
  private transactionManager: TransactionManager;
  private escrowService?: EscrowService;

  constructor(deps: OrderServiceDeps) {
    super();
    this.orderRepository = deps.orderRepository;
    this.workerProfileRepository = deps.workerProfileRepository;
    this.locationRepository = deps.locationRepository;
    this.transactionManager = deps.transactionManager;
  }

  setEscrowService(escrowService: EscrowService) {
    this.escrowService = escrowService;
  }

  async createOrder({
    data: { orderData, clientUserId },
    images,
  }: {
    data: CreateOrderDTO & { clientUserId: string };
    images: Express.Multer.File[];
  }) {
    return tryCatch(async () => {
      const location = await this.locationRepository.find({ filter: { id: orderData.locationId } });
      if (!location) {
        throw new AppError('Location not found', 400);
      }
      if (location.userId !== clientUserId) {
        throw new AppError('Location not owned', 400);
      }
      if (images.length > 3) {
        throw new AppError('Maximum 3 images allowed per order', 400);
      }

      const isGlobal = orderData.orderMode === 'GLOBAL';

      let workerProfileId: IDType | null = null;

      if (!isGlobal) {
        if (!orderData.workerUserId) {
          throw new AppError('Worker user ID is required for direct orders', 400);
        }
        const worker = await this.workerProfileRepository.find({
          workerFilter: { userId: orderData.workerUserId },
        });
        if (!worker) {
          throw new AppError('Worker not found', 400);
        }
        workerProfileId = worker.id;

        if (orderData.workerUserId === clientUserId) {
          throw new AppError('You cannot order yourself', 400);
        }

        if (orderData.isUrgent) {
          orderData.startDate = new Date();
        }

        if (!orderData.startDate) {
          throw new AppError('Start date is required for direct orders', 400);
        }
        const workerVerification = await this.workerProfileRepository.findVerification({
          workerFilter: { userId: orderData.workerUserId },
        });
        if (!workerVerification || workerVerification.status !== VerificationStatus.APPROVED) {
          throw new AppError('Worker is not verified', 400);
        }
      }

      // Upload images
      const uploadPromises = images.map((file) => uploadToCloudinary(file.buffer, 'motqen/orders'));
      const uploadResults = await Promise.all(uploadPromises);
      const imageUrls = uploadResults.map((r) => r.url);

      // Create order with transaction
      return await this.transactionManager.execute(
        {
          orderRepo: OrderRepository,
          specializationsRepo: SpecializationRepository,
          proposalRepo: ProposalRepository,
          negotiationRepo: NegotiationRepository,
        },
        async ({ orderRepo, specializationsRepo, proposalRepo, negotiationRepo }) => {
          const order = await orderRepo.create({
            order: {
              title: orderData.title,
              description: orderData.description,
              clientUserId: clientUserId,
              workerUserId: isGlobal ? null : orderData.workerUserId,
              locationId: orderData.locationId,
              subSpecializationId: orderData.subSpecializationId,
              initialPrice: orderData.initialPrice,
              startDate: orderData.startDate,
              estimatedDurationHours: orderData.estimatedDurationHours,
              isUrgent: orderData.isUrgent,
              orderMode: orderData.orderMode,
            },
            imageUrls,
          });

          const specialization = await specializationsRepo.findBySubSpecializationId({
            subSpecializationId: order.subSpecialization.id,
          });
          await specializationsRepo.increamentOrderCount({
            specializationId: specialization.id,
          });

          if (!isGlobal && orderData.workerUserId) {
            // Create a proposal and an initial negotiation for direct orders
            const proposal = await proposalRepo.create({
              proposal: {
                orderId: order.id,
                workerProfileId,
              },
            });

            await negotiationRepo.create({
              data: {
                orderId: order.id,
                proposalId: proposal.id,
                senderId: clientUserId,
                direction: 'CLIENT_TO_WORKER',
                price: order.initialPrice ?? 0,
                startDate: order.startDate ?? new Date(),
                estimatedDurationHours: order.estimatedDurationHours ?? 1,
              },
            });
          }

          return order;
        }
      );
    });
  }

  async getOrders(params: {
    userId: string;
    role: Role;
    userType: 'WORKER' | 'CLIENT';
    clientUserId?: string;
    workerUserId?: string;
    filter: OrderFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Order>;
  }) {
    return tryCatch(async () => {
      const finalFilter = {
        ...params.filter,

        clientUserId: params.clientUserId,
        workerUserId: params.workerUserId,
      };

      if (params.role === 'USER') {
        if (params.userType === 'WORKER') {
          const subSpecializationsIds = (
            await this.workerProfileRepository.findSpecializationsWithSubSpecializations({
              filter: { userId: params.userId },
            })
          ).reduce(
            (acc, { subSpecializations }) => [...acc, ...subSpecializations.map((s) => s.id)],
            []
          );

          const workingGovernmentIds = (
            await this.workerProfileRepository.findWorkGovernments({
              workerProfileFilter: { userId: params.userId },
            })
          ).governments.map((g) => g.id);

          return await this.orderRepository.findForWorker({
            workerUserId: params.userId,
            workerSubSpecializationIds: subSpecializationsIds,
            workerWorkingGovernmentIds: workingGovernmentIds,
            filter: finalFilter,
            pagination: params.pagination,
            sort: params.sort,
          });
        } else if (params.userType === 'CLIENT') {
          return await this.orderRepository.findForClient({
            clientUserId: params.userId,
            filter: finalFilter,
            pagination: params.pagination,
            sort: params.sort,
          });
        } else {
          throw new AppError('User type not supported', 400);
        }
      } else throw new AppError('User type not supported', 400);
    });
  }

  async getOrderById(params: { orderId: string; userId: string; userType: 'WORKER' | 'CLIENT' }) {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: params.orderId } });
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (params.userType === 'WORKER') {
        const isAssigned = order.workerUserId && order.workerUserId === params.userId;
        if (!isAssigned && order.orderMode !== 'GLOBAL') {
          throw new AppError('Access denied', 403);
        }
      } else if (params.userType === 'CLIENT') {
        const isOwner = order.clientUserId === params.userId;
        if (!isOwner) throw new AppError('Access denied', 403);
      } else throw new AppError('User type not supported', 400);

      return order;
    });
  }

  async cancelOrder(params: { orderId: string; clientUserId?: string }) {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: params.orderId } });
      if (!order) throw new AppError('Order not found', 404);

      if (order.clientUserId !== params.clientUserId) {
        throw new AppError('Access denied', 403);
      }

      if (!canTransitionOrderStatus(order.orderStatus, 'CANCELLED')) {
        throw new AppError('Cannot cancel order in current status', 400);
      }

      await this.transactionManager.execute(
        { orderRepo: OrderRepository, timeSlotRepo: WorkerOccupiedTimeSlotRepository },
        async ({ orderRepo, timeSlotRepo }) => {
          await orderRepo.update({
            filter: { id: params.orderId },
            order: { orderStatus: 'CANCELLED' },
          });
          await timeSlotRepo.deleteByOrderId({ orderId: params.orderId });
        }
      );
    });
  }

  async startWork(params: { orderId: string; workerUserId?: string }) {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: params.orderId } });
      if (!order) throw new AppError('Order not found', 404);

      if (order.workerUserId !== params.workerUserId) throw new AppError('Access denied', 403);

      const workerVerification = await this.workerProfileRepository.findVerification({
        workerFilter: { userId: params.workerUserId },
      });
      if (!workerVerification || workerVerification.status !== VerificationStatus.APPROVED) {
        throw new AppError('Worker is not verified', 400);
      }

      if (order.orderStatus !== 'PAID')
        throw new AppError('Order must be in PAID status to start work', 400);
      if (!canTransitionWorkStatus(order.workStatus, 'STARTED'))
        throw new AppError('Cannot transition work status', 400);

      const today = new Date().toISOString().slice(0, 10);
      const scheduledDay = order.startDate.toISOString().slice(0, 10);
      if (today !== scheduledDay) {
        throw new AppError('Work can only be started on the scheduled date (UTC)', 400);
      }

      return await this.orderRepository.update({
        filter: { id: params.orderId },
        order: { workStatus: 'STARTED', workStartedAt: new Date() },
      });
    });
  }

  async finishWork(params: { orderId: string; workerUserId?: string }) {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: params.orderId } });
      if (!order) throw new AppError('Order not found', 404);

      if (order.workerUserId !== params.workerUserId) throw new AppError('Access denied', 403);

      if (!canTransitionWorkStatus(order.workStatus, 'DONE'))
        throw new AppError('Cannot finish work in current status', 400);
      if (!canTransitionOrderStatus(order.orderStatus, OrderStatus.COMPLETED))
        throw new AppError('Cannot complete order in current status', 400);

      return await this.transactionManager.execute(
        {
          orderRepo: OrderRepository,
          timeSlotRepo: WorkerOccupiedTimeSlotRepository,
          workerProfileRepo: WorkerProfileRepository,
        },
        async ({ orderRepo, timeSlotRepo, workerProfileRepo }, tx) => {
          const workFinishedAt = new Date();
          const updated = await orderRepo.update({
            filter: { id: params.orderId },
            order: {
              orderStatus: OrderStatus.COMPLETED,
              workStatus: 'DONE',
              workFinishedAt,
            },
          });

          await timeSlotRepo.deleteByOrderId({ orderId: params.orderId });

          const workerProfileId = (
            await workerProfileRepo.find({ workerFilter: { userId: order.workerUserId } })
          ).id;

          await workerProfileRepo.increaseCompletedOrders({
            workerProfileId,
          });

          if (this.escrowService) {
            await this.escrowService.onOrderCompleted(params.orderId, workFinishedAt, tx);
          }

          return updated;
        }
      );
    });
  }
  async rateOrder(params: {
    orderId: string;
    clientUserId: string;
    rate: number;
    comment?: string;
  }) {
    const { orderId, clientUserId, rate, comment } = params;
    const order = await this.orderRepository.find({ filter: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404);

    if (order.clientUserId !== clientUserId) throw new AppError('Access denied', 403);

    if (order.orderStatus !== OrderStatus.COMPLETED)
      throw new AppError('Order must be completed to rate', 400);

    if (order.rate !== -1) throw new AppError('Cannot rate order more than once', 400);

    await this.transactionManager.execute(
      { orderRepo: OrderRepository, workerProfileRepo: WorkerProfileRepository },
      async ({ orderRepo, workerProfileRepo }) => {
        await orderRepo.update({
          filter: { id: orderId },
          order: { rate, comment },
        });

        const workerProfileId = (
          await workerProfileRepo.find({ workerFilter: { userId: order.workerUserId } })
        ).id;

        await workerProfileRepo.addRating({
          workerProfileId,
          rate,
        });
      }
    );
  }
}
