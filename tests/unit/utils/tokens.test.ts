import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment config before importing tokens module
vi.mock('../../../src/configs/environment.js', () => ({
  default: {
    jwt: {
      access: { secret: 'test-access-secret-32chars-long!!', expiresIn: '1h' },
      refresh: { secret: 'test-refresh-secret-32chars-long!', expiresIn: '7d' },
      login: { secret: 'test-login-secret-32chars-longgg', expiresIn: '5m' },
      register: { secret: 'test-register-secret-32chars-lg!', expiresIn: '5m' },
    },
  },
}));

// Mock OperationalError (parent of AppError)
vi.mock('../../../src/errors/OperationalError.js', () => ({
  default: class OperationalError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'OperationalError';
    }
  },
}));

// Mock the domain imports that token types reference
vi.mock('../../../src/generated/prisma/client.js', () => ({
  $Enums: {
    AccountStatus: { ACTIVE: 'ACTIVE' },
    Role: { CLIENT: 'CLIENT', WORKER: 'WORKER', ADMIN: 'ADMIN' },
    VerificationStatus: { PENDING: 'PENDING' },
  },
}));

vi.mock('../../../src/generated/prisma/enums.js', () => ({}));

import { generateToken, verifyAndDecodeToken, verifyHeaderToken } from '../../../src/utils/tokens.js';
import AppError from '../../../src/errors/AppError.js';

