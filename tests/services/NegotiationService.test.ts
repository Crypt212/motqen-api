import { describe, it, expect, beforeEach, vi } from 'vitest';
import NegotiationService from '../../src/services/NegotiationService.js';
import type INegotiationRepository from '../../src/repositories/interfaces/NegotiationRepository.js';
import type { TransactionManager } from '../../src/repositories/prisma/TransactionManager.js';
import type { UserState } from '../../src/types/asyncHandler.js';
import type { Negotiation, OrderForNegotiation } from '../../src/domain/negotiation.entity.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ORDER_ID = '00000000-0000-0000-0000-000000000001';
const CLIENT_PROFILE_ID = '00000000-0000-0000-0000-000000000010';
const WORKER_PROFILE_ID = '00000000-0000-0000-0000-000000000020';
const CLIENT_USER_ID = '00000000-0000-0000-0000-000000000100';
const WORKER_USER_ID = '00000000-0000-0000-0000-000000000200';
const STRANGER_USER_ID = '00000000-0000-0000-0000-000000000999';

const makeOrder = (overrides: Partial<OrderForNegotiation> = {}): OrderForNegotiation => ({
  id: ORDER_ID,
  clientProfileId: CLIENT_PROFILE_ID,
  workerProfileId: WORKER_PROFILE_ID,
  orderStatus: 'PENDING',
  ...overrides,
});

const makeNegotiation = (overrides: Partial<Negotiation> = {}): Negotiation => ({
  id: 'neg-001',
  orderId: ORDER_ID,
  price: 500,
  direction: 'CLIENT_TO_WORKER',
  status: 'PENDING',
  note: null,
  createdAt: new Date('2026-04-18T10:00:00Z'),
  updatedAt: new Date('2026-04-18T10:00:00Z'),
  ...overrides,
});

const clientState: UserState = {
  userId: CLIENT_USER_ID,
  phoneNumber: '01012345678',
  role: 'USER',
  accountStatus: 'ACTIVE',
  client: { id: CLIENT_PROFILE_ID },
};

const workerState: UserState = {
  userId: WORKER_USER_ID,
  phoneNumber: '01198765432',
  role: 'USER',
  accountStatus: 'ACTIVE',
  worker: {
    id: WORKER_PROFILE_ID,
    verification: { status: 'APPROVED' },
  },
};

const strangerState: UserState = {
  userId: STRANGER_USER_ID,
  phoneNumber: '01055555555',
  role: 'USER',
  accountStatus: 'ACTIVE',
};

// ─── Mock Repository ──────────────────────────────────────────────────────────

function createMockRepo(): INegotiationRepository {
  return {
    findByOrderId: vi.fn(),
    findLatestByOrderId: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    findOrderWithProfiles: vi.fn(),
  };
}

