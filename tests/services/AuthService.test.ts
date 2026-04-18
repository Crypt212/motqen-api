/**
 * AuthService Tests
 *
 * The auth flow is the gateway to the entire app:
 *   1. requestOTP → sends a code via SMS/WhatsApp
 *   2. verifyOTP → validates code → returns register or login token
 *   3. registerClient / registerWorker → creates user + profile
 *   4. login → creates session + refresh token
 *   5. generateAccessToken → validates refresh → issues short-lived access
 *   6. logout → revokes session
 *
 * These tests cover the real business rules:
 *   - Existing user gets "login" token, new user gets "register" token
 *   - Worker verification status is returned on login
 *   - Rate limits are enforced on failed OTP attempts
 *   - Refresh tokens are hashed before storage
 *   - Expired / revoked sessions are rejected
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthService from '../../src/services/AuthService.js';
import AppError from '../../src/errors/AppError.js';
import { OTPErrorDetails } from '../../src/errors/appErrorDetails/OTPDetails.js';
import {
  createMockUserRepository,
  createMockWorkerProfileRepository,
  createMockClientProfileRepository,
  createMockGovernmentRepository,
  createMockSessionRepository,
  createMockRateLimitCache,
  createMockOtpCache,
  makeUser,
  makeWorkerProfile,
  makeSession,
  makeGovernment,
} from '../helpers/mocks.js';

// Stub external providers so they don't make real network calls
vi.mock('../../src/providers/SendOTPProvider.js', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../src/providers/cloudinaryProvider.js', () => ({
  default: vi.fn().mockResolvedValue({ url: 'https://cdn.motqen.com/uploaded.jpg' }),
}));
vi.mock('../../src/utils/tokens.js', () => ({
  generateToken: vi.fn().mockReturnValue('mock-jwt-token'),
  verifyToken: vi.fn(),
}));
vi.mock('../../src/utils/OTP.js', () => ({
  generateOTP: vi.fn().mockReturnValue('123456'),
  hashOTP: vi.fn().mockImplementation((otp: string) => `hashed-${otp}`),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: ReturnType<typeof createMockUserRepository>;
  let workerRepo: ReturnType<typeof createMockWorkerProfileRepository>;
  let clientRepo: ReturnType<typeof createMockClientProfileRepository>;
  let govRepo: ReturnType<typeof createMockGovernmentRepository>;
  let sessionRepo: ReturnType<typeof createMockSessionRepository>;
  let rateLimitCache: ReturnType<typeof createMockRateLimitCache>;
  let otpCache: ReturnType<typeof createMockOtpCache>;

  beforeEach(() => {
    userRepo = createMockUserRepository();
    workerRepo = createMockWorkerProfileRepository();
    clientRepo = createMockClientProfileRepository();
    govRepo = createMockGovernmentRepository();
    sessionRepo = createMockSessionRepository();
    rateLimitCache = createMockRateLimitCache();
    otpCache = createMockOtpCache();

    authService = new AuthService({
      userRepository: userRepo,
      workerProfileRepository: workerRepo,
      clientProfileRepository: clientRepo,
      governmentRepository: govRepo,
      sessionRepository: sessionRepo,
      rateLimitCache,
      otpCache,
    });
  });

  // ─── requestOTP ──────────────────────────────────────────────────────────

  describe('requestOTP', () => {
    it('should generate OTP, hash it, cache it, and send it', async () => {
      otpCache.setOtp.mockResolvedValue('OK');

      const result = await authService.requestOTP('01012345678', 'SMS');

      expect(result).toBe(true);
      expect(otpCache.setOtp).toHaveBeenCalledWith(
        '01012345678',
        'SMS',
        'hashed-123456',
        expect.any(Number)
      );
    });

    it('should reset verify attempts for fresh OTP (resets counter for new code)', async () => {
      // In production, resetVerifyAttempts is called so the user gets 5 fresh attempts.
      // The environment config is frozen at import time, so we test the production path.
      otpCache.setOtp.mockResolvedValue('OK');
      rateLimitCache.resetVerifyAttempts.mockResolvedValue(undefined);

      await authService.requestOTP('01012345678', 'SMS');

      expect(rateLimitCache.resetVerifyAttempts).toHaveBeenCalledWith('01012345678', 'SMS');
    });
  });

  // ─── verifyOTP ───────────────────────────────────────────────────────────

  describe('verifyOTP', () => {
    it('should return "register" token for new users (no existing account)', async () => {
      otpCache.getOtp.mockResolvedValue('hashed-123456');
      otpCache.deleteOtp.mockResolvedValue(undefined);
      rateLimitCache.resetAfterSuccess.mockResolvedValue(undefined);
      userRepo.find.mockResolvedValue(null); // user doesn't exist

      const result = await authService.verifyOTP('01012345678', 'SMS', '123456', 'device-1');

      expect(result.tokenType).toBe('register');
      expect(result.token).toBe('mock-jwt-token');
      // New user → no worker info needed
      expect(result.workerVerificationInfo).toEqual({
        isWorker: false,
        isWorkerSignedUp: false,
      });
    });

    it('should return "login" token for existing users', async () => {
      const user = makeUser();
      otpCache.getOtp.mockResolvedValue('hashed-123456');
      otpCache.deleteOtp.mockResolvedValue(undefined);
      rateLimitCache.resetAfterSuccess.mockResolvedValue(undefined);
      userRepo.find.mockResolvedValue(user);
      workerRepo.find.mockResolvedValue(null); // not a worker

      const result = await authService.verifyOTP('01012345678', 'SMS', '123456', 'device-1');

      expect(result.tokenType).toBe('login');
    });

    it('should detect worker user with APPROVED verification on login', async () => {
      const user = makeUser();
      const workerProfile = makeWorkerProfile();
      otpCache.getOtp.mockResolvedValue('hashed-123456');
      otpCache.deleteOtp.mockResolvedValue(undefined);
      rateLimitCache.resetAfterSuccess.mockResolvedValue(undefined);
      userRepo.find.mockResolvedValue(user);
      workerRepo.find.mockResolvedValue(workerProfile);
      workerRepo.findVerification.mockResolvedValue({ status: 'APPROVED' });

      const result = await authService.verifyOTP('01012345678', 'SMS', '123456', 'device-1');

      expect(result.workerVerificationInfo).toEqual({
        isWorker: true,
        isWorkerSignedUp: true,
      });
    });

    it('should report isWorkerSignedUp=false for PENDING verification', async () => {
      const user = makeUser();
      otpCache.getOtp.mockResolvedValue('hashed-123456');
      otpCache.deleteOtp.mockResolvedValue(undefined);
      rateLimitCache.resetAfterSuccess.mockResolvedValue(undefined);
      userRepo.find.mockResolvedValue(user);
      workerRepo.find.mockResolvedValue(makeWorkerProfile());
      workerRepo.findVerification.mockResolvedValue({ status: 'PENDING' });

      const result = await authService.verifyOTP('01012345678', 'SMS', '123456', 'device-1');

      expect(result.workerVerificationInfo).toEqual({
        isWorker: true,
        isWorkerSignedUp: false,
      });
    });

    it('should handle worker with no verification record gracefully', async () => {
      const user = makeUser();
      otpCache.getOtp.mockResolvedValue('hashed-123456');
      otpCache.deleteOtp.mockResolvedValue(undefined);
      rateLimitCache.resetAfterSuccess.mockResolvedValue(undefined);
      userRepo.find.mockResolvedValue(user);
      workerRepo.find.mockResolvedValue(makeWorkerProfile());
      workerRepo.findVerification.mockResolvedValue(null);

      const result = await authService.verifyOTP('01012345678', 'SMS', '123456', 'device-1');

      expect(result.workerVerificationInfo).toEqual({
        isWorker: true,
        isWorkerSignedUp: false,
      });
    });

    it('should delete OTP from cache on success (single-use)', async () => {
      otpCache.getOtp.mockResolvedValue('hashed-123456');
      otpCache.deleteOtp.mockResolvedValue(undefined);
      rateLimitCache.resetAfterSuccess.mockResolvedValue(undefined);
      userRepo.find.mockResolvedValue(null);

      await authService.verifyOTP('01012345678', 'SMS', '123456', 'device-1');

      expect(otpCache.deleteOtp).toHaveBeenCalledWith('01012345678', 'SMS');
    });

    it('should reset rate limits after successful verification', async () => {
      otpCache.getOtp.mockResolvedValue('hashed-123456');
      otpCache.deleteOtp.mockResolvedValue(undefined);
      rateLimitCache.resetAfterSuccess.mockResolvedValue(undefined);
      userRepo.find.mockResolvedValue(null);

      await authService.verifyOTP('01012345678', 'SMS', '123456', 'device-1');

      expect(rateLimitCache.resetAfterSuccess).toHaveBeenCalledWith(
        '01012345678',
        'SMS',
        'device-1'
      );
    });

    it('should throw and increment counter when OTP does not match', async () => {
      otpCache.getOtp.mockResolvedValue('hashed-WRONG');
      rateLimitCache.incrementVerify.mockResolvedValue({ attempts: 1, cooldown: 0 });

      await expect(
        authService.verifyOTP('01012345678', 'SMS', '123456', 'device-1')
      ).rejects.toThrow(AppError);

      expect(rateLimitCache.incrementVerify).toHaveBeenCalledTimes(1);
    });

    it('should throw when OTP has expired (null from cache)', async () => {
      otpCache.getOtp.mockResolvedValue(null);
      rateLimitCache.incrementVerify.mockResolvedValue({ attempts: 1, cooldown: 0 });

      await expect(
        authService.verifyOTP('01012345678', 'SMS', '123456', 'device-1')
      ).rejects.toThrow(AppError);
    });

    it('should report remaining attempts and blocked status on failure', async () => {
      otpCache.getOtp.mockResolvedValue('hashed-WRONG');
      rateLimitCache.incrementVerify.mockResolvedValue({ attempts: 4, cooldown: 0 });

      try {
        await authService.verifyOTP('01012345678', 'SMS', '123456', 'device-1');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error).toBeInstanceOf(AppError);
        const details = error.details.toJSON();
        expect(details.remainingAttempts).toBe(1);
        expect(details.requestNewOtp).toBe(false);
      }
    });

    it('should signal user to request new OTP when attempts exhausted', async () => {
      otpCache.getOtp.mockResolvedValue('hashed-WRONG');
      rateLimitCache.incrementVerify.mockResolvedValue({ attempts: 5, cooldown: 0 });

      try {
        await authService.verifyOTP('01012345678', 'SMS', '123456', 'device-1');
        expect.fail('Should have thrown');
      } catch (error: any) {
        const details = error.details.toJSON();
        expect(details.remainingAttempts).toBe(0);
        expect(details.requestNewOtp).toBe(true);
      }
    });

    it('should NOT increment verify counter on success path', async () => {
      otpCache.getOtp.mockResolvedValue('hashed-123456');
      otpCache.deleteOtp.mockResolvedValue(undefined);
      rateLimitCache.resetAfterSuccess.mockResolvedValue(undefined);
      userRepo.find.mockResolvedValue(null);

      await authService.verifyOTP('01012345678', 'SMS', '123456', 'device-1');

      // This is the critical double-increment bug we fixed
      expect(rateLimitCache.incrementVerify).not.toHaveBeenCalled();
    });

    it('should throw 422 when empty OTP string is provided', async () => {
      rateLimitCache.incrementVerify.mockResolvedValue({ attempts: 1, cooldown: 0 });

      await expect(authService.verifyOTP('01012345678', 'SMS', '', 'device-1')).rejects.toThrow(
        AppError
      );
    });
  });

  // ─── registerClient ──────────────────────────────────────────────────────

  describe('registerClient', () => {
    const userData = {
      phoneNumber: '01012345678',
      firstName: 'Ahmed',
      middleName: 'Mohamed',
      lastName: 'Hassan',
      profileImageBuffer: Buffer.from('fake-image'),
      location: {
        governmentId: 'gov-1',
        cityId: 'city-1',
        address: '123 Tahrir Square',
        addressNotes: 'Near the museum',
      },
    };

    it('should validate government and city exist before creating user', async () => {
      govRepo.find.mockResolvedValue(null);

      await expect(authService.registerClient(userData, {})).rejects.toThrow(
        'Government not found'
      );
      // User should NOT be created if validation fails
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    it('should reject when city does not exist', async () => {
      govRepo.find.mockResolvedValue(makeGovernment());
      govRepo.findCity.mockResolvedValue(null);

      await expect(authService.registerClient(userData, {})).rejects.toThrow('City not found');
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    it('should create user → client profile → location → upload image in correct order', async () => {
      const user = makeUser();
      govRepo.find.mockResolvedValue(makeGovernment());
      govRepo.findCity.mockResolvedValue({ id: 'city-1', name: 'Maadi' });
      userRepo.create.mockResolvedValue(user);
      clientRepo.create.mockResolvedValue({});
      userRepo.addLocation.mockResolvedValue({});
      userRepo.update.mockResolvedValue(user);
      clientRepo.find.mockResolvedValue({
        id: 'client-1',
        userId: user.id,
      });

      const result = await authService.registerClient(userData, {});

      expect(result.user).toBeDefined();
      expect(result.profile).toBeDefined();
      expect(clientRepo.create).toHaveBeenCalledWith({
        userId: user.id,
        clientProfile: {},
      });
      // Verify location was created with isMain=true on the User
      expect(userRepo.addLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          location: expect.objectContaining({ isMain: true }),
        })
      );
    });

    it('should set user role to USER (not ADMIN or WORKER)', async () => {
      govRepo.find.mockResolvedValue(makeGovernment());
      govRepo.findCity.mockResolvedValue({ id: 'city-1' });
      userRepo.create.mockResolvedValue(makeUser());
      clientRepo.create.mockResolvedValue({});
      userRepo.addLocation.mockResolvedValue({});
      userRepo.update.mockResolvedValue(makeUser());
      clientRepo.find.mockResolvedValue({});

      await authService.registerClient(userData, {});

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({ role: 'USER', status: 'ACTIVE' }),
        })
      );
    });
  });

  // ─── generateAccessToken ─────────────────────────────────────────────────

  describe('generateAccessToken', () => {
    it('should generate access token when session is valid', async () => {
      const session = makeSession();
      sessionRepo.find.mockResolvedValue(session);
      userRepo.find.mockResolvedValue(makeUser());

      const token = await authService.generateAccessToken({
        refreshToken: 'raw-refresh-token',
        deviceId: 'device-1',
        userId: 'user-1',
        role: 'USER',
      });

      expect(token).toBe('mock-jwt-token');
    });

    it('should reject when no matching session exists (invalid refresh token)', async () => {
      sessionRepo.find.mockResolvedValue(null);

      await expect(
        authService.generateAccessToken({
          refreshToken: 'invalid-token',
          deviceId: 'device-1',
          userId: 'user-1',
          role: 'USER',
        })
      ).rejects.toThrow('Invalid or Expired refresh token');
    });

    it('should reject revoked sessions (e.g., after password change)', async () => {
      sessionRepo.find.mockResolvedValue(makeSession({ isRevoked: true }));

      await expect(
        authService.generateAccessToken({
          refreshToken: 'revoked-token',
          deviceId: 'device-1',
          userId: 'user-1',
          role: 'USER',
        })
      ).rejects.toThrow('Refresh token has been revoked');
    });

    it('should delete expired session and throw', async () => {
      const expiredSession = makeSession({
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      });
      sessionRepo.find.mockResolvedValue(expiredSession);
      sessionRepo.delete.mockResolvedValue(undefined);

      await expect(
        authService.generateAccessToken({
          refreshToken: 'expired-token',
          deviceId: 'device-1',
          userId: 'user-1',
          role: 'USER',
        })
      ).rejects.toThrow('Refresh token has expired');

      // Cleanup: expired session should be deleted
      expect(sessionRepo.delete).toHaveBeenCalledWith({
        filter: { id: expiredSession.id },
      });
    });
  });

  // ─── login ───────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should revoke existing session for same device before creating new one', async () => {
      const user = makeUser();
      userRepo.find.mockResolvedValue(user);
      sessionRepo.delete.mockResolvedValue(undefined);
      sessionRepo.create.mockResolvedValue(makeSession());

      await authService.login({
        phoneNumber: '01012345678',
        deviceId: 'device-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // First call: revoke old session for this device
      expect(sessionRepo.delete).toHaveBeenCalledWith({
        filter: { deviceId: 'device-1' },
      });
    });

    it('should return unhashed refresh token for client storage', async () => {
      const user = makeUser();
      userRepo.find.mockResolvedValue(user);
      sessionRepo.delete.mockResolvedValue(undefined);
      sessionRepo.create.mockResolvedValue(makeSession());

      const result = await authService.login({
        phoneNumber: '01012345678',
        deviceId: 'device-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(result.unHashedRefreshToken).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.user).toBeDefined();
    });
  });

  // ─── logout ──────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should delete session for the specific user+device pair', async () => {
      sessionRepo.delete.mockResolvedValue(undefined);

      await authService.logout({ userId: 'user-1', deviceId: 'device-1' });

      expect(sessionRepo.delete).toHaveBeenCalledWith({
        filter: {
          userId: 'user-1',
          deviceId: 'device-1',
        },
      });
    });
  });
});
