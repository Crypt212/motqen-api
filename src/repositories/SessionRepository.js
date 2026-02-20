import prisma from "../libs/database.js";
import { Repository } from "./Repository.js";

/**
 * @fileoverview Session Repository - Handle database operations for sessions
 * @module repositories/SessionRepository
 * @extends {Repository}
 */

/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */
/** @typedef {import("./Repository.js").IDType} IDType */

/** @typedef {{userId: IDType, token: String, isRevoked: boolean, deviceFingerprint: String, ipAddress?: String, userAgent?: String, lastUsedAt: Date, createdAt: Date, expiresAt: Date}} SessionData */
/** @typedef {SessionData & {id: IDType}} Session */
/** @typedef {import("./Repository.js").FilterArgs<Session>} SessionFilter */


/**
 * Session Repository - Handles all database operations for sessions
 * @class
 * @extends Repository
 */
export default class SessionRepository extends Repository {


  /**
   * @async
   * @method
   * @param {SessionFilter} where
   * @returns {Promise<boolean>}
   */
  async exists(where) {
    return (await prisma.session.count({ where })) > 0;
  }


  /**
   * @async
   * @method
   * @param {SessionFilter} where
   * @returns {Promise<Session|null>}
   */
  async findOne(where) {
    return await prisma.session.findFirst({ where });
  };

  /**
   * @async
   * @method
   * @param {SessionFilter} where
   * @returns {Promise<Session[]>}
   */
  async findMany(where) {
    return await prisma.session.findMany({ where });
  };

  /**
   * @async
   * @method
   * @param {SessionData} data
   * @returns {Promise<Session>}
   */
  async create(data) {
    return await prisma.session.create({ data });
  };

  /**
   * @async
   * @method
   * @param {SessionData[]} data
   * @returns {Promise<BatchPayload>}
   */
  async createMany(data) {
    return await prisma.session.createMany({ data });
  };

  /**
   * @async
   * @method
   * @param {SessionFilter} filter
   * @param {SessionData} data
   * @returns {Promise<BatchPayload>}
   */
  async update(filter, data) {
    return await prisma.session.updateMany({
      where: filter,
      data,
    });
  };

  /**
   * @async
   * @method
   * @param {SessionFilter} filter
   * @returns {Promise<BatchPayload>}
   */
  async delete(filter) {
    return await prisma.session.deleteMany({
      where: filter,
    });
  };
}
