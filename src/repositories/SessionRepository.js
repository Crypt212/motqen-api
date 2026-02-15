import prisma from "../libs/database.js";
import { Repository } from "./Repository.js";

export default class SessionRepository extends Repository {
    async create({ userId, fingerprint, expiresAt, token }) {
        const session = await prisma.session.create({
            data: {
                userId: userId,
                deviceFingerprint: fingerprint,
                expiresAt: expiresAt,
                createdAt: new Date(),
                isRevoked: false,
                token: token,
                lastUsedAt: new Date(),
            },
        });
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

}
