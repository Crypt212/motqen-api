import { describe, it, expect, vi } from 'vitest';
import SuccessResponse from '../../../src/responses/successResponse.js';

/** Helper: create a mock Express Response object */
function createMockResponse() {
  const res: any = {};
  res.json = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  return res;
}

describe('SuccessResponse', () => {
  // ─── Constructor ──────────────────────────────────────────────
  describe('constructor', () => {
    it('sets default values when no arguments are provided', () => {
      const response = new SuccessResponse();

      expect(response.status).toBe('success');
      expect(response.message).toBe('Success');
      expect(response.data).toBeNull();
      expect(response.statusCode).toBe(200);
    });

    it('sets custom message', () => {
      const response = new SuccessResponse('Created successfully');

      expect(response.message).toBe('Created successfully');
    });

    it('sets custom data', () => {
      const data = { id: 1, name: 'Test' };
      const response = new SuccessResponse('OK', data);

      expect(response.data).toEqual({ id: 1, name: 'Test' });
    });

    it('sets custom status code', () => {
      const response = new SuccessResponse('Created', { id: 1 }, 201);

      expect(response.statusCode).toBe(201);
    });

    it('always sets status to "success"', () => {
      const r1 = new SuccessResponse();
      const r2 = new SuccessResponse('OK', null, 201);
      const r3 = new SuccessResponse('Done', { x: 1 }, 204);

      expect(r1.status).toBe('success');
      expect(r2.status).toBe('success');
      expect(r3.status).toBe('success');
    });

    it('handles null data explicitly', () => {
      const response = new SuccessResponse('OK', null);
      expect(response.data).toBeNull();
    });

    it('handles undefined data (defaults to null)', () => {
      const response = new SuccessResponse('OK', undefined);
      // undefined is not === null, but the default is null
      // When explicitly passing undefined, the default kicks in
      expect(response.data).toBeNull();
    });

    it('handles complex data objects', () => {
      const data = {
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
        pagination: { page: 1, total: 100 },
      };
      const response = new SuccessResponse('Users fetched', data);

      expect(response.data).toEqual(data);
    });

    it('handles array data', () => {
      const data = [1, 2, 3, 4, 5];
      const response = new SuccessResponse('Numbers', data);

      expect(response.data).toEqual([1, 2, 3, 4, 5]);
    });

    it('handles string data', () => {
      const response = new SuccessResponse('Token', 'jwt-token-string');

      expect(response.data).toBe('jwt-token-string');
    });
  });

  // ─── send() ───────────────────────────────────────────────────
  describe('send()', () => {
    it('calls res.status() with the correct status code', () => {
      const res = createMockResponse();
      const response = new SuccessResponse('OK', null, 200);

      response.send(res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('calls res.json() with the correct shape', () => {
      const res = createMockResponse();
      const data = { id: 42 };
      const response = new SuccessResponse('Found', data, 200);

      response.send(res);

      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Found',
        data: { id: 42 },
      });
    });

    it('sends default values correctly', () => {
      const res = createMockResponse();
      const response = new SuccessResponse();

      response.send(res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: null,
      });
    });

    it('sends 201 status code for creation responses', () => {
      const res = createMockResponse();
      const response = new SuccessResponse('Created', { id: 'new-1' }, 201);

      response.send(res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Created',
        data: { id: 'new-1' },
      });
    });

    it('returns the response object (for chaining)', () => {
      const res = createMockResponse();
      const response = new SuccessResponse();

      const result = response.send(res);

      // res.status().json() returns res, which is what send() returns
      expect(result).toBe(res);
    });

    it('calls status before json', () => {
      const res = createMockResponse();
      const callOrder: string[] = [];
      res.status = vi.fn(() => {
        callOrder.push('status');
        return res;
      });
      res.json = vi.fn(() => {
        callOrder.push('json');
        return res;
      });

      const response = new SuccessResponse('Test', null, 200);
      response.send(res);

      expect(callOrder).toEqual(['status', 'json']);
    });

    it('response JSON never includes statusCode field', () => {
      const res = createMockResponse();
      const response = new SuccessResponse('OK', null, 200);

      response.send(res);

      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg).not.toHaveProperty('statusCode');
    });

    it('sends null data when data is null', () => {
      const res = createMockResponse();
      const response = new SuccessResponse('No content', null);

      response.send(res);

      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg.data).toBeNull();
    });
  });
});
