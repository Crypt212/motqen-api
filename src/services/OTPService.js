import {
  DeleteOTPByPhoneNumber,
  GetOTPByPhoneNumber,
  markAsUsed,
  UpdateOTPAttempts,
} from "../repositories/AuthRepo.js";
import AppError from "../errors/AppError.js";

export const isValidOTP = async (phoneNumber, method, hashedOTP) => {
  // in production -> Invalid or expired OTP only 
  const storedOTP = await GetOTPByPhoneNumber(phoneNumber, method);
  if (!storedOTP) {
    throw new AppError("Invalid OTP" , 400);
  }
  if (storedOTP.isUsed) {
    throw new AppError("OTP already used" , 400);
  }
  if (storedOTP.expiresAt < new Date()) {
     await DeleteOTPByPhoneNumber(phoneNumber, method);
    throw new AppError("Expired OTP" , 400);
  }
  if (storedOTP.attempts >= 5) {
    await DeleteOTPByPhoneNumber(phoneNumber, method);
    throw new AppError("Too many attempts. Please request a new OTP." , 400);
  }
  if (hashedOTP !== storedOTP.hashedOTP) {
    await UpdateOTPAttempts(phoneNumber, method);
    throw new AppError("Invalid OTP" , 400);
  }
  return true
};
