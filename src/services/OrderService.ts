import Service, { tryCatch } from './Service.js';
import IOrderRepository from '../repositories/interfaces/OrderRepository.js';
import IWorkerOccupiedTimeSlotRepository from '../repositories/interfaces/WorkerOccupiedTimeSlotRepository.js';
import ILocationRepository from '../repositories/interfaces/LocationRepository.js';
import { TransactionManager } from '../repositories/prisma/TransactionManager.js';
import OrderRepository from '../repositories/prisma/OrderRepository.js';
import WorkerOccupiedTimeSlotRepository from '../repositories/prisma/WorkerOccupiedTimeSlotRepository.js';
import AppError from '../errors/AppError.js';
import uploadToCloudinary from '../providers/cloudinaryProvider.js';
import { Order, OrderFilter } from '../domain/order.entity.js';
import { PaginatedResultMeta, PaginationOptions, SortOptions } from '../types/query.js';
import { canTransitionOrderStatus, canTransitionWorkStatus } from '../utils/stateMachine.js';
import { hasOverlap } from '../utils/overlapCheck.js';
import { CreateOrderDTO } from '../schemas/order.js';

interface OrderServiceDeps {
  orderRepository: IOrderRepository;
  occupiedTimeSlotRepository: IWorkerOccupiedTimeSlotRepository;
  locationRepository: ILocationRepository;
  transactionManager: TransactionManager;
}

export default class OrderService extends Service {
  private orderRepository: IOrderRepository;
  private occupiedTimeSlotRepository: IWorkerOccupiedTimeSlotRepository;
  private locationRepository: ILocationRepository;
  private transactionManager: TransactionManager;

  constructor(deps: OrderServiceDeps) {
    super();
    this.orderRepository = deps.orderRepository;
    this.occupiedTimeSlotRepository = deps.occupiedTimeSlotRepository;
    this.locationRepository = deps.locationRepository;
    this.transactionManager = deps.transactionManager;
  }

  async createOrder({
    userId,
    data,
    images,
  }: {
    userId: string;
    data: CreateOrderDTO & { clientProfileId: string };
    images: Express.Multer.File[];
  }) {
    return tryCatch(async () => {
      const location = await this.locationRepository.findById(data.locationId);
      if (!location || location.userId !== userId) {
        throw new AppError('Location not found or not owned', 400);
      }

      if (images.length > 3) {
        throw new AppError('Maximum 3 images allowed per order', 400);
      }

      // Upload images
      const uploadPromises = images.map((file) => uploadToCloudinary(file.buffer, 'motqen/orders'));
      const uploadResults = await Promise.all(uploadPromises);
      const imageUrls = uploadResults.map((r) => r.url);

      // Create order with transaction
      return await this.transactionManager.execute(
        { orderRepo: OrderRepository },
        async ({ orderRepo }) => {
          return await orderRepo.create({
            order: {
              title: data.title,
              description: data.description,
              clientProfileId: data.clientProfileId,
              locationId: data.locationId,
              subSpecializationId: data.subSpecializationId,
              startDate: data.startDate,
              isUrgent: data.isUrgent,
            },
            imageUrls,
          });
        }
      );
    });
  }

  async getOrders(params: {
    userId: string;
    role: string;
    clientProfileId?: string;
    workerProfileId?: string;
    filter: OrderFilter;
    pagination?: PaginationOptions;
    sort?: SortOptions<Order>;
  }) {
    return tryCatch(async () => {
      const roleFilter =
        params.role === 'CLIENT'
          ? { clientProfileId: params.clientProfileId }
          : params.role === 'WORKER'
            ? { workerProfileId: params.workerProfileId }
            : {}; // For ADMIN, see all? Not specified, assume safe fallback

      return await this.orderRepository.findMany({
        filter: { ...params.filter, ...roleFilter },
        pagination: params.pagination,
        sort: params.sort,
      });
    });
  }

  async getOrderById(params: {
    orderId: string;
    clientProfileId?: string;
    workerProfileId?: string;
  }) {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: params.orderId } });
      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const isOwner = order.clientProfileId === params.clientProfileId;
      const isAssigned = order.workerProfileId && order.workerProfileId === params.workerProfileId;

      if (!isOwner && !isAssigned) {
        throw new AppError('Access denied', 403);
      }

      return order;
    });
  }

  async cancelOrder(params: { orderId: string; clientProfileId?: string }) {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: params.orderId } });
      if (!order) throw new AppError('Order not found', 404);

      if (order.clientProfileId !== params.clientProfileId) {
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
    workerProfileId?: string;
    startTime: Date;
    endTime: Date;
  }) {
    return tryCatch(async () => {
      if (!params.workerProfileId) throw new AppError('Worker profile not found', 403);

      const order = await this.orderRepository.find({ filter: { id: params.orderId } });
      if (!order) throw new AppError('Order not found', 404);

      if (order.workerProfileId !== params.workerProfileId) {
        throw new AppError('Access denied', 403);
      }

      if (!canTransitionOrderStatus(order.orderStatus, 'TIME_SPECIFIED')) {
        throw new AppError('Cannot specify time range in current status', 400);
      }

      return await this.transactionManager.execute(
        { orderRepo: OrderRepository, timeSlotRepo: WorkerOccupiedTimeSlotRepository },
        async ({ orderRepo, timeSlotRepo }, tx) => {
          // Advisory lock
          await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${params.workerProfileId}))`;

          const existingSlots = await timeSlotRepo.findMany({
            filter: { workerProfileId: params.workerProfileId },
          });

          for (const slot of existingSlots) {
            if (hasOverlap(params.startTime, params.endTime, slot.startDate, slot.endDate)) {
              throw new AppError('Time slot overlaps with existing schedule', 409);
            }
          }

          await timeSlotRepo.create({
            slot: {
              workerProfileId: params.workerProfileId!,
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

  async startWork(params: { orderId: string; workerProfileId?: string }) {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: params.orderId } });
      if (!order) throw new AppError('Order not found', 404);

      if (order.workerProfileId !== params.workerProfileId)
        throw new AppError('Access denied', 403);

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

  async finishWork(params: { orderId: string; workerProfileId?: string }) {
    return tryCatch(async () => {
      const order = await this.orderRepository.find({ filter: { id: params.orderId } });
      if (!order) throw new AppError('Order not found', 404);

      if (order.workerProfileId !== params.workerProfileId)
        throw new AppError('Access denied', 403);

      if (!canTransitionWorkStatus(order.workStatus, 'DONE'))
        throw new AppError('Cannot finish work in current status', 400);
      if (!canTransitionOrderStatus(order.orderStatus, 'COMPLETED'))
        throw new AppError('Cannot complete order in current status', 400);

      return await this.transactionManager.execute(
        { orderRepo: OrderRepository },
        async ({ orderRepo }) => {
          const updated = await orderRepo.update({
            filter: { id: params.orderId },
            order: { orderStatus: 'COMPLETED', workStatus: 'DONE', workFinishedAt: new Date() },
          });

          // TODO: notificationService.notify(order.clientProfileId, 'WORK_FINISHED', { orderId })

          return updated;
        }
      );
    });
  }
}
