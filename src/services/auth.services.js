import crypto from "crypto";
import {
  CreateOTP,
  DeleteOTPByPhoneNumber,
  GetOTPByPhoneNumber,
  UpdateOTPAttempts,
  markAsUsed,
} from "../Repo/Auth.Repo.js";
import { isValidOTP } from "./otp.services.js";
import { GetOrCreateUserService } from "./user.services.js";
import { createSessionForUser } from "./sessions.services.js";
import { generateAccessToken } from "../utils/jwt.utils.js";
import AppError from "../utils/AppError.utils.js";
import SendOTPProvider from "../providers/SendOTP.provider.js";
import { generateOTP, hashOTP } from "../utils/otp.utils.js";
import environment from "../config/environment.js";

const { cooldownConstant, expiresIn } = environment.otps;

const RequestOTPService = async (phoneNumber, method) => {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  const OTP = generateOTP();
  const hashedOTP = hashOTP(OTP);

  await CreateOTP(phoneNumber, hashedOTP, expiresAt, method);

  await SendOTPProvider(`Your OTP is ${OTP}`, phoneNumber, "MOTQEN");
  // must return better response not only true
  return true;
};


export const VerifyOTPService = async (phoneNumber, otp, method, deviceFingerprint) => {
  try {
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    await isValidOTP(phoneNumber, method, hashedOTP);

    await markAsUsed(phoneNumber, method);

    const user = await GetOrCreateUserService(phoneNumber);

    await DeleteOTPByPhoneNumber(phoneNumber, method);

    const expiresAt = new Date(Date.now() + 7*24*60*60 * 1000);
    const { session, UnHashedRefreshToken } = await createSessionForUser(
      user.id,  
      deviceFingerprint,
        expiresAt,
      user.role,
    );
    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
    });
    return {
      ...user,
      session,
      refreshToken: UnHashedRefreshToken,
      accessToken: accessToken,
    };
  } catch (e) {
    await UpdateOTPAttempts(phoneNumber, method);
    throw e;
  }
};

export const RequestOrResendOTPService = async (phoneNumber, method) => {
  const existingOTP = await GetOTPByPhoneNumber(phoneNumber, method);
  if (!existingOTP) {
    return await RequestOTPService(phoneNumber, method);
  }

  const timeSinceLastOTP = Date.now() - existingOTP.createdAt.getTime();

  if (timeSinceLastOTP < cooldownConstant*1000) {
    throw new AppError("Please wait before requesting a new OTP.", 429);
  }
  if (existingOTP.attempts >= 5) {
    throw new AppError(
      "Maximum OTP attempts exceeded. Please try again later.",
      429,
    );
  }

    await DeleteOTPByPhoneNumber(phoneNumber, method);
    return await RequestOTPService(phoneNumber, method);

};


