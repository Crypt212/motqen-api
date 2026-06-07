import { describe, it, expect, vi } from 'vitest';

// Mock OperationalError — AppError extends it
vi.mock('../../../src/errors/OperationalError.js', () => ({
  default: class OperationalError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'OperationalError';
      Error.captureStackTrace(this, this.constructor);
    }
  },
}));

import AppError from '../../../src/errors/AppError.js';
import OperationalError from '../../../src/errors/OperationalError.js';

describe('AppError', () => {
  // ─── Constructor ──────────────────────────────────────────────
  describe('constructor', () => {
    it('creates an error with message and statusCode', () => {
      const error = new AppError('Not Found', 404);

      expect(error.message).toBe('Not Found');
      expect(error.statusCode).toBe(404);
    });

    it('defaults statusCode to 500 when not provided', () => {
      const error = new AppError('Internal Error');

      expect(error.statusCode).toBe(500);
    });

    it('defaults statusCode to 500 when explicitly undefined', () => {
      const error = new AppError('Server Error', undefined);

      expect(error.statusCode).toBe(500);
    });
  });

  // ─── Status ───────────────────────────────────────────────────
  describe('status field', () => {
    it('sets status to "fail" for 400', () => {
      const error = new AppError('Bad Request', 400);
      expect(error.status).toBe('fail');
    });

    it('sets status to "fail" for 401', () => {
      const error = new AppError('Unauthorized', 401);
      expect(error.status).toBe('fail');
    });

    it('sets status to "fail" for 403', () => {
      const error = new AppError('Forbidden', 403);
      expect(error.status).toBe('fail');
    });

    it('sets status to "fail" for 404', () => {
      const error = new AppError('Not Found', 404);
      expect(error.status).toBe('fail');
    });

    it('sets status to "fail" for 409', () => {
      const error = new AppError('Conflict', 409);
      expect(error.status).toBe('fail');
    });

    it('sets status to "fail" for 422', () => {
      const error = new AppError('Unprocessable Entity', 422);
      expect(error.status).toBe('fail');
    });

    it('sets status to "fail" for 429', () => {
      const error = new AppError('Too Many Requests', 429);
      expect(error.status).toBe('fail');
    });

    it('sets status to "error" for 500', () => {
      const error = new AppError('Internal Server Error', 500);
      expect(error.status).toBe('error');
    });

    it('sets status to "error" for 502', () => {
      const error = new AppError('Bad Gateway', 502);
      expect(error.status).toBe('error');
    });

    it('sets status to "error" for 503', () => {
      const error = new AppError('Service Unavailable', 503);
      expect(error.status).toBe('error');
    });

    it('sets status to "error" for default 500', () => {
      const error = new AppError('Oops');
      expect(error.status).toBe('error');
    });
  });

  // ─── Inheritance ──────────────────────────────────────────────
  describe('inheritance', () => {
    it('is an instance of Error', () => {
      const error = new AppError('Test', 400);
      expect(error).toBeInstanceOf(Error);
    });

    it('is an instance of OperationalError', () => {
      const error = new AppError('Test', 400);
      expect(error).toBeInstanceOf(OperationalError);
    });

    it('is an instance of AppError', () => {
      const error = new AppError('Test', 400);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  // ─── Details ──────────────────────────────────────────────────
  describe('details', () => {
    it('stores details when provided', () => {
      const details = { toJSON: () => ({ field: 'name', issue: 'required' }) };
      const error = new AppError('Validation Error', 422, details);

      expect(error.details).toBeDefined();
      expect(error.details?.toJSON()).toEqual({ field: 'name', issue: 'required' });
    });

    it('details is undefined when not provided', () => {
      const error = new AppError('Error', 500);
      expect(error.details).toBeUndefined();
    });

    it('details is undefined when explicitly undefined', () => {
      const error = new AppError('Error', 500, undefined);
      expect(error.details).toBeUndefined();
    });
  });

  // ─── retryAfter ───────────────────────────────────────────────
  describe('retryAfter', () => {
    it('defaults retryAfter to 0', () => {
      const error = new AppError('Rate Limited', 429);
      expect(error.retryAfter).toBe(0);
    });

    it('allows setting retryAfter after construction', () => {
      const error = new AppError('Rate Limited', 429);
      error.retryAfter = 60;
      expect(error.retryAfter).toBe(60);
    });
  });

  // ─── Stack Trace ──────────────────────────────────────────────
  describe('stack trace', () => {
    it('has a stack trace', () => {
      const error = new AppError('Stack test', 500);
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });

    it('stack trace contains the error message', () => {
      const error = new AppError('Unique stack message', 400);
      expect(error.stack).toContain('Unique stack message');
    });
  });
});
