import prisma from "../libs/database.js";
import { Repository } from "./Repository.js";

/**
 * @fileoverview Session Repository - Handle database operations for sessions
 * @module repositories/SessionRepository
 * @extends {Repository}
 */
/**
 * Session Repository - Handles all database operations for sessions
 * @class
 * @extends Repository
 */
export default class SessionRepository extends Repository {
  /**
   * Create a new session
   * @async
   * @method create
   * @param {Object} data - Session creation data
   * @param {string} data.userId - User's ID
   * @param {string} data.fingerprint - Device fingerprint
   * @param {string} data.expiresAt - Expiration date
   * @param {string} data.hashedToken - Hashed refresh token
   * @returns {Promise<Object>} Created session
   */
  async create({ userId, fingerprint, expiresAt, hashedToken }) {
    const session = await prisma.session.create({
      data: {
        userId: userId,
        deviceFingerprint: fingerprint,
        expiresAt: expiresAt,
        createdAt: new Date(),
        isRevoked: false,
        token: hashedToken,
        lastUsedAt: new Date(),
      },
    });
    return session;
  }

  /**
   * Find a session by user ID, device fingerprint, and token
   * @async
   * @method find
   * @param {Object} params - Search parameters
   * @param {string} params.userId - User's ID
   * @param {string} params.deviceFingerprint - Device fingerprint
   * @param {string} params.hashedToken - Hashed token
   * @returns {Promise<Object|null>} Found session or null
   */
  async find({ userId, deviceFingerprint, hashedToken }) {
    const session = await prisma.session.findFirst({
      where: {
        userId,
        deviceFingerprint,
        token: hashedToken,
      },
    });
    return session;
  }

  /**
   * Revoke all sessions for a device fingerprint
   * @async
   * @method revokeSessionsForFingerprint
   * @param {string} fingerprint - Device fingerprint
   * @returns {Promise<void>}
   */
  async revokeSessionsForFingerprint(fingerprint) {
    await prisma.session.updateMany({
      where: {
        deviceFingerprint: fingerprint,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  /**
   * Revoke all sessions for a user
   * @async
   * @method revokeByUserID
   * @param {string} userId - User's ID
   * @returns {Promise<void>}
   */
  async revokeByUserID(userId) {
    await prisma.session.updateMany({
      where: {
        userId: userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  /**
   * Revoke a specific session by ID
   * @async
   * @method revokeBySessionID
   * @param {string} sessionId - Session's ID
   * @returns {Promise<void>}
   */
  async revokeBySessionID(sessionId) {
    await prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        isRevoked: true,

      },
    });
  }

  /**
   * Revoke sessions for a specific user and device
   * @async
   * @method revokeSessionsByFingerprintAndUserID
   * @param {string} userId - User's ID
   * @param {string} deviceFingerprint - Device fingerprint
   * @returns {Promise<void>}
   */
  async revokeSessionsByFingerprintAndUserID(userId, deviceFingerprint) {
    await prisma.session.updateMany({
      where: {
        userId: userId,
        deviceFingerprint: deviceFingerprint,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  }

}
