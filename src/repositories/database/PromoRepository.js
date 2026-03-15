import { PrismaClient } from '@prisma/client';
import { Repository } from './Repository.js';

export default class PromoRepository extends Repository {
  /** @param {PrismaClient} prisma */
  constructor(prisma) {
    super(prisma, 'promoCode');
  }

  /**
   * @param {string} rawPromoCode
   */
  async findByCode(rawPromoCode) {
    const code = String(rawPromoCode || '').trim().toUpperCase();

    return this.prismaClient.promoCode.findUnique({
      where: { code },
    });
  }
}
