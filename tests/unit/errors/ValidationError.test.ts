import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';

// Mock the libs/zod.js re-export to just use real zod
vi.mock('../../../src/libs/zod.js', () => ({ z }));

// Mock OperationalError (parent of ValidationError)
vi.mock('../../../src/errors/OperationalError.js', () => ({
  default: class OperationalError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'OperationalError';
      Error.captureStackTrace(this, this.constructor);
    }
  },
}));

import ValidationError from '../../../src/errors/ValidationError.js';
import OperationalError from '../../../src/errors/OperationalError.js';

/** Helper: create a real ZodError from a failed parse */
function createZodError(schema: z.ZodType, input: unknown): z.ZodError {
  const result = schema.safeParse(input);
  if (result.success) {
    throw new Error('Expected validation to fail but it succeeded');
  }
  return result.error;
}

describe('ValidationError', () => {
  // ─── Constructor ──────────────────────────────────────────────
  describe('constructor', () => {
    it('creates with message and ZodError', () => {
      const schema = z.object({ name: z.string() });
      const zodError = createZodError(schema, { name: 123 });

      const error = new ValidationError('Validation failed', zodError);

      expect(error.message).toBe('Validation failed');
      expect(error.issues).toBeDefined();
      expect(Array.isArray(error.issues)).toBe(true);
    });

    it('stores the issues array from ZodError', () => {
      const schema = z.object({ name: z.string() });
      const zodError = createZodError(schema, { name: 123 });

      const error = new ValidationError('Invalid input', zodError);

      expect(error.issues.length).toBeGreaterThan(0);
    });

    it('issues contain path information', () => {
      const schema = z.object({ email: z.string().email() });
      const zodError = createZodError(schema, { email: 'not-an-email' });

      const error = new ValidationError('Bad email', zodError);

      const issue = error.issues[0];
      expect(issue).toHaveProperty('path');
    });
  });

  // ─── Multiple Issues ──────────────────────────────────────────
  describe('multiple issues', () => {
    it('captures multiple validation errors', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().min(0),
      });

      const zodError = createZodError(schema, { name: 123, age: -5 });
      const error = new ValidationError('Multiple errors', zodError);

      expect(error.issues.length).toBeGreaterThanOrEqual(2);
    });

    it('issues array matches the original ZodError issues', () => {
      const schema = z.object({ x: z.number() });
      const zodError = createZodError(schema, { x: 'hello' });

      const error = new ValidationError('Type mismatch', zodError);

      expect(error.issues).toEqual(zodError.issues);
    });
  });

  // ─── Inheritance ──────────────────────────────────────────────
  describe('inheritance', () => {
    it('is an instance of Error', () => {
      const schema = z.object({ a: z.string() });
      const zodError = createZodError(schema, { a: 1 });
      const error = new ValidationError('Test', zodError);

      expect(error).toBeInstanceOf(Error);
    });

    it('is an instance of OperationalError', () => {
      const schema = z.object({ a: z.string() });
      const zodError = createZodError(schema, { a: 1 });
      const error = new ValidationError('Test', zodError);

      expect(error).toBeInstanceOf(OperationalError);
    });

    it('is an instance of ValidationError', () => {
      const schema = z.object({ a: z.string() });
      const zodError = createZodError(schema, { a: 1 });
      const error = new ValidationError('Test', zodError);

      expect(error).toBeInstanceOf(ValidationError);
    });
  });

  // ─── toString ─────────────────────────────────────────────────
  describe('toString()', () => {
    it('includes the error message', () => {
      const schema = z.object({ name: z.string() });
      const zodError = createZodError(schema, { name: 42 });
      const error = new ValidationError('Validation failed', zodError);

      const str = error.toString();
      expect(str).toContain('Validation failed');
    });

    it('includes separator lines', () => {
      const schema = z.object({ name: z.string() });
      const zodError = createZodError(schema, { name: 42 });
      const error = new ValidationError('Test', zodError);

      const str = error.toString();
      expect(str).toContain('==========================================');
    });

    it('returns a non-empty string', () => {
      const schema = z.object({ id: z.number() });
      const zodError = createZodError(schema, { id: 'abc' });
      const error = new ValidationError('Parse error', zodError);

      expect(error.toString().length).toBeGreaterThan(0);
    });
  });

  // ─── Stack Trace ──────────────────────────────────────────────
  describe('stack trace', () => {
    it('has a stack trace', () => {
      const schema = z.object({ a: z.string() });
      const zodError = createZodError(schema, { a: 1 });
      const error = new ValidationError('Stack test', zodError);

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });

  // ─── Various Schema Types ────────────────────────────────────
  describe('various schema types', () => {
    it('handles string constraints', () => {
      const schema = z.string().min(5);
      const zodError = createZodError(schema, 'ab');
      const error = new ValidationError('Too short', zodError);

      expect(error.issues.length).toBeGreaterThan(0);
    });

    it('handles number constraints', () => {
      const schema = z.number().positive();
      const zodError = createZodError(schema, -10);
      const error = new ValidationError('Not positive', zodError);

      expect(error.issues.length).toBeGreaterThan(0);
    });

    it('handles nested object schemas', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number(),
        }),
      });
      const zodError = createZodError(schema, { user: { name: 123, age: 'old' } });
      const error = new ValidationError('Nested error', zodError);

      expect(error.issues.length).toBeGreaterThanOrEqual(2);
    });

    it('handles array schemas', () => {
      const schema = z.array(z.number());
      const zodError = createZodError(schema, ['a', 'b']);
      const error = new ValidationError('Array error', zodError);

      expect(error.issues.length).toBeGreaterThan(0);
    });

    it('handles enum schemas', () => {
      const schema = z.enum(['red', 'green', 'blue']);
      const zodError = createZodError(schema, 'yellow');
      const error = new ValidationError('Enum error', zodError);

      expect(error.issues.length).toBeGreaterThan(0);
    });
  });
});
