import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import adminWorkersRouter from '../../src/routes/v1/admin/workers.js';
import { adminWorkersController } from '../../src/state.js';

vi.mock('../../src/state.js', () => ({
  adminWorkersController: {
    listWorkers: vi.fn((req, res) =>
      res.status(200).json({ status: 'success', data: { workers: [] } })
    ),
    createWorker: vi.fn((req, res) =>
      res.status(201).json({ status: 'success', data: { workerProfileId: 'w-1' } })
    ),
    getWorkerDetails: vi.fn((req, res) =>
      res.status(200).json({ status: 'success', data: { workerProfileId: req.params.workerId } })
    ),
    approveWorker: vi.fn((req, res) =>
      res.status(200).json({ status: 'success', data: null })
    ),
    rejectWorker: vi.fn((req, res) =>
      res.status(200).json({ status: 'success', data: null })
    ),
    suspendWorker: vi.fn((req, res) =>
      res.status(200).json({ status: 'success', data: null })
    ),
    reactivateWorker: vi.fn((req, res) =>
      res.status(200).json({ status: 'success', data: null })
    ),
    banWorker: vi.fn((req, res) =>
      res.status(200).json({ status: 'success', data: null })
    ),
  },
}));

vi.mock('../../src/middlewares/adminAuthMiddleware.js', () => ({
  authenticateAdminAccess: vi.fn((req, res, next) => {
    req.adminState = { adminId: 'admin-1', username: 'admin', role: 'USER_MANAGEMENT' };
    next();
  }),
  requireAdminPermission: vi.fn((allowedRoles) => (req, res, next) => next()),
}));

vi.mock('../../src/middlewares/csrfMiddleware.js', () => ({
  validateCsrf: vi.fn((req, res, next) => next()),
}));

describe('Admin Workers Dashboard Integration', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/admin/workers', adminWorkersRouter);
    vi.clearAllMocks();
  });

  describe('GET /api/v1/admin/workers', () => {
    it('should list workers with filters', async () => {
      const res = await request(app)
        .get('/api/v1/admin/workers')
        .query({ page: 1, limit: 10, accountStatus: 'ACTIVE' });

      expect(res.status).toBe(200);
      expect(adminWorkersController.listWorkers).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/workers', () => {
    it('should manually onboard worker with validation', async () => {
      const res = await request(app)
        .post('/api/v1/admin/workers')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '01012345678', // valid Egyptian format
          governmentId: '00000000-0000-0000-0000-000000000000',
          cityId: '00000000-0000-0000-0000-000000000000',
          specializationIds: ['00000000-0000-0000-0000-000000000000'],
        });

      expect(res.status).toBe(201);
      expect(adminWorkersController.createWorker).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/admin/workers/:workerId', () => {
    it('should retrieve worker details', async () => {
      const res = await request(app).get('/api/v1/admin/workers/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(200);
      expect(adminWorkersController.getWorkerDetails).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/workers/:workerId/approve', () => {
    it('should approve worker verification', async () => {
      const res = await request(app).post('/api/v1/admin/workers/00000000-0000-0000-0000-000000000000/approve');
      expect(res.status).toBe(200);
      expect(adminWorkersController.approveWorker).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/workers/:workerId/reject', () => {
    it('should reject worker verification', async () => {
      const res = await request(app)
        .post('/api/v1/admin/workers/00000000-0000-0000-0000-000000000000/reject')
        .send({
          rejectionReasons: ['BLURRY_IMAGE'],
          rejectionNote: 'Document blurry',
        });
      expect(res.status).toBe(200);
      expect(adminWorkersController.rejectWorker).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/workers/:workerId/suspend', () => {
    it('should suspend worker account', async () => {
      const res = await request(app)
        .post('/api/v1/admin/workers/00000000-0000-0000-0000-000000000000/suspend')
        .send({ reason: 'Inactive' });
      expect(res.status).toBe(200);
      expect(adminWorkersController.suspendWorker).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/workers/:workerId/reactivate', () => {
    it('should reactivate worker account', async () => {
      const res = await request(app).post('/api/v1/admin/workers/00000000-0000-0000-0000-000000000000/reactivate');
      expect(res.status).toBe(200);
      expect(adminWorkersController.reactivateWorker).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/admin/workers/:workerId/ban', () => {
    it('should ban worker account', async () => {
      const res = await request(app)
        .post('/api/v1/admin/workers/00000000-0000-0000-0000-000000000000/ban')
        .send({ reason: 'Fraudulent activity' });
      expect(res.status).toBe(200);
      expect(adminWorkersController.banWorker).toHaveBeenCalled();
    });
  });
});
