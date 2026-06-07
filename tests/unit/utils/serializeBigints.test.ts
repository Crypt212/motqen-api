import { describe, it, expect } from 'vitest';

import { serializeBigints } from '../../../src/utils/serializeBigints.js';

describe('serializeBigints', () => {
  // ── Basic BigInt conversion ──

  describe('basic BigInt → string conversion', () => {
    it('should convert a single BigInt property to a string', () => {
      const input = { amount: BigInt(12345) };
      const result = serializeBigints(input);
      expect(result).toEqual({ amount: '12345' });
    });

    it('should convert multiple BigInt properties', () => {
      const input = { a: BigInt(1), b: BigInt(2), c: BigInt(3) };
      const result = serializeBigints(input);
      expect(result).toEqual({ a: '1', b: '2', c: '3' });
    });

    it('should convert BigInt zero', () => {
      const result = serializeBigints({ val: BigInt(0) });
      expect(result).toEqual({ val: '0' });
    });

    it('should convert negative BigInt', () => {
      const result = serializeBigints({ val: BigInt(-9999) });
      expect(result).toEqual({ val: '-9999' });
    });

    it('should convert very large BigInt values', () => {
      const big = BigInt('9999999999999999999999999999');
      const result = serializeBigints({ val: big });
      expect(result).toEqual({ val: '9999999999999999999999999999' });
    });
  });

  // ── Nested objects ──

  describe('nested objects', () => {
    it('should convert BigInts in nested objects', () => {
      const input = {
        level1: {
          level2: {
            amount: BigInt(500),
          },
        },
      };
      const result = serializeBigints(input);
      expect(result).toEqual({
        level1: {
          level2: {
            amount: '500',
          },
        },
      });
    });

    it('should handle mixed types in nested objects', () => {
      const input = {
        name: 'test',
        details: {
          count: 42,
          total: BigInt(100),
          active: true,
        },
      };
      const result = serializeBigints(input);
      expect(result).toEqual({
        name: 'test',
        details: {
          count: 42,
          total: '100',
          active: true,
        },
      });
    });
  });

  // ── Arrays ──

  describe('arrays', () => {
    it('should convert BigInts inside arrays', () => {
      const input = { items: [BigInt(1), BigInt(2), BigInt(3)] };
      const result = serializeBigints(input);
      expect(result).toEqual({ items: ['1', '2', '3'] });
    });

    it('should convert BigInts inside arrays of objects', () => {
      const input = {
        orders: [
          { id: 1, amount: BigInt(100) },
          { id: 2, amount: BigInt(200) },
        ],
      };
      const result = serializeBigints(input);
      expect(result).toEqual({
        orders: [
          { id: 1, amount: '100' },
          { id: 2, amount: '200' },
        ],
      });
    });

    it('should handle top-level array', () => {
      const input = [{ val: BigInt(1) }, { val: BigInt(2) }];
      const result = serializeBigints(input);
      expect(result).toEqual([{ val: '1' }, { val: '2' }]);
    });

    it('should handle deeply nested arrays', () => {
      const input = { a: [{ b: [{ c: BigInt(42) }] }] };
      const result = serializeBigints(input);
      expect(result).toEqual({ a: [{ b: [{ c: '42' }] }] });
    });
  });

  // ── Preserving non-BigInt values ──

  describe('preserving non-BigInt values', () => {
    it('should preserve strings', () => {
      const input = { name: 'hello' };
      expect(serializeBigints(input)).toEqual({ name: 'hello' });
    });

    it('should preserve numbers', () => {
      const input = { count: 42 };
      expect(serializeBigints(input)).toEqual({ count: 42 });
    });

    it('should preserve booleans', () => {
      const input = { active: true, deleted: false };
      expect(serializeBigints(input)).toEqual({ active: true, deleted: false });
    });

    it('should preserve null values', () => {
      const input = { value: null };
      expect(serializeBigints(input)).toEqual({ value: null });
    });

    it('should handle mixed BigInt and non-BigInt properties', () => {
      const input = {
        id: 'abc',
        amount: BigInt(500),
        count: 10,
        active: true,
        meta: null,
      };
      const result = serializeBigints(input);
      expect(result).toEqual({
        id: 'abc',
        amount: '500',
        count: 10,
        active: true,
        meta: null,
      });
    });
  });

  // ── Edge cases ──

  describe('edge cases', () => {
    it('should handle empty object', () => {
      expect(serializeBigints({})).toEqual({});
    });

    it('should handle empty array', () => {
      expect(serializeBigints([])).toEqual([]);
    });

    it('should handle null input', () => {
      expect(serializeBigints(null)).toBeNull();
    });

    it('should handle primitive string input', () => {
      expect(serializeBigints('hello')).toBe('hello');
    });

    it('should handle primitive number input', () => {
      expect(serializeBigints(42)).toBe(42);
    });

    it('should handle boolean input', () => {
      expect(serializeBigints(true)).toBe(true);
    });

    it('should drop undefined values (JSON.stringify behavior)', () => {
      const input = { a: BigInt(1), b: undefined };
      const result = serializeBigints(input);
      expect(result).toEqual({ a: '1' });
      expect('b' in result).toBe(false);
    });
  });
});
