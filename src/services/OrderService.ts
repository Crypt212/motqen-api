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
import { hasOverlap } from '../utils/overlapCheck.js';
import { CreateOrderDTO } from '../schemas/requests/order.request.js';
import { OrderStatus, VerificationStatus } from 'src/generated/prisma/enums.js';
import WorkerProfileRepository from 'src/repositories/prisma/WorkerRepository.js';
import SpecializationRepository from 'src/repositories/prisma/SpecializationRepository.js';
import IWorkerProfileRepository from 'src/repositories/interfaces/WorkerRepository.js';
import { Role } from 'src/domain/user.entity.js';

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

  constructor(deps: OrderServiceDeps) {
    super();
    this.orderRepository = deps.orderRepository;
    this.workerProfileRepository = deps.workerProfileRepository;
    this.locationRepository = deps.locationRepository;
    this.transactionManager = deps.transactionManager;
  }

  async createOrder({
    data,
    images,
  }: {
    data: CreateOrderDTO & { clientUserId: string };
    images: Express.Multer.File[];
  }) {
    return tryCatch(async () => {
      const location = await this.locationRepository.find({ filter: { id: data.locationId } });
      if (!location) {
        throw new AppError('Location not found', 400);
      }
      if (location.userId !== data.clientUserId) {
        throw new AppError('Location not owned', 400);
      }
      if (images.length > 3) {
        throw new AppError('Maximum 3 images allowed per order', 400);
      }

      const isGlobal = data.orderMode === 'GLOBAL';

      if (!isGlobal) {
        if (!data.workerUserId) {
          throw new AppError('Worker user ID is required for direct orders', 400);
        }
        if (!data.startDate) {
          throw new AppError('Start date is required for direct orders', 400);
        }
        const workerVerification = await this.workerProfileRepository.findVerification({ workerFilter: { userId: data.workerUserId } });
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
        { orderRepo: OrderRepository, specializationsRepo: SpecializationRepository },
        async ({ orderRepo, specializationsRepo }) => {
          const order = await orderRepo.create({
            order: {
              title: data.title,
              description: data.description,
              clientUserId: data.clientUserId,
              workerUserId: isGlobal ? null : data.workerUserId,
              locationId: data.locationId,
              subSpecializationId: data.subSpecializationId,
              startDate: isGlobal ? null : data.startDate,
              isUrgent: data.isUrgent,
              orderMode: data.orderMode as any,
            },
            imageUrls,
          });

          const specialization = await specializationsRepo.findBySubSpecializationId({ subSpecializationId: order.subSpecialization.id });
          await specializationsRepo.increamentOrderCount({
            specializationId: specialization.id,
          });

          return order;
        }
      );
    });
  }

  async getOrders(params: {
    userId: string;
    role: Role;
    userType: "WORKER" | "CLIENT";
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

      if (params.role === "USER") {
        if (params.userType === "WORKER") {
          finalFilter.workerUserId = params.userId;
        }
        if (params.userType === "CLIENT") {
          finalFilter.clientUserId = params.userId;
        }
      }

      return await this.orderRepository.findMany({
        filter: finalFilter,
        pagination: params.pagination,
        sort: params.sort,
      });
    });
  }

  async getOrderById(params: {
    orderId: string;
    clientUserId?: string;
    workerUserId?: string;
  }) {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: params.orderId } });
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const isOwner = order.clientUserId === params.clientUserId;
      const isAssigned = order.workerUserId && order.workerUserId === params.workerUserId;

      if (!isOwner && !isAssigned) {
        throw new AppError('Access denied', 403);
      }

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

  async specifyTimeRange(params: {
    orderId: string;
    workerUserId?: string;
    startTime: Date;
    endTime: Date;
  }) {
    return tryCatch(async () => {
      if (!params.workerUserId) throw new AppError('Worker not found', 403);

      const order = await this.orderRepository.find({ filter: { id: params.orderId } });
      if (!order) throw new AppError('Order not found', 404);

      if (order.workerUserId !== params.workerUserId) {
        throw new AppError('Access denied', 403);
      }

      const workerVerification = await this.workerProfileRepository.findVerification({ workerFilter: { userId: params.workerUserId } });
      if (!workerVerification || workerVerification.status !== VerificationStatus.APPROVED) {
        throw new AppError('Worker is not verified', 400);
      }

      if (!canTransitionOrderStatus(order.orderStatus, 'TIME_SPECIFIED')) {
        throw new AppError('Cannot specify time range in current status', 400);
      }

      return await this.transactionManager.execute(
        { orderRepo: OrderRepository, workerRepo: WorkerProfileRepository, timeSlotRepo: WorkerOccupiedTimeSlotRepository },
        async ({ orderRepo, workerRepo, timeSlotRepo }, tx) => {
          // Advisory lock
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${params.workerUserId}))`;

          const workerProfileId = (await workerRepo.find({ workerFilter: { userId: params.workerUserId } })).id;

          const existingSlots = await timeSlotRepo.findMany({
            filter: { workerProfileId },
          });

          for (const slot of existingSlots) {
            if (hasOverlap(params.startTime, params.endTime, slot.startDate, slot.endDate)) {
              throw new AppError('Time slot overlaps with existing schedule', 409);
            }
          }

          await timeSlotRepo.create({
            slot: {
              workerProfileId,
              orderId: params.orderId,
              startDate: params.startTime,
              endDate: params.endTime,
            },
          });

          return await orderRepo.update({
            filter: { id: params.orderId },
            order: { orderStatus: 'TIME_SPECIFIED', endDate: params.endTime },
          });
        }
      );
    });
  }

  async startWork(params: { orderId: string; workerUserId?: string }) {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: params.orderId } });
      if (!order) throw new AppError('Order not found', 404);

      if (order.workerUserId !== params.workerUserId)
        throw new AppError('Access denied', 403);

      const workerVerification = await this.workerProfileRepository.findVerification({ workerFilter: { userId: params.workerUserId } });
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

      if (order.workerUserId !== params.workerUserId)
        throw new AppError('Access denied', 403);

      if (!canTransitionWorkStatus(order.workStatus, 'DONE'))
        throw new AppError('Cannot finish work in current status', 400);
      if (!canTransitionOrderStatus(order.orderStatus, OrderStatus.COMPLETED))
        throw new AppError('Cannot complete order in current status', 400);

      return await this.transactionManager.execute(
        { orderRepo: OrderRepository, workerProfileRepo: WorkerProfileRepository },
        async ({ orderRepo, workerProfileRepo }) => {
          const updated = await orderRepo.update({
            filter: { id: params.orderId },
            order: {
              orderStatus: OrderStatus.COMPLETED,
              workStatus: 'DONE',
              workFinishedAt: new Date(),
            },
          });

          const workerProfileId = (await workerProfileRepo.find({ workerFilter: { userId: order.workerUserId } })).id;

          await workerProfileRepo.increaseCompletedOrders({
            workerProfileId,
          });

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

        const workerProfileId = (await workerProfileRepo.find({ workerFilter: { userId: order.workerUserId } })).id;

        await workerProfileRepo.addRating({
          workerProfileId,
          rate,
        });
      }
    );
  }
}
