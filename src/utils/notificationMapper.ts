import { NotificationType } from 'src/generated/prisma/enums.js';
import type {
  NotificationPayload,
  NotificationEventContext,
} from '../domain/notification.entity.js';

export function mapEventToNotification(event: NotificationEventContext): NotificationPayload {
  switch (event.type) {
    case 'ORDER_ACCEPTED': {
      const { orderId, orderTitle } = event.ctx;
      return {
        type: 'ORDER_ACCEPTED',
        title: 'تم قبول طلبك ✅',
        body: `قبل العامل طلب "${orderTitle}"`,
        data: { screen: 'order_details', entityId: orderId, entityType: 'order' },
      };
    }
    case 'ORDER_CANCELLED': {
      const { orderId, orderTitle } = event.ctx;
      return {
        type: 'ORDER_CANCELLED',
        title: 'تم إلغاء الطلب ❌',
        body: `تم إلغاء طلب "${orderTitle}"`,
        data: { screen: 'order_details', entityId: orderId, entityType: 'order' },
      };
    }
    case 'ORDER_COMPLETED': {
      const { orderId, orderTitle } = event.ctx;
      return {
        type: 'ORDER_COMPLETED',
        title: 'تم إكمال الطلب 🎉',
        body: `تم إكمال طلب "${orderTitle}" بنجاح`,
        data: { screen: 'order_details', entityId: orderId, entityType: 'order' },
      };
    }
    case 'WORK_STARTED': {
      const { orderId, orderTitle } = event.ctx;
      return {
        type: 'WORK_STARTED',
        title: 'بدأ العامل الشغل 🔨',
        body: `بدأ العامل العمل على طلب "${orderTitle}"`,
        data: { screen: 'order_details', entityId: orderId, entityType: 'order' },
      };
    }
    case 'NEGOTIATION_OFFER': {
      const { orderId, orderTitle, proposedAmount } = event.ctx;
      return {
        type: 'NEGOTIATION_OFFER',
        title: 'عرض سعر جديد 💰',
        body: `عرض سعر ${proposedAmount} جنيه على طلب "${orderTitle}"`,
        data: { screen: 'negotiation', entityId: orderId, entityType: 'order' },
      };
    }
    case 'NEGOTIATION_ACCEPTED': {
      const { orderId, orderTitle } = event.ctx;
      return {
        type: 'NEGOTIATION_ACCEPTED',
        title: 'تم قبول عرض السعر ✅',
        body: `تم الموافقة على السعر في طلب "${orderTitle}"`,
        data: { screen: 'negotiation', entityId: orderId, entityType: 'order' },
      };
    }
    case 'NEGOTIATION_REJECTED': {
      const { orderId, orderTitle } = event.ctx;
      return {
        type: 'NEGOTIATION_REJECTED',
        title: 'تم رفض عرض السعر ❌',
        body: `تم رفض عرض السعر في طلب "${orderTitle}"`,
        data: { screen: 'negotiation', entityId: orderId, entityType: 'order' },
      };
    }
    case 'WORK_STARTED': {
      const { orderId, orderTitle } = event.ctx;
      return {
        type: 'WORK_STARTED',
        title: 'بدأ العامل الشغل 🔨',
        body: `بدأ العامل العمل على طلب "${orderTitle}"`,
        data: { screen: 'order_details', entityId: orderId, entityType: 'order' },
      };
    }
    case 'WORK_DONE': {
      const { orderId, workerId } = event.ctx;
      return {
        type: 'WORK_DONE',
        title: 'انتهى العامل من طلبك 🏁',
        body: 'راجع وأكد الاستلام',
        data: {
          screen: 'order_details',
          entityId: orderId,
          workerId: workerId,
          entityType: 'order',
        },
      };
    }
    case 'PAYMENT_REQUIRED': {
      const { orderId, orderTitle, amount } = event.ctx;
      return {
        type: 'PAYMENT_REQUIRED',
        title: 'مطلوب دفع 💳',
        body: `ادفع ${amount} جنيه لطلب "${orderTitle}"`,
        data: { screen: 'payment', entityId: orderId, entityType: 'order' },
      };
    }
    case 'PAYMENT_RECEIVED': {
      const { orderId, orderTitle } = event.ctx;
      return {
        type: 'PAYMENT_RECEIVED',
        title: 'تم استلام الدفع ✅',
        body: `تم الدفع لطلب "${orderTitle}" بنجاح`,
        data: { screen: 'order_details', entityId: orderId, entityType: 'order' },
      };
    }
    case 'PAYOUT_COMPLETED': {
      const { payoutId, amount } = event.ctx;
      return {
        type: 'PAYOUT_COMPLETED',
        title: 'تم تحويل أرباحك 💸',
        body: `تم تحويل ${amount} جنيه لحسابك`,
        data: { screen: 'wallet', entityId: payoutId, entityType: 'payout' },
      };
    }
    case 'DISPUTE_OPENED': {
      const { disputeId, orderTitle } = event.ctx;
      return {
        type: 'DISPUTE_OPENED',
        title: 'تم فتح نزاع ⚠️',
        body: `تم فتح نزاع على طلب "${orderTitle}"`,
        data: { screen: 'dispute_details', entityId: disputeId, entityType: 'dispute' },
      };
    }
    case 'DISPUTE_UPDATED': {
      const { disputeId, updateMessage } = event.ctx;
      return {
        type: 'DISPUTE_UPDATED',
        title: 'تحديث على النزاع 📝',
        body: updateMessage || 'تم تحديث حالة النزاع',
        data: { screen: 'dispute_details', entityId: disputeId, entityType: 'dispute' },
      };
    }
    case 'DISPUTE_RESOLVED': {
      const { disputeId, resolution } = event.ctx;
      return {
        type: 'DISPUTE_RESOLVED',
        title: 'تم حل النزاع ✅',
        body: resolution || 'تم حل النزاع بنجاح',
        data: { screen: 'dispute_details', entityId: disputeId, entityType: 'dispute' },
      };
    }
    case 'REFUND_PROCESSED': {
      const { orderId, amount } = event.ctx;
      return {
        type: 'REFUND_PROCESSED',
        title: 'تم استرداد المبلغ 💰',
        body: `تم استرداد ${amount} جنيه`,
        data: { screen: 'wallet', entityId: orderId, entityType: 'order' },
      };
    }
    case 'WITHDRAW_REQUESTED': {
      const { withdrawId, amount } = event.ctx;
      return {
        type: 'WITHDRAW_REQUESTED',
        title: 'طلب سحب جديد 📤',
        body: `تم تقديم طلب سحب ${amount} جنيه`,
        data: { screen: 'wallet', entityId: withdrawId, entityType: 'withdraw' },
      };
    }
    case 'WITHDRAW_APPROVED': {
      const { withdrawId, amount } = event.ctx;
      return {
        type: 'WITHDRAW_APPROVED',
        title: 'تمت الموافقة على السحب ✅',
        body: `تمت الموافقة على سحب ${amount} جنيه`,
        data: { screen: 'wallet', entityId: withdrawId, entityType: 'withdraw' },
      };
    }
    case 'WITHDRAW_REJECTED': {
      const { withdrawId, rejectionReason } = event.ctx;
      return {
        type: 'WITHDRAW_REJECTED',
        title: 'تم رفض طلب السحب ❌',
        body: rejectionReason || 'تم رفض طلب السحب',
        data: { screen: 'wallet', entityId: withdrawId, entityType: 'withdraw' },
      };
    }
    case 'ADMIN_ACTION': {
      const { userId, actionType, reason } = event.ctx;
      const titles: Record<string, string> = {
        WARNING: 'تحذير من الإدارة ⚠️',
        SUSPENDED: 'تم إيقاف حسابك ⛔',
        BANNED: 'تم حظر حسابك 🚫',
      };
      const bodies: Record<string, string> = {
        WARNING: reason ? `تحذير: ${reason}` : 'لديك تحذير من الإدارة',
        SUSPENDED: reason ? `تم الإيقاف: ${reason}` : 'تم إيقاف حسابك مؤقتاً',
        BANNED: reason ? `تم الحظر: ${reason}` : 'تم حظر حسابك',
      };
      return {
        type: 'ADMIN_ACTION',
        title: titles[actionType],
        body: bodies[actionType],
        data: {
          screen: 'profile',
          entityId: userId,
          entityType: 'admin_action',
          actionType,
        },
      };
    }
    case 'RATING': {
      const { orderId, orderTitle } = event.ctx;
      return {
        type: 'RATING',
        title: 'تم تقييم طلبك ⭐',
        body: `تم تقييم طلب "${orderTitle}" من قبل العميل`,
        data: { screen: 'order_details', entityId: orderId, entityType: 'order' },
      };
    }
    case 'NEW_ORDER': {
      const { orderId, orderTitle } = event.ctx;
      return {
        type: 'NEW_ORDER',
        title: 'لديك طلب جديد 🆕',
        body: `تم إنشاء طلب جديد بعنوان "${orderTitle}"`,
        data: { screen: 'order_details', entityId: orderId, entityType: 'order' },
      };
    }
    case 'ORDER_RATED': {
      const { orderId, orderTitle } = event.ctx;
      return {
        type: 'ORDER_RATED',
        title: 'تم تقييم طلبك ⭐',
        body: `تم تقييم طلب "${orderTitle}" من قبل العميل`,
        data: { screen: 'order_details', entityId: orderId, entityType: 'order' },
      };
    }
    case 'TEST_NOTIFICATION': {
      const { message } = event.ctx;
      return {
        type: 'TEST_NOTIFICATION',
        title: 'هذه رسالة اختبار 🧪',
        body: message || 'هذه رسالة اختبار للتحقق من نظام الإشعارات',
        data: { screen: 'home', entityId: 'test', entityType: 'none' },
      };
    }
    default:
      throw new Error(
        `Unsupported notification type: ${(event as { type: NotificationType }).type}`
      );
  }
}
