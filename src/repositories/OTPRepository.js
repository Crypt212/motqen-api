import { $Enums } from '@prisma/client';
import prisma from '../libs/database.js';
import { Repository } from './Repository.js';

/**
 * @fileoverview OTP Repository - Handle database operations for OTPs
 * @module repositories/OTPRepository
 * @extends {Repository}
 */

/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */
/** @typedef {import("./Repository.js").IDType} IDType */

/** @typedef {{ phoneNumber: String, hashedOTP: String, updatedAt: Date, createdAt: Date, method: $Enums.Method }} OTPData */
/** @typedef {OTPData & {id: IDType}} OTP */
/** @typedef {import("./Repository.js").FilterArgs<OTP>} OTPFilter */

/**
 * OTP Repository - Handles all database operations for OTPs
 * @class
 * @extends Repository
 */
export default class OTPRepository extends Repository {

  /**
   * @async
   * @method
   * @param {OTPFilter} where
   * @returns {Promise<boolean>}
   */
  async exists(where) {
    return (await prisma.oTP.count({ where })) > 0;
  }


  /**
   * @async
   * @method
   * @param {OTPFilter} where
   * @returns {Promise<OTP|null>}
   */
  async findOne(where) {
    return await prisma.oTP.findFirst({ where });
  };

  /**
   * @async
   * @method
   * @param {OTPFilter} where
   * @returns {Promise<OTP[]>}
   */
  async findMany(where) {
    return await prisma.oTP.findMany({ where });
  };

  /**
   * @async
   * @method
   * @param {OTPData} data
   * @returns {Promise<OTP>}
   */
  async create(data) {
    return await prisma.oTP.create({ data });
  };

  /**
   * @async
   * @method
   * @param {OTPData[]} data
   * @returns {Promise<BatchPayload>}
   */
  async createMany(data) {
    return await prisma.oTP.createMany({ data });
  };

  /**
   * @async
   * @method
   * @param {OTPFilter} filter
   * @param {OTPData} data
   * @returns {Promise<BatchPayload>}
   */
  async update(filter, data) {
    return await prisma.oTP.updateMany({
      where: filter,
      data,
    });
  };

  /**
   * @async
   * @method
   * @param {OTPFilter} filter
   * @returns {Promise<BatchPayload>}
   */
  async delete(filter) {
    return await prisma.oTP.deleteMany({
      where: filter,
    });
  };
}
