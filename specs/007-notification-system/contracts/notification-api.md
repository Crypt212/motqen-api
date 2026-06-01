# Notification API Contracts

## Endpoints

### GET `/api/v1/notifications`

**Auth**: Required (authenticateAccess + isActive)

**Query Parameters**:

| Param  | Type   | Required | Default | Constraints      |
|--------|--------|----------|---------|------------------|
| cursor | string | No       | —       | Notification ID  |
| limit  | number | No       | 20      | min: 1, max: 50  |

**Response 200**:

```json
{
  "status": "success",
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "ORDER_ACCEPTED",
        "title": "تم قبول طلبك ✅",
        "body": "قبل العامل طلب \"تركيب مكيف\"",
        "data": {
          "screen": "order_details",
          "entityId": "order-uuid",
          "entityType": "order"
        },
        "isSent": true,
        "createdAt": "2026-05-01T20:00:00.000Z"
      }
    ],
    "nextCursor": "uuid-of-last-item-or-null",
    "unreadCount": 5
  }
}
```

---

### POST `/api/v1/notifications/mark-all-read`

**Auth**: Required (authenticateAccess + isActive)

**Body**: None

**Response 200**:

```json
{
  "status": "success",
  "message": "All notifications marked as read",
  "data": { "success": true }
}
```

---

### PATCH `/api/v1/auth/fcm-token`

**Auth**: Required (authenticateAccess + isActive)

**Body**:

```json
{
  "fcmToken": "firebase-token-string"
}
```

**Validation**: `fcmToken` must be a non-empty string.

**Response 200**:

```json
{
  "status": "success",
  "message": "FCM token updated successfully",
  "data": { "success": true }
}
```

**Error 404**: Session not found for current user/device.

---

## Internal Service API (for other services to call)

### `notificationService.notify(userId, event)`

Called by other services (OrderService, PaymentService, etc.) to trigger notifications.

```typescript
import { notificationService } from '../state.js';

// Example: After order is accepted
await notificationService.notify(clientUserId, {
  type: 'ORDER_ACCEPTED',
  ctx: { orderId: order.id, orderTitle: order.title },
});

// Example: After payment received
await notificationService.notify(workerUserId, {
  type: 'PAYMENT_RECEIVED',
  ctx: { orderId: order.id, orderTitle: order.title, amount: 500 },
});

// Example: Admin action
await notificationService.notify(targetUserId, {
  type: 'ADMIN_ACTION',
  ctx: { userId: targetUserId, actionType: 'WARNING', reason: 'مخالفة الشروط' },
});
```

### `notificationService.broadcast(options)`

```typescript
await notificationService.broadcast({
  type: 'ORDER_ACCEPTED',
  title: 'طلبات جديدة متاحة',
  body: 'في 5 طلبات جديدة في منطقتك',
  data: { screen: 'open_orders', entityId: 'gov-id', entityType: 'government' },
  topic: 'gov_cairo',
  targetRole: 'WORKER',
  targetGovId: 'gov-cairo-id',
});
```

---

## FCM Topics Reference

| Topic String           | Subscribers         |
|------------------------|---------------------|
| `gov_${governmentId}`  | Workers in that gov |
| `all_workers`          | All Workers         |
| `all_clients`          | All Clients         |

Topic subscription happens during registration/login — NOT in this feature.

---

## Task Execution Order Checklist

- [ ] **TASK 1**: `npm install firebase-admin`
- [ ] **TASK 2**: Create `src/libs/firebase.ts`
- [ ] **TASK 3a**: Add `fcmToken` + index to Session model in schema
- [ ] **TASK 3b**: Add `lastNotificationReadAt` + `notifications` to User model
- [ ] **TASK 3c**: Add `NotificationType` + `BroadcastTargetRole` enums
- [ ] **TASK 3d**: Add `Notification` model
- [ ] **TASK 3e**: Add `Broadcast` model
- [ ] **TASK 3f**: Run `npx prisma migrate dev` + `npx prisma generate`
- [ ] **TASK 4**: Update `src/domain/session.entity.ts` — add `fcmToken`
- [ ] **TASK 5**: Create `src/notifications/notification.mapper.ts`
- [ ] **TASK 6**: Create `src/notifications/notification.service.ts`
- [ ] **TASK 7**: Create `src/notifications/notification.controller.ts`
- [ ] **TASK 8**: Create `src/routes/v1/notifications.ts`
- [ ] **TASK 9a**: Add `updateFcmToken` handler to `AuthController.ts`
- [ ] **TASK 9b**: Add FCM token route to `src/routes/v1/auth.ts`
- [ ] **TASK 10**: Register notification routes in `src/routes/v1/api.ts`
- [ ] **TASK 11**: Wire up `NotificationService` in `src/state.ts`
- [ ] **TASK 12**: Create `src/cron/notification-retry.cron.ts`
- [ ] **TASK 13a**: Add `notificationService` import to `NegotiationService.ts`
- [ ] **TASK 13b**: Add ORDER_ACCEPTED notification trigger in `acceptNegotiation()`
