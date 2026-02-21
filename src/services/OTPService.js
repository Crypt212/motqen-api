import Service from "./Service.js";
import { generateOTP, hashOTP } from "../utils/OTP.js";
import SendOTPProvider from "../providers/SendOTPProvider.js";
import { otpRepository, rateLimitRepository } from "../state.js";
import environment from "../configs/environment.js";
import { $Enums } from "@prisma/client";

/**
 * @fileoverview OTP Service - Handle OTP generation, validation and verification
 * @module services/OTPService
 * @extends {Service}
 */


/**
 * OTP Service - Manages OTP operations
 * @class
 * @extends Service
 */
export default class OTPService extends Service {
  /**
   * Request a new OTP for the given phone number
   * @async
   * @method requestOTP
   * @param {string} phoneNumber - User's phone number
   * @param {$Enums.Method} method - OTP delivery method (SMS or WhatsApp)
   * @returns {Promise<boolean>} True if OTP was sent successfully
   * @description Generates a new OTP and sends it via the specified method
   */
  async requestOTP(phoneNumber, method) {
    const expiresAt = new Date(Date.now() + environment.otps.expiresIn * 1000);

    const OTP = generateOTP();
    const hashedOTP = hashOTP(OTP);

    const existingOTP = await otpRepository.upsertOTP(phoneNumber, method);

    await SendOTPProvider(method, OTP, phoneNumber);
    // must return better response not only true
    return true;
  };

  /**
   * Validate an OTP
   * @async
   * @method isValidOTP
   * @param {string} phoneNumber - User's phone number
   * @param {$Enums.Method} method - OTP delivery method
   * @param {string} OTP - The OTP to validate (hashed)
   * @returns {Promise<{ok: boolean, message: string}>} Validation result
   * @description Checks if the provided OTP is valid and not expired
   */
  async verifyOTP(phoneNumber, method, OTP) {
    // in production -> Invalid or expired OTP only
    //
    const hashedOTP = hashOTP(OTP);
    const { otp: storedOTP, expiresAt } = await otpRepository.getOTP(phoneNumber, method);


    if (!storedOTP) {
      return { message: "Invalid OTP", ok: false }
    }

    if (hashedOTP !== storedOTP) {
      return { message: "Invalid OTP", ok: false }
    }

    await otpRepository.deleteOTPRecord(phoneNumber, method);

    return { ok: true, message: "OTP verified successfully" };
  };
}
