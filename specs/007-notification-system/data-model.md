# Data Model & Implementation Code

## TASK 1: Install firebase-admin

```bash
npm install firebase-admin
```

## TASK 2: Create `src/libs/firebase.ts`

```typescript
import admin from 'firebase-admin';
import { logger } from './winston.js';

let firebaseReady = false;

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (raw) {
  try {
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseReady = true;
    logger.info('✅ Firebase Admin initialized');
  } catch (error) {
    logger.warn('⚠️ Firebase Admin initialization failed — push notifications disabled', error);
  }
} else {
  logger.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not set — push notifications disabled');
}

export default admin;
export { firebaseReady };
```

> **IMPORTANT**: Add `FIREBASE_SERVICE_ACCOUNT` to `.env.example` with a comment explaining it expects the full service account JSON string.

---

## TASK 3: Prisma Schema Changes

### 3a — Add to Session model (after `userAgent` field, around line 19):

```prisma
  fcmToken   String?
```

And add this index inside the Session model block (before `@@map`):

```prisma
  @@index([userId, isRevoked])
```

### 3b — Add to User model (after `workerProfile` field, around line 46):

```prisma
  lastNotificationReadAt DateTime?
  notifications          Notification[]
```

### 3c — Append these enums at end of `schema.prisma`:

```prisma
enum NotificationType {
  ORDER_ACCEPTED
  ORDER_CANCELLED
  ORDER_COMPLETED
  NEGOTIATION_OFFER
  NEGOTIATION_ACCEPTED
  NEGOTIATION_REJECTED
  WORK_STARTED
  WORK_DONE
  PAYMENT_REQUIRED
  PAYMENT_RECEIVED
  PAYOUT_COMPLETED
  DISPUTE_OPENED
  DISPUTE_UPDATED
  DISPUTE_RESOLVED
  REFUND_PROCESSED
  WITHDRAW_REQUESTED
  WITHDRAW_APPROVED
  WITHDRAW_REJECTED
  ADMIN_ACTION
}

enum BroadcastTargetRole {
  WORKER
  CLIENT
  ALL
}
```

### 3d — Append Notification model:

```prisma
model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  body      String
  data      Json
  isSent    Boolean          @default(false)
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([isSent, createdAt])
  @@map("notifications")
}
```

### 3e — Append Broadcast model:

```prisma
model Broadcast {
  id          String               @id @default(uuid())
  type        NotificationType
  title       String
  body        String
  data        Json
  targetRole  BroadcastTargetRole?
  targetGovId String?
  createdAt   DateTime             @default(now())

  @@index([targetRole, createdAt])
  @@index([targetGovId, createdAt])
  @@map("broadcasts")
}
```

### 3f — Run migration:

```bash
npx prisma migrate dev --name add-notification-system
npx prisma generate
```

---

## TASK 4: Update `src/domain/session.entity.ts`

Add `fcmToken` field to the `Session` type (after `userAgent`):

```typescript
  fcmToken: string | null;
```

---

## TASK 5: Create `src/notifications/notification.mapper.ts`

This is the FULL file content. Copy exactly:

```typescript
import { NotificationType } from '../generated/prisma/client.js';

// ─── Data shape for every notification ─────────────────────────────────

export interface NotificationData {
  screen:
    | 'order_details'
    | 'negotiation'
    | 'payment'
    | 'wallet'
    | 'dispute_details'
    | 'profile'
    | 'open_orders'
    | 'announcement';
  entityId: string;
  entityType:
    | 'order'
    | 'dispute'
    | 'payout'
    | 'withdraw'
    | 'admin_action'
    | 'government'
    | 'broadcast';
  actionType?: 'WARNING' | 'SUSPENDED' | 'BANNED';
  openOrdersCount?: string;
}

// ─── Context interfaces (input per event type) ────────────────────────

export interface OrderEventContext {
  orderId: string;
  orderTitle: string;
}

export interface NegotiationEventContext {
  orderId: string;
  orderTitle: string;
  proposedAmount: number;
}

export interface PaymentEventContext {
  orderId: string;
  orderTitle: string;
  amount: number;
}

export interface PayoutEventContext {
  payoutId: string;
  amount: number;
}

export interface DisputeEventContext {
  disputeId: string;
  orderId: string;
  orderTitle: string;
  updateMessage?: string;
  resolution?: string;
}

export interface WithdrawEventContext {
  withdrawId: string;
  amount: number;
  rejectionReason?: string;
}

export interface AdminActionEventContext {
  userId: string;
  actionType: 'WARNING' | 'SUSPENDED' | 'BANNED';
  reason?: string;
}

export interface RefundEventContext {
  orderId: string;
  amount: number;
}

// ─── Discriminated union ───────────────────────────────────────────────

export type NotificationEventContext =
  | { type: 'ORDER_ACCEPTED'; ctx: OrderEventContext }
  | { type: 'ORDER_CANCELLED'; ctx: OrderEventContext }
  | { type: 'ORDER_COMPLETED'; ctx: OrderEventContext }
  | { type: 'NEGOTIATION_OFFER'; ctx: NegotiationEventContext }
  | { type: 'NEGOTIATION_ACCEPTED'; ctx: NegotiationEventContext }
  | { type: 'NEGOTIATION_REJECTED'; ctx: NegotiationEventContext }
  | { type: 'WORK_STARTED'; ctx: OrderEventContext }
  | { type: 'WORK_DONE'; ctx: OrderEventContext }
  | { type: 'PAYMENT_REQUIRED'; ctx: PaymentEventContext }
  | { type: 'PAYMENT_RECEIVED'; ctx: PaymentEventContext }
  | { type: 'PAYOUT_COMPLETED'; ctx: PayoutEventContext }
  | { type: 'DISPUTE_OPENED'; ctx: DisputeEventContext }
  | { type: 'DISPUTE_UPDATED'; ctx: DisputeEventContext }
  | { type: 'DISPUTE_RESOLVED'; ctx: DisputeEventContext }
  | { type: 'REFUND_PROCESSED'; ctx: RefundEventContext }
  | { type: 'WITHDRAW_REQUESTED'; ctx: WithdrawEventContext }
  | { type: 'WITHDRAW_APPROVED'; ctx: WithdrawEventContext }
  | { type: 'WITHDRAW_REJECTED'; ctx: WithdrawEventContext }
  | { type: 'ADMIN_ACTION'; ctx: AdminActionEventContext };

// ─── Output payload ────────────────────────────────────────────────────

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data: NotificationData;
}

// ─── Mapper function ───────────────────────────────────────────────────

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
      const { orderId } = event.ctx;
      return {
        type: 'WORK_DONE',
        title: 'انتهى العامل من طلبك 🏁',
        body: 'راجع وأكد الاستلام',
        data: { screen: 'order_details', entityId: orderId, entityType: 'order' },
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
  }
}
```

> **NEXT**: See [data-model-service.md](./data-model-service.md) for TASK 6-12 (Service, Controller, Routes, Cron)
