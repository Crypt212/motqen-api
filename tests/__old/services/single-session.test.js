/**
 * @fileoverview Tests for single session feature (global) in AuthService
 * @module tests/services/single-session
 */

import { jest } from '@jest/globals';
import { mockDeep } from 'jest-mock-extended';
import { Role } from '@prisma/client';
import AuthService from '../../src/services/AuthService.js';
import AppError from '../../src/errors/AppError.js';

describe('AuthService - single session (global)', () => {
  const baseDeps = () => {
    return {
      userRepository: mockDeep(),
      workerRepository: mockDeep(),
      clientRepository: mockDeep(),
      governmentRepository: mockDeep(),
      otpCache: mockDeep(),
      sessionRepository: mockDeep(),
      rateLimitCache: mockDeep(),
    };
  };

  test('login revokes all existing sessions for the user (global single session)', async () => {
    const deps = baseDeps();

    const user = { id: 'user-1', phoneNumber: '01000000000', role: Role.USER };
    deps.userRepository.findFirst.mockResolvedValue(user);
    deps.sessionRepository.revokeAllForUser.mockResolvedValue({ count: 2 });
    deps.sessionRepository.create.mockImplementation(async (data) => ({
      id: 'session-1',
      deviceId: data?.deviceId ?? '',
      isRevoked: data?.isRevoked ?? false,
      token: data?.token ?? '',
      ...(data ?? {}),
    }));

    const authService = new AuthService(deps);

    const result = await authService.login({
      phoneNumber: user.phoneNumber,
      deviceId: 'device-A',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    expect(deps.sessionRepository.revokeAllForUser).toHaveBeenCalledWith({
      userId: user.id,
      revokedBy: 'NEW_LOGIN',
    });

    expect(deps.sessionRepository.create).toHaveBeenCalled();
    const createArg = deps.sessionRepository.create.mock.calls[0][0];

    expect(createArg.deviceId).toBe('device-A');
    expect(createArg.isRevoked).toBe(false);
    expect(typeof createArg.token).toBe('string');
    expect(createArg.token).not.toBe(result.unHashedRefreshToken);

    expect(typeof result.unHashedRefreshToken).toBe('string');
    expect(result.unHashedRefreshToken.length).toBeGreaterThan(10);
  });

  test('generateAccessToken rejects revoked refresh token (old session after new login)', async () => {
    const deps = baseDeps();

    const user = { id: 'user-1', phoneNumber: '01000000000', role: Role.USER };
    deps.userRepository.findFirst.mockResolvedValue(user);

    deps.sessionRepository.findFirst.mockResolvedValue({
      id: 'session-old',
      isRevoked: true,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const authService = new AuthService(deps);

    await expect(
      authService.generateAccessToken({
        refreshToken: 'refresh-token-old',
        deviceId: 'device-A',
        userId: user.id,
        role: user.role,
      })
    ).rejects.toEqual(expect.any(AppError));

    await expect(
      authService.generateAccessToken({
        refreshToken: 'refresh-token-old',
        deviceId: 'device-A',
        userId: user.id,
        role: user.role,
      })
    ).rejects.toMatchObject({
      message: 'Refresh token has been revoked',
      statusCode: 400,
    });
  });

  test('generateAccessToken returns access token for valid refresh session', async () => {
    const deps = baseDeps();

    const user = { id: 'user-1', phoneNumber: '01000000000', role: Role.USER };
    deps.userRepository.findFirst.mockResolvedValue(user);

    deps.sessionRepository.findFirst.mockResolvedValue({
      id: 'session-active',
      isRevoked: false,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const authService = new AuthService(deps);

    const accessToken = await authService.generateAccessToken({
      refreshToken: 'refresh-token-new',
      deviceId: 'device-A',
      userId: user.id,
      role: user.role,
    });

    expect(typeof accessToken).toBe('string');
    expect(accessToken.length).toBeGreaterThan(10);
  });

  test('logout revokes active session for given device', async () => {
    const deps = baseDeps();
    deps.sessionRepository.updateMany.mockResolvedValue({ count: 1 });

    const authService = new AuthService(deps);

    await authService.logout('user-1', 'device-A');

    expect(deps.sessionRepository.updateMany).toHaveBeenCalledWith(
      { userId: 'user-1', deviceId: 'device-A', isRevoked: false },
      expect.objectContaining({
        isRevoked: true,
        revokedBy: 'LOGOUT',
      })
    );
  });
});
