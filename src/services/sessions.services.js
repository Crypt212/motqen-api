import { createSession } from "../Repositories/Auth.Repo.js";
import { generateRefreshToken } from "../utils/jwt.utils.js";
import crypto from "crypto";
export const createSessionForUser = async (
  userId,
  fingerprint,
  expiresAt,
  role,
) => {
  // have to add logic to check for existing sessions and invalidate them if necessary
  const token = generateRefreshToken({ userId, role });
  console.log("Generated Refresh Token:", expiresAt);
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const session = await createSession(
    userId,
    fingerprint,
    expiresAt,
    hashedToken,
  );
  return { session, UnHashedRefreshToken: token };
};
