import prisma from "../libs/database.js";
import { Repository } from "./Repository.js";

export default class SessionRepository extends Repository {
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
  async find({ userId, deviceFingerprint, hashedToken }) {
    const session = await prisma.session.findFirst({
      where: {
        userId,
        deviceFingerprint,
        hashedToken,
      },
    });
    return session;
  }
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
  async revokeSessionsForFingerprintAndUserID(userId, deviceFingerprint) {
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
