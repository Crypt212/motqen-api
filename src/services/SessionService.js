import { generateToken } from "../utils/tokens.js";
import { logger } from "../libs/winston.js";
import crypto from "crypto";
import Service from "./Service.js";
import { sessionRepository } from "../state.js";
import AppError from "../errors/AppError.js";

/**
 * @fileoverview Session Service - Handle user session management
 * @module services/SessionService
 * @extends {Service}
 */


/**
 * Session Service - Manages user authentication sessions
 * @class
 * @extends Service
 */
export default class SessionService extends Service {

  /**
   * Creates a new refresh token for the given user ID and device fingerprint.
   * @async
   * @method create
   * @param {Object} params - Session creation parameters
   * @param {string} params.userId - The user's ID
   * @param {string} params.deviceFingerprint - Device fingerprint
   * @param {import("../types/role.js").Role} params.role - User's role
   * @param {Date} [params.expiresAt] - Token expiration date
   * @param {string} [params.ipAddress] - Client IP address
   * @param {string} [params.userAgent] - Client user agent
   * @returns {Promise<{session: Object, unHashedRefreshToken: string}>} Created session and refresh token
   * @description Creates a new session, revokes existing ones for the same device
   */
  async createSession({
    userId,
    deviceFingerprint,
    role,
    expiresAt,
  }) {
    // each mobile have only one active session

 await sessionRepository.delete({ deviceFingerprint });
      

    const unHashedRefreshToken = generateToken({ type: "refresh", userId, role });
    logger.info("Generated Refresh Token:", expiresAt);

    const hashedToken = crypto.createHash("sha256").update(unHashedRefreshToken).digest("hex");

    const session = await sessionRepository.create({
      isRevoked: false,
      lastUsedAt: new Date(Date.now()),
      createdAt: new Date(Date.now()),
      userId,
      deviceFingerprint,
      expiresAt,
      token: hashedToken,
    });
    return { session, unHashedRefreshToken: unHashedRefreshToken };
  }

  /**
   * Find a session by user ID, token, and device fingerprint
   * @async
   * @method find
   * @param {Object} params - Session search parameters
   * @param {string} params.userId - The user's ID
   * @param {string} params.hashedToken - Hashed refresh token
   * @param {string} params.deviceFingerprint - Device fingerprint
   * @returns {Promise<{session: Object|null}>} Found session or null
   */
  async find({ userId, hashedToken, deviceFingerprint }) {
    // have to add logic to check for existing sessions and invalidate them if necessary
    const session = await sessionRepository.findOne({
      userId,
      deviceFingerprint,
      token: hashedToken,
    });
    return { session };
  }

  /**
   * Revokes all sessions for a given user ID and device fingerprint.
   * @async
   * @method revokeByUserIDAndFingerprint
   * @param {string} userId - The user ID to revoke sessions for.
   * @param {string} deviceFingerprint - The device fingerprint to revoke sessions for.
   * @returns {Promise<void>}
   */
  async revokeByUserIDAndFingerprint(userId, deviceFingerprint) {
    try {
      await sessionRepository.delete({
        userId,
        deviceFingerprint,
      });
    } catch (err) {
      logger.error("Failed to revoke session:", err);
      throw err;
    }
  }


  /**
   * Generates a new access token based on the provided refresh token.
   * @async
   * @method generateAccessToken
   * @param {Object} params - Token generation parameters
   * @param {string} params.refreshToken - The refresh token
   * @param {string} params.deviceFingerprint - Device fingerprint
   * @param {string} params.userId - User's ID
   * @param {import("../types/role.js").Role} params.role - User's role
   * @returns {Promise<string>} Generated access token
   * @throws {AppError} If refresh token is invalid, revoked, or expired
   */
  async generateAccessToken({ refreshToken, deviceFingerprint, userId, role }) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await sessionRepository.findOne({
    userId,
    deviceFingerprint,
    token: hashedToken,
  });

  if (!session) {
    throw new AppError("Invalid or Expired refresh token", 400);
  }
  if (session.isRevoked) {
    throw new AppError("Refresh token has been revoked", 400,);
  }
  if (session.expiresAt.getTime() < Date.now()) {
    await sessionRepository.delete({ id: session.id });
    throw new AppError("Refresh token has expired", 400);
  }


  const accessToken = generateToken({ type: "access", userId, role: role });
  return accessToken;
}


}
