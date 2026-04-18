/**
 * RateLimitService Tests
 *
 * Rate limiting guards the OTP system from abuse:
 *   - Phone-level cooldown: prevents spamming OTPs to one number
 *   - Device-level cooldown: prevents scripts from mass-sending from one device
 *   - Verify attempt limit: 5 attempts per OTP code lifetime
 *   - Escalating cooldowns: 30s → 60s → 5min → 15min → 1h → 24h
 */

import { describe, it, expect, beforeEach } from 'vitest';
import RateLimitService from '../../src/services/RateLimitService.js';
import AppError from '../../src/errors/AppError.js';
import { createMockRateLimitCache } from '../helpers/mocks.js';

describe('RateLimitService', () => {
  let rateLimitService: RateLimitService;
  let cache: ReturnType<typeof createMockRateLimitCache>;

  beforeEach(() => {
    cache = createMockRateLimitCache();
    rateLimitService = new RateLimitService({ rateLimitCache: cache });
  });

  describe('checkSendOtp', () => {
    it('should pass when neither phone nor device is on cooldown', async () => {
      cache.isSendOnCooldown.mockResolvedValue(false);
      cache.isDeviceOnCooldown.mockResolvedValue(false);

      // Should not throw
      await rateLimitService.checkSendOtp('01012345678', 'SMS', 'device-1');
    });

    it('should throw 429 when phone is on cooldown', async () => {
      cache.isSendOnCooldown.mockResolvedValue(true);
      cache.isDeviceOnCooldown.mockResolvedValue(false);
      cache.getSendCooldownTTL.mockResolvedValue(25);

      try {
        await rateLimitService.checkSendOtp('01012345678', 'SMS', 'device-1');
        expect.fail('Should have thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(429);
        expect(err.message).toContain('25 seconds');
      }
    });

    it('should throw 429 when device is on cooldown (even if phone is not)', async () => {
      cache.isSendOnCooldown.mockResolvedValue(false);
      cache.isDeviceOnCooldown.mockResolvedValue(true);
      cache.getSendCooldownTTL.mockResolvedValue(60);

      await expect(rateLimitService.checkSendOtp('01012345678', 'SMS', 'device-1')).rejects.toThrow(
        'Too many requests'
      );
    });

    it('should include retryAfter in error details', async () => {
      cache.isSendOnCooldown.mockResolvedValue(true);
      cache.isDeviceOnCooldown.mockResolvedValue(false);
      cache.getSendCooldownTTL.mockResolvedValue(300);

      try {
        await rateLimitService.checkSendOtp('01012345678', 'SMS', 'device-1');
        expect.fail('Should have thrown');
      } catch (err: any) {
        const details = err.details.toJSON();
        expect(details.type).toBe('TOO_MANY_VERIFICATION_REQUESTS');
        expect(details.retryAfter).toBe(300);
      }
    });
  });

  describe('checkVerify', () => {
    it('should pass when under attempt limit', async () => {
      cache.getVerifyAttempts.mockResolvedValue(4);

      await rateLimitService.checkVerify('01012345678', 'SMS');
      // No throw
    });

    it('should throw 429 when attempts >= 5', async () => {
      cache.getVerifyAttempts.mockResolvedValue(5);

      try {
        await rateLimitService.checkVerify('01012345678', 'SMS');
        expect.fail('Should have thrown');
      } catch (err: any) {
        expect(err.statusCode).toBe(429);
        const details = err.details.toJSON();
        expect(details.remainingAttempts).toBe(0);
        expect(details.requestNewOtp).toBe(true);
      }
    });
  });

  describe('incrementVerify', () => {
    it('should return attempts, remaining, and blocked status', async () => {
      cache.incrementVerify.mockResolvedValue({ attempts: 3, cooldown: 0 });

      const result = await rateLimitService.incrementVerify('01012345678', 'SMS');

      expect(result).toEqual({
        attempts: 3,
        remaining: 2,
        blocked: false,
      });
    });

    it('should report blocked=true at 5 attempts', async () => {
      cache.incrementVerify.mockResolvedValue({ attempts: 5, cooldown: 0 });

      const result = await rateLimitService.incrementVerify('01012345678', 'SMS');

      expect(result.blocked).toBe(true);
      expect(result.remaining).toBe(0);
    });
  });
});
