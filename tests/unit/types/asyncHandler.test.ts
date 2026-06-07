import { describe, it, expect, vi } from 'vitest';

// Mock the domain/type imports that asyncHandler.ts references
vi.mock('../../../src/repositories/interfaces/Repository.js', () => ({
  default: {},
}));

vi.mock('../../../src/domain/user.entity.js', () => ({
  AccountStatus: {},
  Role: {},
}));

vi.mock('../../../src/domain/workerProfile.entity.js', () => ({
  VerificationStatus: {},
}));

vi.mock('../../../src/generated/prisma/client.js', () => ({
  $Enums: {
    AccountStatus: { ACTIVE: 'ACTIVE' },
    Role: { CLIENT: 'CLIENT' },
    VerificationStatus: { PENDING: 'PENDING' },
  },
}));

vi.mock('../../../src/generated/prisma/enums.js', () => ({}));

import { asyncHandler } from '../../../src/types/asyncHandler.js';

/** Create mock Express req, res, next */
function createMocks() {
  const req = {} as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as any;
  const next = vi.fn();
  return { req, res, next };
}

describe('asyncHandler', () => {
  // ─── Basic Behavior ───────────────────────────────────────────
  describe('basic behavior', () => {
    it('returns a function', () => {
      const handler = asyncHandler(async (_req, _res, _next) => {});
      expect(typeof handler).toBe('function');
    });

    it('calls the wrapped handler', async () => {
      const { req, res, next } = createMocks();
      const controller = vi.fn().mockResolvedValue(undefined);

      const handler = asyncHandler(controller);
      await handler(req, res, next);

      expect(controller).toHaveBeenCalledTimes(1);
    });

    it('passes req, res, next to the wrapped handler', async () => {
      const { req, res, next } = createMocks();
      const controller = vi.fn().mockResolvedValue(undefined);

      const handler = asyncHandler(controller);
      await handler(req, res, next);

      expect(controller).toHaveBeenCalledWith(req, res, next);
    });
  });

  // ─── Successful Execution ─────────────────────────────────────
  describe('successful execution', () => {
    it('does not call next() on success', async () => {
      const { req, res, next } = createMocks();
      const controller = vi.fn().mockResolvedValue(undefined);

      const handler = asyncHandler(controller);
      await handler(req, res, next);

      // Allow microtasks to settle
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(next).not.toHaveBeenCalled();
    });

    it('allows controller to call res methods', async () => {
      const { req, res, next } = createMocks();
      const controller = vi.fn(async (_req: any, res: any) => {
        res.status(200).json({ status: 'ok' });
      });

      const handler = asyncHandler(controller);
      await handler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
    });
  });

  // ─── Async Error Handling ─────────────────────────────────────
  describe('async error handling', () => {
    it('passes async errors (rejected promises) to next()', async () => {
      const { req, res, next } = createMocks();
      const testError = new Error('Async failure');
      const controller = vi.fn().mockRejectedValue(testError);

      const handler = asyncHandler(controller);
      await handler(req, res, next);

      // Allow the .catch(next) to execute
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(next).toHaveBeenCalledWith(testError);
    });

    it('passes thrown async errors to next()', async () => {
      const { req, res, next } = createMocks();
      const testError = new Error('Thrown async error');
      const controller = vi.fn(async () => {
        throw testError;
      });

      const handler = asyncHandler(controller);
      await handler(req, res, next);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(next).toHaveBeenCalledWith(testError);
    });

    it('handles non-Error rejection values', async () => {
      const { req, res, next } = createMocks();
      const controller = vi.fn().mockRejectedValue('string error');

      const handler = asyncHandler(controller);
      await handler(req, res, next);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(next).toHaveBeenCalledWith('string error');
    });
  });

  // ─── Sync Error Handling ──────────────────────────────────────
  describe('sync error handling', () => {
    it('passes synchronous errors to next()', async () => {
      const { req, res, next } = createMocks();
      const testError = new Error('Sync failure');
      const controller = vi.fn(() => {
        throw testError;
      });

      const handler = asyncHandler(controller);
      // Promise.resolve wraps the sync throw, then .catch(next) catches it
      await handler(req, res, next);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(next).toHaveBeenCalledWith(testError);
    });
  });

  // ─── Edge Cases ───────────────────────────────────────────────
  describe('edge cases', () => {
    it('handles controller that returns undefined (sync)', async () => {
      const { req, res, next } = createMocks();
      const controller = vi.fn(() => undefined) as any;

      const handler = asyncHandler(controller);
      await handler(req, res, next);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(next).not.toHaveBeenCalled();
    });

    it('handles controller that returns a non-promise value', async () => {
      const { req, res, next } = createMocks();
      const controller = vi.fn(() => {}) as any;

      const handler = asyncHandler(controller);
      await handler(req, res, next);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(next).not.toHaveBeenCalled();
    });

    it('each call gets independent error handling', async () => {
      const { req, res, next: next1 } = createMocks();
      const { next: next2 } = createMocks();

      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      const controller1 = vi.fn().mockRejectedValue(error1);
      const controller2 = vi.fn().mockRejectedValue(error2);

      const handler1 = asyncHandler(controller1);
      const handler2 = asyncHandler(controller2);

      await handler1(req, res, next1);
      await handler2(req, res, next2);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(next1).toHaveBeenCalledWith(error1);
      expect(next2).toHaveBeenCalledWith(error2);
    });
  });
});
