import Service from "./Service.js";
import { generateOTP, hashOTP } from "../utils/OTP.js";
import SendOTPProvider from "../providers/SendOTPProvider.js";
import { otpRepository } from "../state.js";
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

        const existingOTP = await otpRepository.getLatest(phoneNumber, method);
        if (!existingOTP)
            await otpRepository.create(phoneNumber, hashedOTP, expiresAt, method);
        else
            await otpRepository.updateOTP(phoneNumber, method, { expiresAt, hashedOTP });

        await SendOTPProvider(method, OTP, phoneNumber);
        // must return better response not only true
        return true;
    };

    /**
     * Mark OTP as used and delete it
     * @async
     * @method verifyOTP
     * @param {string} phoneNumber - User's phone number
     * @param {$Enums.Method} method - OTP delivery method
     * @returns {Promise<void>}
     * @description Marks the OTP as used and removes it from the database
     */
    async verifyOTP(phoneNumber, method) {
        // maybe i will separate the logic to sub services SoC
        await otpRepository.markAsUsed(phoneNumber, method);
        await otpRepository.deleteByPhoneNumber(phoneNumber, method);
    };

    /**
     * Get the expiration date for OTP cooldown
     * @async
     * @method getOTPExpireDate
     * @param {string} phoneNumber - User's phone number
     * @param {$Enums.Method} method - OTP delivery method
     * @returns {Promise<number|null>} Timestamp of when OTP expires, or null if no cooldown
     * @description Returns the expiration date if user must wait before requesting new OTP
     */
    async getOTPExpireDate(phoneNumber , method) {
        const existingOTP = await otpRepository.getLatest(phoneNumber, method);
        if (!existingOTP) {
            return null;
        }
        const expireDate = existingOTP.expiresAt;

        if (expireDate.getTime() > Date.now()) {
            return expireDate.getTime();
        }
        return null;
    }

    /**
     * Validate an OTP
     * @async
     * @method isValidOTP
     * @param {string} phoneNumber - User's phone number
     * @param {$Enums.Method} method - OTP delivery method
     * @param {string} otp - The OTP to validate (hashed)
     * @returns {Promise<{ok: boolean, message: string}>} Validation result
     * @description Checks if the provided OTP is valid and not expired
     */
    async isValidOTP(phoneNumber, method, otp) {
        // in production -> Invalid or expired OTP only
        const storedOTP = await otpRepository.findByPhoneNumber(phoneNumber, method);


        if (!storedOTP) {
            return {message:"Invalid OTP" , ok:false}
        }
        if (storedOTP.isUsed) {
            return {message:"OTP already used" , ok:false}
        }
        if (storedOTP.expiresAt < new Date()) {
            await otpRepository.deleteByPhoneNumber(phoneNumber, method);
            return {message:"Expired OTP" , ok:false}
        }
        if (storedOTP.attempts >= 5) {
            await otpRepository.deleteByPhoneNumber(phoneNumber, method);
            return {message:"Too many attempts. Please request a new OTP." , ok:false}
        }
        if (otp !== storedOTP.hashedOTP) {
            await otpRepository.updateAttempts(phoneNumber, method);
            return {message:"Invalid OTP" , ok:false}
        }
        return {ok:true , message:"OTP verified successfully" };
    };
}
