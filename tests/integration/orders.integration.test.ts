import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import ordersRouter from '../../src/routes/v1/orders.js';
import { orderController } from '../../src/state.js';

vi.mock('../../state.js', () => ({
  orderController: {
    create: vi.fn((req, res) =>
      res.status(201).json({ status: 'success', data: { order: { id: 'order-1' } } })
    ),
    list: vi.fn((req, res) => res.status(200).json({ status: 'success', data: { orders: [] } })),
    getById: vi.fn((req, res) =>
      res.status(200).json({ status: 'success', data: { order: { id: req.params.orderId } } })
    ),
    cancel: vi.fn((req, res) => res.status(200).json({ status: 'success', data: null })),
    specifyRange: vi.fn((req, res) =>
      res.status(200).json({ status: 'success', data: { order: { id: req.params.orderId } } })
    ),
    startWork: vi.fn((req, res) =>
      res.status(200).json({ status: 'success', data: { order: { id: req.params.orderId } } })
    ),
    finishWork: vi.fn((req, res) =>
      res.status(200).json({ status: 'success', data: { order: { id: req.params.orderId } } })
    ),
  },
}));

vi.mock('../../middlewares/authMiddleware.js', () => ({
  authenticateAccess: vi.fn((req, res, next) => next()),
  isActive: vi.fn((req, res, next) => next()),
  authMiddleware: vi.fn((req, res, next) => next()),
}));

describe('Orders Integration', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/orders', ordersRouter);
    vi.clearAllMocks();
  });

  describe('POST /api/v1/orders', () => {
    it('should create an order', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .send({
          title: 'Title',
          description: 'Description',
          subSpecializationId: '00000000-0000-0000-0000-000000000000',
          locationId: '00000000-0000-0000-0000-000000000000',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          isUrgent: false,
        });

      expect(res.status).toBe(201);
      expect(orderController.create).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should list orders', async () => {
      const res = await request(app).get('/api/v1/orders');
      expect(res.status).toBe(200);
      expect(orderController.list).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/orders/:orderId', () => {
    it('should get order by id', async () => {
      const res = await request(app).get('/api/v1/orders/123');
      expect(res.status).toBe(200);
      expect(orderController.getById).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/v1/orders/:orderId', () => {
    it('should cancel order', async () => {
      const res = await request(app).delete('/api/v1/orders/123');
      expect(res.status).toBe(200);
      expect(orderController.cancel).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/orders/:orderId/specify-range', () => {
    it('should specify range', async () => {
      const res = await request(app)
        .post('/api/v1/orders/123/specify-range')
        .send({
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(),
        });
      expect(res.status).toBe(200);
      expect(orderController.specifyRange).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/orders/:orderId/start-work', () => {
    it('should start work', async () => {
      const res = await request(app).post('/api/v1/orders/123/start-work');
      expect(res.status).toBe(200);
      expect(orderController.startWork).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/orders/:orderId/finish-work', () => {
    it('should finish work', async () => {
      const res = await request(app).post('/api/v1/orders/123/finish-work');
      expect(res.status).toBe(200);
      expect(orderController.finishWork).toHaveBeenCalled();
    });
  });
});
