import { describe, it, expect, vi, beforeEach } from 'vitest';
import OrderService from '../../src/services/OrderService.js';
import AppError from '../../src/errors/AppError.js';
import {
  createMockOrderRepository,
  createMockLocationRepository,
  createMockWorkerOccupiedTimeSlotRepository,
  makeOrder,
  makeWorkerOccupiedTimeSlot,
  makeLocation,
} from '../helpers/mocks.js';
import uploadToCloudinary from '../../src/providers/cloudinaryProvider.js';

// Mock cloudinary provider implementation
vi.mock('../../src/providers/cloudinaryProvider.js', () => ({
  default: vi.fn().mockResolvedValue({ url: 'https://cdn.motqen.com/uploaded.jpg' }),
}));

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: ReturnType<typeof createMockOrderRepository>;
  let locationRepo: ReturnType<typeof createMockLocationRepository>;
  let timeSlotRepo: ReturnType<typeof createMockWorkerOccupiedTimeSlotRepository>;
  let transactionManagerMock: any;

  beforeEach(() => {
    orderRepo = createMockOrderRepository();
    locationRepo = createMockLocationRepository();
    timeSlotRepo = createMockWorkerOccupiedTimeSlotRepository();

    // Create a mock transaction manager that just returns the callback result
    transactionManagerMock = {
      execute: vi.fn().mockImplementation(async (repos, callback) => {
        // Return raw repositories to simplify testing
        return callback(
          {
            orderRepo,
            timeSlotRepo,
          },
          {
            $queryRaw: vi.fn().mockResolvedValue(true),
          }
        );
      }),
    };

    service = new OrderService({
      orderRepository: orderRepo as any,
      occupiedTimeSlotRepository: timeSlotRepo as any,
      locationRepository: locationRepo as any,
      transactionManager: transactionManagerMock,
    });
  });

  describe('createOrder', () => {
    const validData = {
      title: 'Fix AC',
      description: 'The AC is not cooling',
      clientProfileId: 'client-1',
      locationId: 'loc-1',
      subSpecializationId: 'sub-spec-1',
      startDate: new Date('2025-01-01'),
      isUrgent: false,
    };
    const validImages: Express.Multer.File[] = [];

    it('should create order successfully', async () => {
      const mockLocation = makeLocation({ id: 'loc-1', userId: 'user-1' });
      locationRepo.findById.mockResolvedValue(mockLocation);
      const mockOrder = makeOrder({ id: 'order-1' });
      orderRepo.create.mockResolvedValue(mockOrder);

      const result = await service.createOrder({
        userId: 'user-1',
        data: validData,
        images: validImages,
      });

      expect(result).toEqual(mockOrder);
      expect(orderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.objectContaining({ title: validData.title }),
          imageUrls: [],
        })
      );
    });

    it('should throw AppError if location is not found', async () => {
      locationRepo.findById.mockResolvedValue(null);

      await expect(
        service.createOrder({ userId: 'user-1', data: validData, images: validImages })
      ).rejects.toThrow('Location not found or not owned');
      expect(orderRepo.create).not.toHaveBeenCalled();
    });

    it('should throw AppError if location does not belong to user', async () => {
      const mockLocation = makeLocation({ id: 'loc-1', userId: 'user-2' }); // Different user
      locationRepo.findById.mockResolvedValue(mockLocation);

      await expect(
        service.createOrder({ userId: 'user-1', data: validData, images: validImages })
      ).rejects.toThrow('Location not found or not owned');
      expect(orderRepo.create).not.toHaveBeenCalled();
    });

    it('should throw AppError if more than 3 images are provided', async () => {
      const mockLocation = makeLocation({ id: 'loc-1', userId: 'user-1' });
      locationRepo.findById.mockResolvedValue(mockLocation);

      const images = Array(4).fill({ buffer: Buffer.from('') }) as Express.Multer.File[];

      await expect(
        service.createOrder({ userId: 'user-1', data: validData, images })
      ).rejects.toThrow('Maximum 3 images allowed per order');
      expect(orderRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('should return order if user is the client', async () => {
      const mockOrder = makeOrder({ id: 'order-1', clientProfileId: 'client-1' });
      orderRepo.find.mockResolvedValue(mockOrder);

      const result = await service.getOrderById({
        orderId: 'order-1',
        clientProfileId: 'client-1',
      });

      expect(result).toEqual(mockOrder);
    });

    it('should throw AppError if order does not exist', async () => {
      orderRepo.find.mockResolvedValue(null);

      await expect(
        service.getOrderById({ orderId: 'nope', clientProfileId: 'client-1' })
      ).rejects.toThrow('Order not found');
    });

    it('should throw AppError if user has no access', async () => {
      const mockOrder = makeOrder({
        id: 'order-1',
        clientProfileId: 'client-2',
        workerProfileId: 'worker-2',
      });
      orderRepo.find.mockResolvedValue(mockOrder);

      await expect(
        service.getOrderById({
          orderId: 'order-1',
          clientProfileId: 'client-1',
          workerProfileId: 'worker-1',
        })
      ).rejects.toThrow('Access denied');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel pending order successfully', async () => {
      const mockOrder = makeOrder({
        id: 'order-1',
        clientProfileId: 'client-1',
        orderStatus: 'PENDING',
      });
      orderRepo.find.mockResolvedValue(mockOrder);

      await service.cancelOrder({ orderId: 'order-1', clientProfileId: 'client-1' });

      expect(orderRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ order: { orderStatus: 'CANCELLED' } })
      );
      expect(timeSlotRepo.deleteByOrderId).toHaveBeenCalledWith({ orderId: 'order-1' });
    });

    it('should not update if order does not exist', async () => {
      orderRepo.find.mockResolvedValue(null);

      await expect(
        service.cancelOrder({ orderId: 'nope', clientProfileId: 'client-1' })
      ).rejects.toThrow('Order not found');
      expect(orderRepo.update).not.toHaveBeenCalled();
    });

    it('should throw AppError if order is not pending', async () => {
      const mockOrder = makeOrder({
        id: 'order-1',
        clientProfileId: 'client-1',
        orderStatus: 'PAID',
      });
      orderRepo.find.mockResolvedValue(mockOrder);

      await expect(
        service.cancelOrder({ orderId: 'order-1', clientProfileId: 'client-1' })
      ).rejects.toThrow('Cannot cancel order in current status');
      expect(orderRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('specifyTimeRange', () => {
    it('should specify time range and transition state', async () => {
      const mockOrder = makeOrder({
        id: 'order-1',
        workerProfileId: 'worker-1',
        orderStatus: 'PENDING',
      });
      orderRepo.find.mockResolvedValue(mockOrder);
      timeSlotRepo.findMany.mockResolvedValue([]);

      const startTime = new Date('2025-01-01T10:00:00Z');
      const endTime = new Date('2025-01-01T12:00:00Z');

      await service.specifyTimeRange({
        orderId: 'order-1',
        workerProfileId: 'worker-1',
        startTime,
        endTime,
      });

      expect(timeSlotRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slot: expect.objectContaining({
            workerProfileId: 'worker-1',
            startDate: startTime,
            endDate: endTime,
          }),
        })
      );
      expect(orderRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { orderStatus: 'TIME_SPECIFIED', endDate: endTime },
        })
      );
    });

    it('should not update if order does not exist', async () => {
      orderRepo.find.mockResolvedValue(null);

      await expect(
        service.specifyTimeRange({
          orderId: 'nope',
          workerProfileId: 'worker-1',
          startTime: new Date(),
          endTime: new Date(),
        })
      ).rejects.toThrow('Order not found');
      expect(timeSlotRepo.create).not.toHaveBeenCalled();
      expect(orderRepo.update).not.toHaveBeenCalled();
    });

    it('should throw AppError on time overlap', async () => {
      const mockOrder = makeOrder({
        id: 'order-1',
        workerProfileId: 'worker-1',
        orderStatus: 'PENDING',
      });
      orderRepo.find.mockResolvedValue(mockOrder);

      const existingSlot = makeWorkerOccupiedTimeSlot({
        startDate: new Date('2025-01-01T09:00:00Z'),
        endDate: new Date('2025-01-01T11:00:00Z'),
      });
      timeSlotRepo.findMany.mockResolvedValue([existingSlot]);

      await expect(
        service.specifyTimeRange({
          orderId: 'order-1',
          workerProfileId: 'worker-1',
          startTime: new Date('2025-01-01T10:00:00Z'),
          endTime: new Date('2025-01-01T12:00:00Z'),
        })
      ).rejects.toThrow('Time slot overlaps with existing schedule');
      expect(timeSlotRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('startWork', () => {
    it('should transition workStatus to STARTED if order is PAID and date is today', async () => {
      const today = new Date();
      const mockOrder = makeOrder({
        id: 'order-1',
        workerProfileId: 'worker-1',
        orderStatus: 'PAID',
        workStatus: 'WAITING_FOR_WORK',
        startDate: today,
      });
      orderRepo.find.mockResolvedValue(mockOrder);

      await service.startWork({ orderId: 'order-1', workerProfileId: 'worker-1' });

      expect(orderRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.objectContaining({ workStatus: 'STARTED' }),
        })
      );
    });

    it('should not update if order does not exist', async () => {
      orderRepo.find.mockResolvedValue(null);
      await expect(
        service.startWork({ orderId: 'nope', workerProfileId: 'worker-1' })
      ).rejects.toThrow('Order not found');
      expect(orderRepo.update).not.toHaveBeenCalled();
    });

    it('should throw AppError if order is not PAID', async () => {
      const today = new Date();
      const mockOrder = makeOrder({
        id: 'order-1',
        workerProfileId: 'worker-1',
        orderStatus: 'PENDING',
        workStatus: 'WAITING_FOR_WORK',
        startDate: today,
      });
      orderRepo.find.mockResolvedValue(mockOrder);

      await expect(
        service.startWork({ orderId: 'order-1', workerProfileId: 'worker-1' })
      ).rejects.toThrow('Order must be in PAID status to start work');
      expect(orderRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('finishWork', () => {
    it('should transition workStatus to DONE and orderStatus to COMPLETED', async () => {
      const mockOrder = makeOrder({
        id: 'order-1',
        workerProfileId: 'worker-1',
        orderStatus: 'PAID',
        workStatus: 'STARTED',
      });
      orderRepo.find.mockResolvedValue(mockOrder);

      await service.finishWork({ orderId: 'order-1', workerProfileId: 'worker-1' });

      expect(orderRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          order: expect.objectContaining({ orderStatus: 'COMPLETED', workStatus: 'DONE' }),
        })
      );
    });

    it('should not update if order does not exist', async () => {
      orderRepo.find.mockResolvedValue(null);
      await expect(
        service.finishWork({ orderId: 'nope', workerProfileId: 'worker-1' })
      ).rejects.toThrow('Order not found');
      expect(orderRepo.update).not.toHaveBeenCalled();
    });
  });
});