function createMockTransactionManager(): TransactionManager {
  return {
    execute: vi.fn(),
  } as unknown as TransactionManager;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NegotiationService', () => {
  let service: NegotiationService;
  let repo: INegotiationRepository;
  let txManager: TransactionManager;

  beforeEach(() => {
    repo = createMockRepo();
    txManager = createMockTransactionManager();
    service = new NegotiationService({
      negotiationRepository: repo,
      transactionManager: txManager,
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Authorization
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Authorization', () => {
    it('should allow client access', async () => {
      const order = makeOrder();
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findByOrderId).mockResolvedValue({
        negotiations: [],
        page: 1,
        limit: 20,
        count: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });

      const result = await service.getNegotiations({ orderId: ORDER_ID, userState: clientState });
      expect(result.negotiations).toEqual([]);
    });

    it('should allow worker access', async () => {
      const order = makeOrder();
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findByOrderId).mockResolvedValue({
        negotiations: [],
        page: 1,
        limit: 20,
        count: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });

      const result = await service.getNegotiations({ orderId: ORDER_ID, userState: workerState });
      expect(result.negotiations).toEqual([]);
    });

    it('should reject unauthorized user (403)', async () => {
      const order = makeOrder();
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);

      await expect(
        service.getNegotiations({ orderId: ORDER_ID, userState: strangerState })
      ).rejects.toThrow('You are not a party to this order');
    });

    it('should return 404 when order not found', async () => {
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(null);

      await expect(
        service.getNegotiations({ orderId: ORDER_ID, userState: clientState })
      ).rejects.toThrow('Order not found');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET negotiations
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getNegotiations', () => {
    it('should return sorted list', async () => {
      const order = makeOrder();
      const negotiations = [
        makeNegotiation({ id: 'neg-002', createdAt: new Date('2026-04-18T12:00:00Z') }),
        makeNegotiation({ id: 'neg-001', createdAt: new Date('2026-04-18T10:00:00Z') }),
      ];
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findByOrderId).mockResolvedValue({
        negotiations,
        page: 1,
        limit: 20,
        count: 2,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });

      const result = await service.getNegotiations({ orderId: ORDER_ID, userState: clientState });
      expect(result.negotiations).toHaveLength(2);
      expect(result.negotiations[0].id).toBe('neg-002');
    });

    it('should handle empty negotiation history', async () => {
      const order = makeOrder();
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findByOrderId).mockResolvedValue({
        negotiations: [],
        page: 1,
        limit: 20,
        count: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });

      const result = await service.getNegotiations({ orderId: ORDER_ID, userState: clientState });
      expect(result.negotiations).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE negotiation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('createNegotiation', () => {
    it('should infer CLIENT_TO_WORKER direction when client creates', async () => {
      const order = makeOrder();
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(null);
      vi.mocked(repo.create).mockResolvedValue(makeNegotiation({ direction: 'CLIENT_TO_WORKER' }));

      const result = await service.createNegotiation({
        orderId: ORDER_ID,
        userState: clientState,
        price: 500,
      });

      expect(repo.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ direction: 'CLIENT_TO_WORKER' }),
      });
      expect(result.direction).toBe('CLIENT_TO_WORKER');
    });

    it('should infer WORKER_TO_CLIENT direction when worker creates', async () => {
      const order = makeOrder();
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(null);
      vi.mocked(repo.create).mockResolvedValue(makeNegotiation({ direction: 'WORKER_TO_CLIENT' }));

      const result = await service.createNegotiation({
        orderId: ORDER_ID,
        userState: workerState,
        price: 600,
      });

      expect(repo.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ direction: 'WORKER_TO_CLIENT' }),
      });
      expect(result.direction).toBe('WORKER_TO_CLIENT');
    });

    it('should block when order status is not PENDING or TIME_SPECIFIED', async () => {
      const order = makeOrder({ orderStatus: 'PRICE_AGREED' });
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);

      await expect(
        service.createNegotiation({
          orderId: ORDER_ID,
          userState: clientState,
          price: 500,
        })
      ).rejects.toThrow(
        'Negotiations are only allowed when order status is PENDING or TIME_SPECIFIED'
      );
    });

    it('should block spam when previous offer is still PENDING', async () => {
      const order = makeOrder();
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(makeNegotiation({ status: 'PENDING' }));

      await expect(
        service.createNegotiation({
          orderId: ORDER_ID,
          userState: clientState,
          price: 500,
        })
      ).rejects.toThrow('The previous offer is still pending');
    });

    it('should allow creation after previous was rejected', async () => {
      const order = makeOrder();
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(
        makeNegotiation({ status: 'REJECTED' })
      );
      vi.mocked(repo.create).mockResolvedValue(makeNegotiation());

      const result = await service.createNegotiation({
        orderId: ORDER_ID,
        userState: clientState,
        price: 400,
      });

      expect(result).toBeDefined();
      expect(repo.create).toHaveBeenCalled();
    });

    it('should allow creation when order status is TIME_SPECIFIED', async () => {
      const order = makeOrder({ orderStatus: 'TIME_SPECIFIED' });
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(null);
      vi.mocked(repo.create).mockResolvedValue(makeNegotiation());

      const result = await service.createNegotiation({
        orderId: ORDER_ID,
        userState: clientState,
        price: 350,
      });

      expect(result).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCEPT negotiation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('acceptNegotiation', () => {
    it('should succeed when opponent accepts', async () => {
      const order = makeOrder();
      const latestNeg = makeNegotiation({
        direction: 'CLIENT_TO_WORKER',
        status: 'PENDING',
      });
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(latestNeg);

      const updatedOrder = {
        id: ORDER_ID,
        clientProfileId: CLIENT_PROFILE_ID,
        workerProfileId: WORKER_PROFILE_ID,
        title: 'Fix AC',
        description: 'Fix AC unit',
        orderStatus: 'PRICE_AGREED',
        finalPrice: 500,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(txManager.execute).mockResolvedValue(updatedOrder);

      // Worker accepts client's offer
      const result = await service.acceptNegotiation({
        orderId: ORDER_ID,
        userState: workerState,
      });

      expect(txManager.execute).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: ORDER_ID,
        orderStatus: 'PRICE_AGREED',
        finalPrice: 500,
      });
    });

    it('should block self-accept (403)', async () => {
      const order = makeOrder();
      const latestNeg = makeNegotiation({
        direction: 'CLIENT_TO_WORKER',
        status: 'PENDING',
      });
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(latestNeg);

      // Client tries to accept their own offer
      await expect(
        service.acceptNegotiation({ orderId: ORDER_ID, userState: clientState })
      ).rejects.toThrow('You cannot accept your own offer');
    });

    it('should block when no pending negotiation (400)', async () => {
      const order = makeOrder();
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(null);

      await expect(
        service.acceptNegotiation({ orderId: ORDER_ID, userState: workerState })
      ).rejects.toThrow('No pending negotiation to accept');
    });

    it('should block when latest negotiation is not PENDING', async () => {
      const order = makeOrder();
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(
        makeNegotiation({ status: 'REJECTED' })
      );

      await expect(
        service.acceptNegotiation({ orderId: ORDER_ID, userState: workerState })
      ).rejects.toThrow('No pending negotiation to accept');
    });

    it('should call transaction with correct arguments', async () => {
      const order = makeOrder();
      const latestNeg = makeNegotiation({
        direction: 'WORKER_TO_CLIENT',
        status: 'PENDING',
        price: 750,
      });
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(latestNeg);
      vi.mocked(txManager.execute).mockResolvedValue({
        id: ORDER_ID,
        clientProfileId: CLIENT_PROFILE_ID,
        workerProfileId: WORKER_PROFILE_ID,
        title: 'Fix AC',
        description: 'desc',
        orderStatus: 'PRICE_AGREED',
        finalPrice: 750,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Client accepts worker's offer
      await service.acceptNegotiation({
        orderId: ORDER_ID,
        userState: clientState,
      });

      expect(txManager.execute).toHaveBeenCalledWith(expect.any(Object), expect.any(Function), {
        isolationLevel: 'Serializable',
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // REJECT negotiation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('rejectNegotiation', () => {
    it('should succeed for opponent', async () => {
      const order = makeOrder();
      const latestNeg = makeNegotiation({
        direction: 'CLIENT_TO_WORKER',
        status: 'PENDING',
      });
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(latestNeg);
      vi.mocked(repo.updateStatus).mockResolvedValue(makeNegotiation({ status: 'REJECTED' }));

      // Worker rejects client's offer
      const result = await service.rejectNegotiation({
        orderId: ORDER_ID,
        userState: workerState,
      });

      expect(result.status).toBe('REJECTED');
      expect(repo.updateStatus).toHaveBeenCalledWith({
        id: latestNeg.id,
        status: 'REJECTED',
      });
    });

    it('should block self-reject (403)', async () => {
      const order = makeOrder();
      const latestNeg = makeNegotiation({
        direction: 'CLIENT_TO_WORKER',
        status: 'PENDING',
      });
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(latestNeg);

      // Client tries to reject their own offer
      await expect(
        service.rejectNegotiation({ orderId: ORDER_ID, userState: clientState })
      ).rejects.toThrow('You cannot reject your own offer');
    });

    it('should block when no pending negotiation (400)', async () => {
      const order = makeOrder();
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(null);

      await expect(
        service.rejectNegotiation({ orderId: ORDER_ID, userState: workerState })
      ).rejects.toThrow('No pending negotiation to reject');
    });

    it('should block when latest negotiation is already rejected', async () => {
      const order = makeOrder();
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(
        makeNegotiation({ status: 'REJECTED' })
      );

      await expect(
        service.rejectNegotiation({ orderId: ORDER_ID, userState: workerState })
      ).rejects.toThrow('No pending negotiation to reject');
    });

    it('should unlock negotiation engine after rejection (allows new offers)', async () => {
      const order = makeOrder();

      // First: reject the pending offer
      const pendingNeg = makeNegotiation({ direction: 'CLIENT_TO_WORKER', status: 'PENDING' });
      vi.mocked(repo.findOrderWithProfiles).mockResolvedValue(order);
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(pendingNeg);
      vi.mocked(repo.updateStatus).mockResolvedValue(makeNegotiation({ status: 'REJECTED' }));

      await service.rejectNegotiation({ orderId: ORDER_ID, userState: workerState });

      // Second: creating a new offer should be allowed (latest is REJECTED)
      vi.mocked(repo.findLatestByOrderId).mockResolvedValue(
        makeNegotiation({ status: 'REJECTED' })
      );
      vi.mocked(repo.create).mockResolvedValue(
        makeNegotiation({ id: 'neg-003', direction: 'WORKER_TO_CLIENT' })
      );

      const newOffer = await service.createNegotiation({
        orderId: ORDER_ID,
        userState: workerState,
        price: 600,
      });

      expect(newOffer.id).toBe('neg-003');
    });
  });
});
