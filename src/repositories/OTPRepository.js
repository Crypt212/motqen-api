import { $Enums } from "@prisma/client";
import prisma from "../libs/database.js";
import { Repository } from "./Repository.js";

/**
 * @fileoverview OTP Repository - Handle database operations for OTPs
 * @module repositories/OTPRepository
 * @extends {Repository}
 */

/**
 * OTP Repository - Handles all database operations for OTPs
 * @class
 * @extends Repository
 */
export default class OTPRepository extends Repository {
  /**
   * Create a new OTP record
   * @async
   * @method create
   * @param {string} phoneNumber - User's phone number
   * @param {string} hashedOTP - Hashed OTP
   * @param {Date} expiresAt - Expiration date
   * @param {$Enums.Method} method - OTP delivery method (SMS or WhatsApp)
   * @returns {Promise<Object>} Created OTP
   */
  async create(phoneNumber, hashedOTP, expiresAt, method) {
    const otp = await prisma.oTP.create({
      data: {
        phoneNumber: phoneNumber,
        hashedOTP: hashedOTP,
        expiresAt: expiresAt,
        method: method,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });
    return otp;
  };

  /**
   * Find OTP by phone number and method
   * @async
   * @method findByPhoneNumber
   * @param {string} phoneNumber - User's phone number
   * @param {$Enums.Method} method - OTP delivery method
   * @returns {Promise<Object|null>} Found OTP or null
   */
  async findByPhoneNumber(phoneNumber, method) {
    const otp = await prisma.oTP.findFirst({
      where: {
        phoneNumber: phoneNumber,
        method: method,
      },
      orderBy: { createdAt: "desc" },
    });
    return otp;
  };

  /**
   * Delete OTP by phone number and method
   * @async
   * @method deleteByPhoneNumber
   * @param {string} phoneNumber - User's phone number
   * @param {$Enums.Method} method - OTP delivery method
   * @returns {Promise<void>}
   */
  async deleteByPhoneNumber(phoneNumber, method) {
    await prisma.oTP.delete({
      where: {
        phoneNumber: phoneNumber,
        method,
      },
    });
  };

  /**
   * Update OTP record
   * @async
   * @method updateOTP
   * @param {string} phoneNumber - User's phone number
   * @param {$Enums.Method} method - OTP delivery method
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated OTP
   */
  async updateOTP(phoneNumber, method, data) {
    return await prisma.oTP.update({
      where: { phoneNumber, method },
      data,
    });
  };

  /**
   * Increment OTP attempt count
   * @async
   * @method updateAttempts
   * @param {string} phoneNumber - User's phone number
   * @param {$Enums.Method} method - OTP delivery method
   * @returns {Promise<Object>} Updated attempts count
   */
  async updateAttempts(phoneNumber, method) {
    const otp = await prisma.oTP.findUnique({
      where: { phoneNumber, method },
    });
    if (otp) {
      await prisma.oTP.update({
        where: { phoneNumber, method },
        data: {
          attempts: {
            increment: 1,
          },
          updatedAt: new Date(),
        },
      });
    }
    return otp ? { attempts: otp.attempts + 1, updatedAt: new Date() } : null;
  };

  /**
   * Get OTP attempt count
   * @async
   * @method getAttempts
   * @param {string} phoneNumber - User's phone number
   * @param {$Enums.Method} method - OTP delivery method
   * @returns {Promise<{attempts: number, lastAttemptAt: Date}|null>} Attempts info or null
   */
  async getAttempts(phoneNumber, method) {
    const otp = await prisma.oTP.findUnique({
      where: {
        phoneNumber: phoneNumber,
        method: method,
      },
    });
    return otp
      ? { attempts: otp.attempts, lastAttemptAt: otp.updatedAt }
      : null;
  };

  /**
   * Get the latest OTP for a phone number and method
   * @async
   * @method getLatest
   * @param {string} phone - User's phone number
   * @param {$Enums.Method} method - OTP delivery method
   * @returns {Promise<Object|null>} Latest OTP or null
   */
  async getLatest(phone, method) {
    return await prisma.oTP.findFirst({
      where: { phoneNumber: phone, method: method },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Mark OTP as used
   * @async
   * @method markAsUsed
   * @param {string} phoneNumber - User's phone number
   * @param {$Enums.Method} method - OTP delivery method
   * @returns {Promise<Object>} Updated OTP
   */
  async markAsUsed(phoneNumber, method) {
    return await prisma.oTP.update({
      where: { phoneNumber, method },
      data: { isUsed: true },
    });
  }
}
