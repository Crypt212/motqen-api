import { describe, it, expect } from 'vitest';

import { generateOTP, hashOTP } from '../../../src/utils/OTP.js';

describe('OTP utilities', () => {
  // ─── generateOTP ──────────────────────────────────────────────

  describe('generateOTP', () => {
    it('should return a string', () => {
      const otp = generateOTP();
      expect(typeof otp).toBe('string');
    });

    it('should return a 6-character string', () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(6);
    });

    it('should return only numeric characters', () => {
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should return a value in the range 100000-999999', () => {
      const otp = generateOTP();
      const num = parseInt(otp, 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    });

    it('should return 6-digit OTPs consistently across multiple calls', () => {
      for (let i = 0; i < 50; i++) {
        const otp = generateOTP();
        expect(otp).toMatch(/^\d{6}$/);
      }
    });

    it('should generate different values (statistical check)', () => {
      const otps = new Set<string>();
      for (let i = 0; i < 100; i++) {
        otps.add(generateOTP());
      }
      // With 900,000 possible values, 100 calls should yield many unique values.
      // Getting fewer than 2 unique values is astronomically unlikely.
      expect(otps.size).toBeGreaterThan(1);
      // In practice, all 100 should be unique — set a practical threshold.
      expect(otps.size).toBeGreaterThanOrEqual(90);
    });
  });

  // ─── hashOTP ──────────────────────────────────────────────────

  describe('hashOTP', () => {
    it('should return a string', () => {
      const hash = hashOTP('123456');
      expect(typeof hash).toBe('string');
    });

    it('should return a 64-character hex string (SHA-256)', () => {
      const hash = hashOTP('123456');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should be deterministic — same input produces same hash', () => {
      const hash1 = hashOTP('654321');
      const hash2 = hashOTP('654321');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = hashOTP('111111');
      const hash2 = hashOTP('222222');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce a known hash for a known input', () => {
      // SHA-256 of "123456" is well-known
      const expected = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';
      expect(hashOTP('123456')).toBe(expected);
    });

    it('should handle empty string input', () => {
      const hash = hashOTP('');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should handle non-numeric string input', () => {
      const hash = hashOTP('abcdef');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should produce a different hash when OTP differs by one character', () => {
      const hash1 = hashOTP('123456');
      const hash2 = hashOTP('123457');
      expect(hash1).not.toBe(hash2);
    });
  });

  // ─── Integration: generate + hash ─────────────────────────────

  describe('generate + hash integration', () => {
    it('should hash a generated OTP to a valid hex string', () => {
      const otp = generateOTP();
      const hash = hashOTP(otp);
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should produce a consistent hash for the same generated OTP', () => {
      const otp = generateOTP();
      const hash1 = hashOTP(otp);
      const hash2 = hashOTP(otp);
      expect(hash1).toBe(hash2);
    });
  });
});
