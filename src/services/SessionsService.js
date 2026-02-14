import { createSession } from "../repositories/AuthRepo.js";
import { generateRefreshToken } from "../utils/tokens.js";
import crypto from "crypto";
export const createSessionForUser = async (userId, fingerprint, expiresAt , role) => {
    // have to add logic to check for existing sessions and invalidate them if necessary
    const token = generateRefreshToken({ userId, role });
    console.log("Generated Refresh Token:", expiresAt);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
 const session = await createSession(userId, fingerprint, expiresAt, hashedToken);
 return { session , UnHashedRefreshToken : token };
};
