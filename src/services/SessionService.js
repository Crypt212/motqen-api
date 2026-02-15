import { generateToken } from "../utils/tokens.js";
import { logger } from "../libs/winston.js";
import crypto from "crypto";
import Service from "./Service.js";
import { sessionRepository } from "../state.js";
import environment from "../configs/environment.js";
export default class SessionService extends Service {
    async create({ userId, deviceFingerprint, role, expiresAt = environment.jwt.refresh.expiresIn }) {
        // have to add logic to check for existing sessions and invalidate them if necessary
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
    async find({ userId, unHashedRefreshToken, deviceFingerprint }) {
        // have to add logic to check for existing sessions and invalidate them if necessary
        const hashedToken = crypto.createHash("sha256").update(unHashedRefreshToken).digest("hex");
        const session = await sessionRepository.find({
            userId,
            deviceFingerprint,
            hashedToken,
        });
        return { session };
    }
}
