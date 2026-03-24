import { Method } from "../../domain/otp.entity.js";

export default interface IOtpCache {
  /**
   * Set OTP in cache with TTL
   */
  setOtp(phone: string, method: Method, hashedOtp: string, ttlSeconds: number): Promise<string | {}>

  /**
   * Get OTP from cache
   */
  getOtp(phone: string, method: Method): Promise<string | {}>

  /**
   * Check if OTP exists in cache
   */
  otpExists(phone: string, method: Method): Promise<boolean>

  /**
   * Delete OTP from cache
   */
  deleteOtp(phone: string, method: Method): Promise<number>
}
