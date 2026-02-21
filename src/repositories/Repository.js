/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */

import { PrismaClient } from '@prisma/client';
import prisma from '../libs/database.js';

/**
 * @template T
 * @typedef {{
 *   [K in keyof T]?:
 *     T[K] | { in: T[K] extends Array<infer U> ? U[] : T[K][] }
 * }} FilterArgs
 */

/** @typedef {String} IDType */

/** */
export class Repository {

  /**
   * @param {PrismaClient} prismaClient
   */
  constructor(prismaClient = prisma) {
    this.defaultPrismaClient = prismaClient;
    this.prismaClient = this.defaultPrismaClient;
  }

  /**
   * @param {any} prismaClient
   */
  usePrismaClient(prismaClient) { // for transactions
    this.prismaClient = prismaClient;
  }

  resetPrismaClient() {
    this.prismaClient = this.defaultPrismaClient;
  }

  /**
   * @param {Repository[]} repositories
   * @param {function(): Promise<T>} transactionHandler
   * @param {function(any): void} catchHandler
   * @returns {Promise<T | undefined>}
   * @template T
   */
  static async createTransaction(repositories, transactionHandler, catchHandler) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        repositories.forEach(repository => repository.usePrismaClient(tx));
        return await transactionHandler();
      });
      return result;
    } catch (error) {
      repositories.forEach(repository => repository.resetPrismaClient());
      catchHandler(error);
    }
  }
}
