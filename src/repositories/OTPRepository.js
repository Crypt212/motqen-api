import { $Enums } from '@prisma/client';
import prisma from '../libs/database.js';
import { Repository } from './Repository.js';

/**
 * @fileoverview OTP Repository - Handle database operations for OTPs
 * @module repositories/OTPRepository
 * @extends {Repository}
 */

/** @typedef {import("./Repository.js").IDType} IDType */

/** @typedef {{ phoneNumber: String, hashedOTP: String, updatedAt: Date, createdAt: Date, method: $Enums.Method }} OTPData */
/** @typedef {OTPData | {id: IDType}} OTP */
/** @typedef {import("./Repository.js").FilterArgs<OTP>} OTPFilter */

/**
 * OTP Repository - Handles all database operations for OTPs
 * @class
 * @extends Repository<OTP, OTPData, OTPFilter>
 */
export default class OTPRepository extends Repository {

  constructor() {
    super(prisma.oTP);
  }
}
