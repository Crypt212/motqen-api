/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */

import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../libs/database.js';

/**
 * @template T
 * @typedef {{
 *   [K in keyof T]?:
 *     T[K] | { in: T[K] extends Array<infer U> ? U[] : T[K][] }
 * }} FilterArgs
 */

/** @typedef {String} IDType */

/**
 * @template TEntity
 * @template TEntityData
 * @template TFilter
 */
export class Repository {

  /**
   * @param {PrismaClient} prismaClient
   */
  constructor(prismaClient = prisma) {
    this.defaultPrismaClient = prismaClient;
    this.prismaClient = this.defaultPrismaClient;
  }

  /**
   * @param {PrismaClient} prismaClient
   */
  usePrismaClient(prismaClient) { // for transactions
    this.prismaClient = prismaClient;
  }

  resetPrismaClient() {
    this.prismaClient = this.defaultPrismaClient;
  }

  /**
   * @param {Repository[]} repositories
   * @param {function(): void} transactionHandler
   * @param {function(any): void} catchHandler
   */
  static createTransaction(repositories, transactionHandler, catchHandler) {
    prisma.$transaction(async (tx) => {
      repositories.forEach(repository => repository.usePrismaClient(tx));
      transactionHandler();
    }).catch(async (reason) => {
      repositories.forEach(repository => repository.resetPrismaClient());
      catchHandler();
    });
  }
}