describe('Token Utilities', () => {
  // ─── generateToken ────────────────────────────────────────────
  describe('generateToken', () => {
    it('generates a JWT string for access token payload', () => {
      const token = generateToken({
        type: 'access',
        phoneNumber: '+201012345678',
        userId: 'user-123',
        role: 'CLIENT' as any,
      });

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('generates a JWT string for refresh token payload', () => {
      const token = generateToken({
        type: 'refresh',
        phoneNumber: '+201012345678',
        userId: 'user-123',
        role: 'CLIENT' as any,
      });

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('generates a JWT string for login token payload', () => {
      const token = generateToken({
        type: 'login',
        phoneNumber: '+201012345678',
      });

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('generates a JWT string for register token payload', () => {
      const token = generateToken({
        type: 'register',
        phoneNumber: '+201012345678',
      });

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('generates different tokens for access vs refresh with same data', () => {
      const accessToken = generateToken({
        type: 'access',
        phoneNumber: '+201012345678',
        userId: 'user-123',
        role: 'CLIENT' as any,
      });

      const refreshToken = generateToken({
        type: 'refresh',
        phoneNumber: '+201012345678',
        userId: 'user-123',
        role: 'CLIENT' as any,
      });

      // Different secrets → different tokens
      expect(accessToken).not.toBe(refreshToken);
    });

    it('generates different tokens for different payloads', () => {
      const token1 = generateToken({
        type: 'login',
        phoneNumber: '+201012345678',
      });

      const token2 = generateToken({
        type: 'login',
        phoneNumber: '+201098765432',
      });

      expect(token1).not.toBe(token2);
    });
  });

  // ─── verifyAndDecodeToken ─────────────────────────────────────
  describe('verifyAndDecodeToken', () => {
    it('returns decoded payload for a valid access token', () => {
      const payload = {
        type: 'access' as const,
        phoneNumber: '+201012345678',
        userId: 'user-abc',
        role: 'CLIENT' as any,
      };

      const token = generateToken(payload);
      const decoded = verifyAndDecodeToken(token, 'access');

      expect(decoded).toMatchObject({
        phoneNumber: '+201012345678',
        userId: 'user-abc',
      });
    });

    it('returns decoded payload for a valid refresh token', () => {
      const payload = {
        type: 'refresh' as const,
        phoneNumber: '+201012345678',
        userId: 'user-abc',
        role: 'WORKER' as any,
      };

      const token = generateToken(payload);
      const decoded = verifyAndDecodeToken(token, 'refresh');

      expect(decoded).toMatchObject({
        phoneNumber: '+201012345678',
        userId: 'user-abc',
      });
    });

    it('returns decoded payload for a valid login token', () => {
      const payload = {
        type: 'login' as const,
        phoneNumber: '+201012345678',
      };

      const token = generateToken(payload);
      const decoded = verifyAndDecodeToken(token, 'login');

      expect(decoded).toMatchObject({
        phoneNumber: '+201012345678',
      });
    });

    it('returns decoded payload for a valid register token', () => {
      const payload = {
        type: 'register' as const,
        phoneNumber: '+201012345678',
      };

      const token = generateToken(payload);
      const decoded = verifyAndDecodeToken(token, 'register');

      expect(decoded).toMatchObject({
        phoneNumber: '+201012345678',
      });
    });

    it('throws when verifying with wrong token type (access token verified as refresh)', () => {
      const token = generateToken({
        type: 'access' as const,
        phoneNumber: '+201012345678',
        userId: 'user-123',
        role: 'CLIENT' as any,
      });

      // Different secret → invalid signature
      expect(() => verifyAndDecodeToken(token, 'refresh')).toThrow();
    });

    it('throws when verifying with wrong token type (login token verified as register)', () => {
      const token = generateToken({
        type: 'login' as const,
        phoneNumber: '+201012345678',
      });

      expect(() => verifyAndDecodeToken(token, 'register')).toThrow();
    });

    it('throws for a tampered token', () => {
      const token = generateToken({
        type: 'access' as const,
        phoneNumber: '+201012345678',
        userId: 'user-123',
        role: 'CLIENT' as any,
      });

      const tamperedToken = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyAndDecodeToken(tamperedToken, 'access')).toThrow();
    });

    it('throws for a completely invalid token string', () => {
      expect(() => verifyAndDecodeToken('not.a.valid.token', 'access')).toThrow();
    });

    it('throws for an empty string token', () => {
      expect(() => verifyAndDecodeToken('', 'access')).toThrow();
    });

    it('error message includes the expected type name', () => {
      expect(() => verifyAndDecodeToken('garbage', 'access')).toThrow(/access/i);
    });
  });

  // ─── verifyHeaderToken ────────────────────────────────────────
  describe('verifyHeaderToken', () => {
    it('returns decoded payload from valid "Bearer <token>" header', () => {
      const payload = {
        type: 'access' as const,
        phoneNumber: '+201012345678',
        userId: 'user-xyz',
        role: 'CLIENT' as any,
      };

      const token = generateToken(payload);
      const decoded = verifyHeaderToken(`Bearer ${token}`, 'access');

      expect(decoded).toMatchObject({
        phoneNumber: '+201012345678',
        userId: 'user-xyz',
      });
    });

    it('throws AppError 401 for empty string', () => {
      expect(() => verifyHeaderToken('', 'access')).toThrow(AppError);

      try {
        verifyHeaderToken('', 'access');
      } catch (e: any) {
        expect(e).toBeInstanceOf(AppError);
        expect(e.statusCode).toBe(401);
      }
    });

    it('throws AppError 401 when no Bearer prefix', () => {
      const token = generateToken({
        type: 'access' as const,
        phoneNumber: '+201012345678',
        userId: 'user-123',
        role: 'CLIENT' as any,
      });

      // No "Bearer " prefix → split(' ')[1] is undefined
      expect(() => verifyHeaderToken(token, 'access')).toThrow(AppError);

      try {
        verifyHeaderToken(token, 'access');
      } catch (e: any) {
        expect(e.statusCode).toBe(401);
      }
    });

    it('throws AppError 401 for "Bearer " with no token after it', () => {
      // "Bearer " split by space → [1] is empty string which is falsy
      // Actually "Bearer ".split(' ')[1] is '' which is falsy
      expect(() => verifyHeaderToken('Bearer ', 'access')).toThrow();
    });

    it('throws for an invalid token after Bearer', () => {
      expect(() => verifyHeaderToken('Bearer invalidtoken', 'access')).toThrow();
    });
  });

  // ─── Round-trip Tests ─────────────────────────────────────────
  describe('Round-trip: generate → verify → decode', () => {
    it('access token round-trip preserves payload data', () => {
      const original = {
        type: 'access' as const,
        phoneNumber: '+201099887766',
        userId: 'round-trip-user',
        role: 'ADMIN' as any,
      };

      const token = generateToken(original);
      const decoded = verifyAndDecodeToken(token, 'access');

      expect(decoded.phoneNumber).toBe(original.phoneNumber);
      expect(decoded.userId).toBe(original.userId);
      expect(decoded.type).toBe(original.type);
    });

    it('refresh token round-trip preserves payload data', () => {
      const original = {
        type: 'refresh' as const,
        phoneNumber: '+201055443322',
        userId: 'refresh-user',
        role: 'WORKER' as any,
      };

      const token = generateToken(original);
      const decoded = verifyAndDecodeToken(token, 'refresh');

      expect(decoded.phoneNumber).toBe(original.phoneNumber);
      expect(decoded.userId).toBe(original.userId);
    });

    it('login token round-trip preserves phone number', () => {
      const original = {
        type: 'login' as const,
        phoneNumber: '+201066778899',
      };

      const token = generateToken(original);
      const decoded = verifyAndDecodeToken(token, 'login');

      expect(decoded.phoneNumber).toBe(original.phoneNumber);
    });

    it('register token round-trip preserves phone number', () => {
      const original = {
        type: 'register' as const,
        phoneNumber: '+201011223344',
      };

      const token = generateToken(original);
      const decoded = verifyAndDecodeToken(token, 'register');

      expect(decoded.phoneNumber).toBe(original.phoneNumber);
    });

    it('header token round-trip preserves payload data', () => {
      const original = {
        type: 'access' as const,
        phoneNumber: '+201012345678',
        userId: 'header-user',
        role: 'CLIENT' as any,
      };

      const token = generateToken(original);
      const decoded = verifyHeaderToken(`Bearer ${token}`, 'access');

      expect(decoded.phoneNumber).toBe(original.phoneNumber);
      expect(decoded.userId).toBe(original.userId);
    });
  });
});
