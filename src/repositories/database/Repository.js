import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../../libs/database.js';

/**
 * @template T
 * @typedef {{
 *   [K in keyof T]?:
 *     T[K] | { in: T[K] extends Array<infer U> ? U[] : T[K][] }
 * }} FilterArgs
 */

/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */

/** @typedef {String} IDType */

/**
 * @template CreateInput, UpdateInput, WhereInput, SelectInput, OutputData
 */
export class Repository {
  #defaultPrismaClient;
  #modelName;

  /** @type {PrismaClient | Prisma.TransactionClient} */
  prismaClient;

  /**
   * @param {PrismaClient} prismaClient
   * @param {keyof typeof prisma} modelName
   */
  constructor(prismaClient = prisma, modelName) {
    this.#defaultPrismaClient = prismaClient;
    this.#modelName = modelName;
    this.prismaClient = this.#defaultPrismaClient;
  }

  /**
   * @param {Prisma.TransactionClient} transaction
   */
  useTransaction(transaction) {
    this.prismaClient = transaction;
  }

  resetPrismaClient() {
    this.prismaClient = this.#defaultPrismaClient;
  }

  /**
   * @param {Repository[]} repositories
   * @param {function(): Promise<T>} transactionHandler
   * @param {function(any): Promise<void>} catchHandler
   * @returns {Promise<T | undefined>}
   * @template T
   */
  static async createTransaction(repositories, transactionHandler, catchHandler) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        repositories.forEach(repository => repository.useTransaction(tx));
        return await transactionHandler();
      });

      // Reset all repositories after successful transaction
      repositories.forEach(repository => repository.resetPrismaClient());
      return result;
    } catch (error) {
      repositories.forEach(repository => repository.resetPrismaClient());
      await catchHandler(error);
    }
  }

  /**
   * @param {WhereInput | {}} where - Where clause
   * @param {SelectInput | undefined} select - Where clause
   * @returns {Promise<OutputData|null>}
   */
  async findFirst(where = {}, select = undefined) { return this.prismaClient[this.#modelName].findFirst({ where, select }); }

  /**
   * @param {WhereInput | {}} where - Where clause
   * @param {SelectInput | undefined} select - Where clause
   * @returns {Promise<BatchPayload>}
   */
  async findMany(where = {}, select = undefined) { return this.prismaClient[this.#modelName].findMany({ where, select }); }

  /**
   * @param {CreateInput} data - Data to create
   * @returns {Promise<OutputData|null>}
   */
  async create(data) { return this.prismaClient[this.#modelName].create({ data }); }

  // createMany - Create multiple records
  /**
   * @param {CreateInput[]} data - Array of data to create
   * @returns {Promise<BatchPayload>}
   */
  async createMany(data) { return this.prismaClient[this.#modelName].createMany({ data }); }

  /**
   * @param {UpdateInput} data - Where clause
   * @param {WhereInput | {}} where - Where clause
   * @returns {Promise<BatchPayload>}
   */
  async update(data, where = {}) { return this.prismaClient[this.#modelName].updateMany({ where, data }); }

  // updateById - Update by unique ID
  /**
   * @param {IDType} id - Record ID
   * @param {UpdateInput} data - Data to update
   * @returns {Promise<OutputData>}
   */
  async updateById(id, data) { return this.prismaClient[this.#modelName].update({ where: { id }, data }); }

  // delete - Delete records
  /**
   * @param {WhereInput | {}} where - Where clause
   * @returns {Promise<BatchPayload>}
   */
  async delete(where = {}) { return this.prismaClient[this.#modelName].deleteMany({ where }); }

  // deleteById - Delete by unique ID
  /**
   * @param {IDType} id - Record ID
   * @returns {Promise<OutputData>}
   */
  async deleteById(id) { return this.prismaClient[this.#modelName].delete({ where: { id } }); }

  // exists - Check if record exists
  /**
   * @param {WhereInput | {}} where - Where clause
   * @returns {Promise<boolean>}
   */
  async exists(where = {}) { return (await this.prismaClient[this.#modelName].count({ where })) > 0; }

  // count - Count records
  /**
   * @param {WhereInput | {}} [where={}] - Where clause
   * @returns {Promise<number>}
   */
  async count(where = {}) { return this.prismaClient[this.#modelName].count({ where }); }
}
