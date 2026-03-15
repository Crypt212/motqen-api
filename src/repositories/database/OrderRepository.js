import { PrismaClient } from '@prisma/client';
import { Repository } from './Repository.js';

/** @typedef {import('./Repository.js').IDType} IDType */

export default class OrderRepository extends Repository {
  /** @param {PrismaClient} prisma */
  constructor(prisma) {
    super(prisma, 'draftOrder');
  }

  /**
   * @param {IDType} draftOrderId
   */
  async findDraftById(draftOrderId) {
    return this.prismaClient.draftOrder.findUnique({
      where: { id: draftOrderId },
    });
  }
}
