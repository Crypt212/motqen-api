import { describe, it, expect } from 'vitest';
import { mapEventToNotification } from '../../../src/utils/notificationMapper.js';

describe('mapEventToNotification', () => {
  // ─── ORDER EVENTS ─────────────────────────────────────────────
  describe('ORDER_ACCEPTED', () => {
    it('returns correct notification payload', () => {
      const result = mapEventToNotification({
        type: 'ORDER_ACCEPTED',
        ctx: { orderId: 'order-1', orderTitle: 'تركيب مطبخ' },
      });

      expect(result.type).toBe('ORDER_ACCEPTED');
      expect(result.title).toContain('✅');
      expect(result.body).toContain('تركيب مطبخ');
      expect(result.data.screen).toBe('order_details');
      expect(result.data.entityId).toBe('order-1');
      expect(result.data.entityType).toBe('order');
    });
  });

  describe('ORDER_CANCELLED', () => {
    it('returns correct notification payload', () => {
      const result = mapEventToNotification({
        type: 'ORDER_CANCELLED',
        ctx: { orderId: 'order-2', orderTitle: 'صيانة سباكة' },
      });

      expect(result.type).toBe('ORDER_CANCELLED');
      expect(result.title).toContain('❌');
      expect(result.body).toContain('صيانة سباكة');
      expect(result.data.screen).toBe('order_details');
      expect(result.data.entityId).toBe('order-2');
      expect(result.data.entityType).toBe('order');
    });
  });

  describe('ORDER_COMPLETED', () => {
    it('returns correct notification payload', () => {
      const result = mapEventToNotification({
        type: 'ORDER_COMPLETED',
        ctx: { orderId: 'order-3', orderTitle: 'دهان حوائط' },
      });

      expect(result.type).toBe('ORDER_COMPLETED');
      expect(result.title).toContain('🎉');
      expect(result.body).toContain('دهان حوائط');
      expect(result.data.screen).toBe('order_details');
      expect(result.data.entityId).toBe('order-3');
      expect(result.data.entityType).toBe('order');
    });
  });

  // ─── NEGOTIATION EVENTS ───────────────────────────────────────
  describe('NEGOTIATION_OFFER', () => {
    it('returns payload with proposed amount in body', () => {
      const result = mapEventToNotification({
        type: 'NEGOTIATION_OFFER',
        ctx: { orderId: 'order-4', orderTitle: 'كهرباء', proposedAmount: 350 },
      });

      expect(result.type).toBe('NEGOTIATION_OFFER');
      expect(result.title).toContain('💰');
      expect(result.body).toContain('350');
      expect(result.body).toContain('كهرباء');
      expect(result.data.screen).toBe('negotiation');
      expect(result.data.entityId).toBe('order-4');
      expect(result.data.entityType).toBe('order');
    });
  });

  describe('NEGOTIATION_ACCEPTED', () => {
    it('returns correct notification payload', () => {
      const result = mapEventToNotification({
        type: 'NEGOTIATION_ACCEPTED',
        ctx: { orderId: 'order-5', orderTitle: 'نجارة' },
      });

      expect(result.type).toBe('NEGOTIATION_ACCEPTED');
      expect(result.title).toContain('✅');
      expect(result.body).toContain('نجارة');
      expect(result.data.screen).toBe('negotiation');
      expect(result.data.entityId).toBe('order-5');
    });
  });

  describe('NEGOTIATION_REJECTED', () => {
    it('returns correct notification payload', () => {
      const result = mapEventToNotification({
        type: 'NEGOTIATION_REJECTED',
        ctx: { orderId: 'order-6', orderTitle: 'تكييف' },
      });

      expect(result.type).toBe('NEGOTIATION_REJECTED');
      expect(result.title).toContain('❌');
      expect(result.body).toContain('تكييف');
      expect(result.data.screen).toBe('negotiation');
      expect(result.data.entityId).toBe('order-6');
    });
  });

  // ─── WORK EVENTS ──────────────────────────────────────────────
  describe('WORK_STARTED', () => {
    it('returns correct notification payload', () => {
      const result = mapEventToNotification({
        type: 'WORK_STARTED',
        ctx: { orderId: 'order-7', orderTitle: 'تنظيف' },
      });

      expect(result.type).toBe('WORK_STARTED');
      expect(result.title).toContain('🔨');
      expect(result.body).toContain('تنظيف');
      expect(result.data.screen).toBe('order_details');
      expect(result.data.entityId).toBe('order-7');
    });
  });

  describe('WORK_DONE', () => {
    it('returns correct notification payload', () => {
      const result = mapEventToNotification({
        type: 'WORK_DONE',
        ctx: { orderId: 'order-8' },
      });

      expect(result.type).toBe('WORK_DONE');
      expect(result.title).toContain('🏁');
      expect(result.data.screen).toBe('order_details');
      expect(result.data.entityId).toBe('order-8');
    });
  });

  // ─── PAYMENT EVENTS ──────────────────────────────────────────
  describe('PAYMENT_REQUIRED', () => {
    it('returns payload with amount in body', () => {
      const result = mapEventToNotification({
        type: 'PAYMENT_REQUIRED',
        ctx: { orderId: 'order-9', orderTitle: 'سباكة', amount: 500 },
      });

      expect(result.type).toBe('PAYMENT_REQUIRED');
      expect(result.title).toContain('💳');
      expect(result.body).toContain('500');
      expect(result.body).toContain('سباكة');
      expect(result.data.screen).toBe('payment');
      expect(result.data.entityId).toBe('order-9');
    });
  });

  describe('PAYMENT_RECEIVED', () => {
    it('returns correct notification payload', () => {
      const result = mapEventToNotification({
        type: 'PAYMENT_RECEIVED',
        ctx: { orderId: 'order-10', orderTitle: 'صيانة' },
      });

      expect(result.type).toBe('PAYMENT_RECEIVED');
      expect(result.title).toContain('✅');
      expect(result.body).toContain('صيانة');
      expect(result.data.screen).toBe('order_details');
      expect(result.data.entityId).toBe('order-10');
    });
  });

  // ─── PAYOUT EVENT ─────────────────────────────────────────────
  describe('PAYOUT_COMPLETED', () => {
    it('returns payload with amount in body', () => {
      const result = mapEventToNotification({
        type: 'PAYOUT_COMPLETED',
        ctx: { payoutId: 'payout-1', amount: 1200 },
      });

      expect(result.type).toBe('PAYOUT_COMPLETED');
      expect(result.title).toContain('💸');
      expect(result.body).toContain('1200');
      expect(result.data.screen).toBe('wallet');
      expect(result.data.entityId).toBe('payout-1');
      expect(result.data.entityType).toBe('payout');
    });
  });

  // ─── DISPUTE EVENTS ──────────────────────────────────────────
  describe('DISPUTE_OPENED', () => {
    it('returns correct notification payload', () => {
      const result = mapEventToNotification({
        type: 'DISPUTE_OPENED',
        ctx: { disputeId: 'dispute-1', orderTitle: 'طلب مشكلة' },
      });

      expect(result.type).toBe('DISPUTE_OPENED');
      expect(result.title).toContain('⚠️');
      expect(result.body).toContain('طلب مشكلة');
      expect(result.data.screen).toBe('dispute_details');
      expect(result.data.entityId).toBe('dispute-1');
      expect(result.data.entityType).toBe('dispute');
    });
  });

  describe('DISPUTE_UPDATED', () => {
    it('returns payload with custom update message', () => {
      const result = mapEventToNotification({
        type: 'DISPUTE_UPDATED',
        ctx: { disputeId: 'dispute-2', updateMessage: 'تم إرفاق صور' },
      });

      expect(result.type).toBe('DISPUTE_UPDATED');
      expect(result.title).toContain('📝');
      expect(result.body).toBe('تم إرفاق صور');
      expect(result.data.entityId).toBe('dispute-2');
    });

    it('returns default body when no update message is provided', () => {
      const result = mapEventToNotification({
        type: 'DISPUTE_UPDATED',
        ctx: { disputeId: 'dispute-3' },
      });

      expect(result.body).toBe('تم تحديث حالة النزاع');
    });
  });

  describe('DISPUTE_RESOLVED', () => {
    it('returns payload with custom resolution', () => {
      const result = mapEventToNotification({
        type: 'DISPUTE_RESOLVED',
        ctx: { disputeId: 'dispute-4', resolution: 'تم الاتفاق' },
      });

      expect(result.type).toBe('DISPUTE_RESOLVED');
      expect(result.title).toContain('✅');
      expect(result.body).toBe('تم الاتفاق');
      expect(result.data.entityId).toBe('dispute-4');
    });

    it('returns default body when no resolution is provided', () => {
      const result = mapEventToNotification({
        type: 'DISPUTE_RESOLVED',
        ctx: { disputeId: 'dispute-5' },
      });

      expect(result.body).toBe('تم حل النزاع بنجاح');
    });
  });

  // ─── REFUND EVENT ─────────────────────────────────────────────
  describe('REFUND_PROCESSED', () => {
    it('returns payload with refund amount', () => {
      const result = mapEventToNotification({
        type: 'REFUND_PROCESSED',
        ctx: { orderId: 'order-11', amount: 250 },
      });

      expect(result.type).toBe('REFUND_PROCESSED');
      expect(result.title).toContain('💰');
      expect(result.body).toContain('250');
      expect(result.data.screen).toBe('wallet');
      expect(result.data.entityId).toBe('order-11');
      expect(result.data.entityType).toBe('order');
    });
  });

  // ─── WITHDRAW EVENTS ─────────────────────────────────────────
  describe('WITHDRAW_REQUESTED', () => {
    it('returns payload with withdraw amount', () => {
      const result = mapEventToNotification({
        type: 'WITHDRAW_REQUESTED',
        ctx: { withdrawId: 'wd-1', amount: 800 },
      });

      expect(result.type).toBe('WITHDRAW_REQUESTED');
      expect(result.body).toContain('800');
      expect(result.data.screen).toBe('wallet');
      expect(result.data.entityId).toBe('wd-1');
      expect(result.data.entityType).toBe('withdraw');
    });
  });

  describe('WITHDRAW_APPROVED', () => {
    it('returns payload with approved amount', () => {
      const result = mapEventToNotification({
        type: 'WITHDRAW_APPROVED',
        ctx: { withdrawId: 'wd-2', amount: 600 },
      });

      expect(result.type).toBe('WITHDRAW_APPROVED');
      expect(result.title).toContain('✅');
      expect(result.body).toContain('600');
      expect(result.data.screen).toBe('wallet');
      expect(result.data.entityId).toBe('wd-2');
      expect(result.data.entityType).toBe('withdraw');
    });
  });

  describe('WITHDRAW_REJECTED', () => {
    it('returns payload with rejection reason', () => {
      const result = mapEventToNotification({
        type: 'WITHDRAW_REJECTED',
        ctx: { withdrawId: 'wd-3', rejectionReason: 'رصيد غير كافي' },
      });

      expect(result.type).toBe('WITHDRAW_REJECTED');
      expect(result.title).toContain('❌');
      expect(result.body).toBe('رصيد غير كافي');
      expect(result.data.entityId).toBe('wd-3');
    });

    it('returns default body when no rejection reason is provided', () => {
      const result = mapEventToNotification({
        type: 'WITHDRAW_REJECTED',
        ctx: { withdrawId: 'wd-4' },
      });

      expect(result.body).toBe('تم رفض طلب السحب');
    });
  });

  // ─── ADMIN ACTION EVENT ───────────────────────────────────────
  describe('ADMIN_ACTION', () => {
    describe('WARNING', () => {
      it('returns warning notification with reason', () => {
        const result = mapEventToNotification({
          type: 'ADMIN_ACTION',
          ctx: { userId: 'user-1', actionType: 'WARNING', reason: 'مخالفة الشروط' },
        });

        expect(result.type).toBe('ADMIN_ACTION');
        expect(result.title).toContain('⚠️');
        expect(result.body).toContain('مخالفة الشروط');
        expect(result.data.screen).toBe('profile');
        expect(result.data.entityId).toBe('user-1');
        expect(result.data.entityType).toBe('admin_action');
        expect(result.data.actionType).toBe('WARNING');
      });

      it('returns warning notification without reason', () => {
        const result = mapEventToNotification({
          type: 'ADMIN_ACTION',
          ctx: { userId: 'user-2', actionType: 'WARNING' },
        });

        expect(result.body).toBe('لديك تحذير من الإدارة');
      });
    });

    describe('SUSPENDED', () => {
      it('returns suspension notification with reason', () => {
        const result = mapEventToNotification({
          type: 'ADMIN_ACTION',
          ctx: { userId: 'user-3', actionType: 'SUSPENDED', reason: 'نشاط مشبوه' },
        });

        expect(result.title).toContain('⛔');
        expect(result.body).toContain('نشاط مشبوه');
        expect(result.data.actionType).toBe('SUSPENDED');
      });

      it('returns suspension notification without reason', () => {
        const result = mapEventToNotification({
          type: 'ADMIN_ACTION',
          ctx: { userId: 'user-4', actionType: 'SUSPENDED' },
        });

        expect(result.body).toBe('تم إيقاف حسابك مؤقتاً');
      });
    });

    describe('BANNED', () => {
      it('returns ban notification with reason', () => {
        const result = mapEventToNotification({
          type: 'ADMIN_ACTION',
          ctx: { userId: 'user-5', actionType: 'BANNED', reason: 'احتيال' },
        });

        expect(result.title).toContain('🚫');
        expect(result.body).toContain('احتيال');
        expect(result.data.actionType).toBe('BANNED');
      });

      it('returns ban notification without reason', () => {
        const result = mapEventToNotification({
          type: 'ADMIN_ACTION',
          ctx: { userId: 'user-6', actionType: 'BANNED' },
        });

        expect(result.body).toBe('تم حظر حسابك');
      });
    });
  });

  // ─── UNSUPPORTED TYPE ─────────────────────────────────────────
  describe('Unsupported event type', () => {
    it('throws error for unknown event type', () => {
      expect(() =>
        mapEventToNotification({
          type: 'UNKNOWN_TYPE' as any,
          ctx: {} as any,
        })
      ).toThrow('Unsupported notification type');
    });

    it('throws error message that includes the type name', () => {
      expect(() =>
        mapEventToNotification({
          type: 'SOME_RANDOM_TYPE' as any,
          ctx: {} as any,
        })
      ).toThrow('SOME_RANDOM_TYPE');
    });
  });

  // ─── STRUCTURAL VALIDATION ────────────────────────────────────
  describe('Payload structure', () => {
    it('all payloads have required fields: type, title, body, data', () => {
      const events = [
        { type: 'ORDER_ACCEPTED' as const, ctx: { orderId: '1', orderTitle: 'T' } },
        { type: 'ORDER_CANCELLED' as const, ctx: { orderId: '1', orderTitle: 'T' } },
        { type: 'ORDER_COMPLETED' as const, ctx: { orderId: '1', orderTitle: 'T' } },
        { type: 'NEGOTIATION_OFFER' as const, ctx: { orderId: '1', orderTitle: 'T', proposedAmount: 100 } },
        { type: 'NEGOTIATION_ACCEPTED' as const, ctx: { orderId: '1', orderTitle: 'T' } },
        { type: 'NEGOTIATION_REJECTED' as const, ctx: { orderId: '1', orderTitle: 'T' } },
        { type: 'WORK_STARTED' as const, ctx: { orderId: '1', orderTitle: 'T' } },
        { type: 'WORK_DONE' as const, ctx: { orderId: '1' } },
        { type: 'PAYMENT_REQUIRED' as const, ctx: { orderId: '1', orderTitle: 'T', amount: 100 } },
        { type: 'PAYMENT_RECEIVED' as const, ctx: { orderId: '1', orderTitle: 'T' } },
        { type: 'PAYOUT_COMPLETED' as const, ctx: { payoutId: '1', amount: 100 } },
        { type: 'DISPUTE_OPENED' as const, ctx: { disputeId: '1', orderTitle: 'T' } },
        { type: 'DISPUTE_UPDATED' as const, ctx: { disputeId: '1' } },
        { type: 'DISPUTE_RESOLVED' as const, ctx: { disputeId: '1' } },
        { type: 'REFUND_PROCESSED' as const, ctx: { orderId: '1', amount: 100 } },
        { type: 'WITHDRAW_REQUESTED' as const, ctx: { withdrawId: '1', amount: 100 } },
        { type: 'WITHDRAW_APPROVED' as const, ctx: { withdrawId: '1', amount: 100 } },
        { type: 'WITHDRAW_REJECTED' as const, ctx: { withdrawId: '1' } },
        { type: 'ADMIN_ACTION' as const, ctx: { userId: '1', actionType: 'WARNING' as const } },
      ];

      for (const event of events) {
        const result = mapEventToNotification(event);
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('body');
        expect(result).toHaveProperty('data');
        expect(result.data).toHaveProperty('screen');
        expect(result.data).toHaveProperty('entityId');
        expect(result.data).toHaveProperty('entityType');
        expect(typeof result.title).toBe('string');
        expect(typeof result.body).toBe('string');
        expect(result.title.length).toBeGreaterThan(0);
        expect(result.body.length).toBeGreaterThan(0);
      }
    });
  });
});
