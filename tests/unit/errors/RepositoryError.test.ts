import { describe, it, expect } from 'vitest';
import RepositoryError, { RepositoryErrorType } from '../../../src/errors/RepositoryError.js';

describe('RepositoryError', () => {
  // ─── Constructor ──────────────────────────────────────────────
  describe('constructor', () => {
    it('creates an error with message and code', () => {
      const error = new RepositoryError('Query failed', RepositoryErrorType.DATABASE_ERROR);

      expect(error.message).toBe('Query failed');
      expect(error.code).toBe(RepositoryErrorType.DATABASE_ERROR);
    });

    it('defaults code to DATABASE_ERROR when not provided', () => {
      const error = new RepositoryError('Something went wrong');

      expect(error.code).toBe(RepositoryErrorType.DATABASE_ERROR);
    });
  });

  // ─── Inheritance ──────────────────────────────────────────────
  describe('inheritance', () => {
    it('is an instance of Error', () => {
      const error = new RepositoryError('Test');
      expect(error).toBeInstanceOf(Error);
    });

    it('is an instance of RepositoryError', () => {
      const error = new RepositoryError('Test');
      expect(error).toBeInstanceOf(RepositoryError);
    });
  });

  // ─── All RepositoryErrorType enum values ──────────────────────
  describe('RepositoryErrorType enum values', () => {
    it('DATABASE_ERROR is a valid enum value', () => {
      const error = new RepositoryError('DB error', RepositoryErrorType.DATABASE_ERROR);
      expect(error.code).toBe(RepositoryErrorType.DATABASE_ERROR);
    });

    it('DUPLICATE_KEY is a valid enum value', () => {
      const error = new RepositoryError('Duplicate', RepositoryErrorType.DUPLICATE_KEY);
      expect(error.code).toBe(RepositoryErrorType.DUPLICATE_KEY);
    });

    it('NOT_FOUND is a valid enum value', () => {
      const error = new RepositoryError('Not found', RepositoryErrorType.NOT_FOUND);
      expect(error.code).toBe(RepositoryErrorType.NOT_FOUND);
    });

    it('ALREADY_EXISTS is a valid enum value', () => {
      const error = new RepositoryError('Exists', RepositoryErrorType.ALREADY_EXISTS);
      expect(error.code).toBe(RepositoryErrorType.ALREADY_EXISTS);
    });

    it('INVALID is a valid enum value', () => {
      const error = new RepositoryError('Invalid data', RepositoryErrorType.INVALID);
      expect(error.code).toBe(RepositoryErrorType.INVALID);
    });

    it('all enum values are distinct', () => {
      const values = [
        RepositoryErrorType.DATABASE_ERROR,
        RepositoryErrorType.DUPLICATE_KEY,
        RepositoryErrorType.NOT_FOUND,
        RepositoryErrorType.ALREADY_EXISTS,
        RepositoryErrorType.INVALID,
      ];
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('enum has exactly 5 members', () => {
      // Numeric enums in TS have reverse mappings, so filter to only string keys
      const keys = Object.keys(RepositoryErrorType).filter(
        (k) => isNaN(Number(k))
      );
      expect(keys).toHaveLength(5);
    });
  });

  // ─── Stack Trace ──────────────────────────────────────────────
  describe('stack trace', () => {
    it('has a stack trace', () => {
      const error = new RepositoryError('Stack test');
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });

    it('stack trace contains the error message', () => {
      const error = new RepositoryError('Unique repo error');
      expect(error.stack).toContain('Unique repo error');
    });
  });

  // ─── Message Preservation ─────────────────────────────────────
  describe('message preservation', () => {
    it('preserves empty string message', () => {
      const error = new RepositoryError('');
      expect(error.message).toBe('');
    });

    it('preserves long message', () => {
      const longMessage = 'x'.repeat(500);
      const error = new RepositoryError(longMessage);
      expect(error.message).toBe(longMessage);
    });

    it('preserves special characters in message', () => {
      const msg = 'Error: "table" doesn\'t exist (schema.users)';
      const error = new RepositoryError(msg);
      expect(error.message).toBe(msg);
    });
  });
});
