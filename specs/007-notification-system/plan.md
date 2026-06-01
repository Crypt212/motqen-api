# Implementation Plan: Notification System

**Branch**: `007-notification-system` | **Date**: 2026-05-01
**Input**: Detailed notification system specification

## Summary

Build a production-ready push notification system for the Motqen marketplace backend. The system handles per-user notifications triggered by order/payment/dispute lifecycle events, broadcasts to user segments, FCM push delivery with token management, cursor-based pagination, unread counts with Redis caching, and a retry cron for failed deliveries.

## Clarifications

### Session 2026-05-01

- Q: Infrastructure + triggers in same PR or separate? → A: Infrastructure + one example trigger (ORDER_ACCEPTED) as demo
- Q: Firebase credentials strategy? → A: `FIREBASE_SERVICE_ACCOUNT` env var with inline JSON, parsed via `JSON.parse`
- Q: Behavior when Firebase unavailable? → A: Graceful degradation — server runs normally, FCM calls skipped with warning log
- Q: Where does ORDER_ACCEPTED trigger? → A: When order status becomes `PRICE_AGREED` (in NegotiationService.acceptNegotiation)
- Q: ORDER_ACCEPTED notification sent to whom? → A: Client only — "العامل وافق، ادفع دلوقتي"

## Technical Context

- **Language/Version**: TypeScript (ES2022, NodeNext modules)
- **Primary Dependencies**: Express 5, Prisma 7 (PostgreSQL + PrismaPg adapter), Redis 5, Firebase Admin SDK (NEW — must install)
- **Storage**: PostgreSQL via Prisma, Redis for caching
- **Testing**: Vitest
- **Target Platform**: Node.js server (Render/Railway)
- **Project Type**: REST API backend
- **Scale/Scope**: <10K users

---

## Key Codebase Patterns (MUST FOLLOW)

### Pattern 1: Imports use `.js` extensions
```typescript
import prisma from '../libs/database.js';
import redisClient from '../libs/redis.js';
```

### Pattern 2: Prisma client import path
```typescript
import { PrismaClient } from '../generated/prisma/client.js';
// NOT from '@prisma/client'
```

### Pattern 3: Response pattern
```typescript
import SuccessResponse from '../responses/successResponse.js';
new SuccessResponse('message', data, statusCode).send(res);
```

### Pattern 4: Error pattern
```typescript
import AppError from '../errors/AppError.js';
throw new AppError('message', statusCode);
```

### Pattern 5: Controller style
Use **function-based** style (like AuthController): exported `asyncHandler` functions using singletons from `state.ts`.

### Pattern 6: asyncHandler wrapper
```typescript
import { asyncHandler } from '../types/asyncHandler.js';
export const myHandler = asyncHandler(async (req, res) => { ... });
```

### Pattern 7: Authentication
```typescript
import { authenticateAccess, isActive } from '../../middlewares/authMiddleware.js';
// req.userState.userId — authenticated user's ID
```

### Pattern 8: Validation
```typescript
import { validateBody, validateQuery } from '../../middlewares/validateRequest.js';
import { z } from 'zod';
```

### Pattern 9: State.ts is the DI container
All singletons are instantiated and exported from `src/state.ts`.

### Pattern 10: IDs use `uuid` not `cuid`
The existing schema uses `@default(uuid())` everywhere.

### Pattern 11: Role enum
Existing `Role` enum: `USER | ADMIN`. Workers/clients distinguished by `workerProfile`/`clientProfile` existence.

### Pattern 12: Session uses `isRevoked` not `isActive`
Active sessions: `isRevoked: false`. There is NO `isActive` field.

---

## Adapting Plan to Real Codebase

| Plan Says | Reality | What To Do |
|-----------|---------|------------|
| `@default(cuid())` | Project uses `@default(uuid())` | Use `uuid()` |
| `Session.isActive` | Session has `isRevoked` | Filter `isRevoked: false` |
| `Role: WORKER/CLIENT/ADMIN` | Role: `USER/ADMIN` | Use profile existence for targeting |
| `req.session.id` for FCM | No session ID on request | Use `userId + deviceId` to find session |
| `import from '../lib/redis'` | Path: `../libs/redis.js` | Use `../libs/redis.js` |

---

## File Structure

### New files to CREATE

```
src/
├── notifications/
│   ├── notification.mapper.ts
│   ├── notification.service.ts
│   └── notification.controller.ts
├── cron/
│   └── notification-retry.cron.ts
├── libs/
│   └── firebase.ts
└── routes/v1/
    └── notifications.ts
```

### Existing files to MODIFY

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add Notification, Broadcast models + modify User, Session |
| `src/state.ts` | Add NotificationService instantiation |
| `src/routes/v1/api.ts` | Register notification routes |
| `src/routes/v1/auth.ts` | Add PATCH fcm-token route |
| `src/controllers/AuthController.ts` | Add updateFcmToken handler |
| `src/domain/session.entity.ts` | Add fcmToken field |
| `src/services/NegotiationService.ts` | Add ORDER_ACCEPTED notification trigger (example) |

---

## Ordered Implementation Tasks

See the companion files for full code:
- [data-model.md](./data-model.md) — Tasks 1-5: Firebase, schema, mapper
- [data-model-service.md](./data-model-service.md) — Tasks 6-13: Service, controller, routes, cron, example trigger
- [contracts/notification-api.md](./contracts/notification-api.md) — HTTP API contracts + task checklist
