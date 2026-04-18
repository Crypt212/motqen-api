/**
 * @fileoverview OTP Utilities - One-Time Password generation and hashing
 * @module utils/OTP
 */

import crypto from 'crypto';

/**
 * Generates a random 6-digit OTP
 * @function generateOTP
 * @returns {string} A 6-digit numeric OTP string
 * @example
 * const otp = generateOTP(); // "123456"
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hashes an OTP using SHA-256
 * @function hashOTP
 * @param {string} otp - The OTP to hash
 * @returns {string} The hashed OTP in hexadecimal format
 * @example
 * const hashed = hashOTP("123456"); // "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
 */
export const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};
