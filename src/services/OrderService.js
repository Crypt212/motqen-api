import AppError from '../errors/AppError.js';
import { Repository } from '../repositories/database/Repository.js';
import { tryCatch } from './Service.js';

/**
 * @param {number} value
 * @returns {number}
 */
const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export default class OrderService {
  #orderRepository;
  #promoRepository;

  /**
   * @param {Object} params
   * @param {import('../repositories/database/OrderRepository.js').default} params.orderRepository
   * @param {import('../repositories/database/PromoRepository.js').default} params.promoRepository
   */
  constructor({ orderRepository, promoRepository }) {
    this.#orderRepository = orderRepository;
    this.#promoRepository = promoRepository;
  }

  /**
   * @param {Object} params
   * @param {string} params.clientProfileId
   * @param {string} params.draftOrderId
   * @param {string} params.promoCode
   */
  async applyPromo({ clientProfileId, draftOrderId, promoCode }) {
    return tryCatch(async () => {
      return Repository.createTransaction(
        [this.#orderRepository, this.#promoRepository],
        async () => {
          const draftOrder = await this.#orderRepository.prismaClient.draftOrder.findUnique({
            where: { id: draftOrderId },
            select: {
              id: true,
              clientProfileId: true,
              workerProfileId: true,
              expiresAt: true,
              subtotal: true,
              finalFee: true,
              promoId: true,
            },
          });

          if (!draftOrder) {
            throw new AppError('Draft order not found', 404, null, 'DRAFT_ORDER_NOT_FOUND');
          }

          if (draftOrder.clientProfileId !== clientProfileId) {
            throw new AppError('You do not own this draft order', 403, null, 'DRAFT_ORDER_FORBIDDEN');
          }

          if (new Date(draftOrder.expiresAt) <= new Date()) {
            throw new AppError('Draft order has expired', 410, null, 'DRAFT_ORDER_EXPIRED');
          }

          if (draftOrder.promoId) {
            throw new AppError('Promo code already applied to this draft order', 409, null, 'PROMO_ALREADY_APPLIED');
          }

          const normalizedCode = String(promoCode || '').trim().toUpperCase();
          const promo = await this.#promoRepository.prismaClient.promoCode.findUnique({
            where: { code: normalizedCode },
            select: {
              id: true,
              code: true,
              isActive: true,
              expiresAt: true,
              usageLimit: true,
              usedCount: true,
              discountType: true,
              discountValue: true,
              workerProfileId: true,
            },
          });

          if (!promo) {
            throw new AppError('Promo code is invalid', 404, null, 'PROMO_NOT_FOUND');
          }

          if (!promo.isActive) {
            throw new AppError('Promo code is inactive', 400, null, 'PROMO_INACTIVE');
          }

          if (promo.expiresAt && new Date(promo.expiresAt) <= new Date()) {
            throw new AppError('Promo code has expired', 400, null, 'PROMO_EXPIRED');
          }

          if (
            promo.workerProfileId &&
            (!draftOrder.workerProfileId || promo.workerProfileId !== draftOrder.workerProfileId)
          ) {
            throw new AppError('Promo code does not apply to this craftsman', 400, null, 'PROMO_CRAFTSMAN_SCOPE_MISMATCH');
          }

          const subtotal = Number(draftOrder.subtotal || 0);
          let discountAmount = 0;

          if (promo.discountType === 'PERCENTAGE') {
            discountAmount = (subtotal * Number(promo.discountValue || 0)) / 100;
          } else {
            discountAmount = Number(promo.discountValue || 0);
          }

          discountAmount = roundMoney(Math.min(Math.max(discountAmount, 0), subtotal));
          const finalFee = roundMoney(Math.max(subtotal - discountAmount, 0));

          const incrementedRows = await this.#promoRepository.prismaClient.$executeRaw`
            UPDATE "promo_codes"
            SET "usedCount" = "usedCount" + 1,
                "updatedAt" = NOW()
            WHERE "id" = ${promo.id}
              AND ("usageLimit" IS NULL OR "usedCount" < "usageLimit")
          `;

          if (incrementedRows === 0) {
            throw new AppError('Promo code usage limit reached', 400, null, 'PROMO_USAGE_LIMIT_REACHED');
          }

          const updatedDraft = await this.#orderRepository.prismaClient.draftOrder.update({
            where: { id: draftOrder.id },
            data: {
              promoId: promo.id,
              promoAppliedAt: new Date(),
              discountAmount,
              finalFee,
            },
            select: {
              id: true,
              subtotal: true,
              finalFee: true,
              discountAmount: true,
              promo: {
                select: {
                  code: true,
                  discountType: true,
                  discountValue: true,
                },
              },
            },
          });

          return {
            draft_order_id: updatedDraft.id,
            promo_code: updatedDraft.promo?.code || normalizedCode,
            discount_type: updatedDraft.promo?.discountType,
            discount_value: updatedDraft.promo?.discountValue,
            discount_amount: updatedDraft.discountAmount,
            final_fee: updatedDraft.finalFee,
          };
        },
        async (error) => {
          throw error;
        }
      );
    });
  }
}
