import { generateToken } from "../utils/tokens.js";
import { logger } from "../libs/winston.js";
import crypto from "crypto";
import Service from "./Service.js";
import { sessionRepository } from "../state.js";
import environment from "../configs/environment.js";
import AppError from "../errors/AppError.js";
export default class SessionService extends Service {
  async create({
    userId,
    deviceFingerprint,
    role,
    expiresAt = environment.jwt.refresh.expiresIn,
  }) {
    // each mobile have only one active session

    await sessionRepository.revokeSessionsForFingerprint(deviceFingerprint);

    const token = generateToken("refresh", { userId, role });
    logger.info("Generated Refresh Token:", expiresAt);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const session = await sessionRepository.create({
      userId,
      fingerprint: deviceFingerprint,
      expiresAt,
      hashedToken,

    });
    return { session, unHashedRefreshToken: token };
  }
  async find({ userId, hashedToken, deviceFingerprint }) {
    // have to add logic to check for existing sessions and invalidate them if necessary
    const session = await sessionRepository.find({
      userId,
      deviceFingerprint,
      hashedToken,
    });
    return { session };
  }

  async revokeByUserIDAndFingerprint(userId, deviceFingerprint) {
    await sessionRepository.revokeSessionsForFingerprintAndUserID(
      userId,
      deviceFingerprint,
    );
    return;
  }
  async generateAccessToken({ refreshToken, deviceFingerprint, userId , role }) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionRepository.find({
      userId,
      deviceFingerprint,
      hashedToken,
    });

    if (!session) {
      throw new AppError("Invalid or Expired refresh token", 400);
    }
    if (session.isRevoked) {
      throw new AppError("Refresh token has been revoked", 400, );
    }
    if (session.expiresAt < Date.now()) {
      await sessionRepository.revokeBySessionID(session.id);
      throw new AppError("Refresh token has expired", 400);
    }


    const accessToken = generateToken("access", { userId, role: role });
    return accessToken;
  }


}
