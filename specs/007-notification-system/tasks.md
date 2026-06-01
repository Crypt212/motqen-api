# Tasks: Notification System

**Input**: Design documents from `/specs/007-notification-system/`
**Prerequisites**: plan.md, data-model.md, data-model-service.md, contracts/notification-api.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## User Stories

- **US1**: Core notification infrastructure (schema, Firebase, mapper, service)
- **US2**: HTTP API (controller, routes, auth FCM token endpoint)
- **US3**: Retry mechanism (cron job for failed notifications)
- **US4**: Example trigger integration (ORDER_ACCEPTED in NegotiationService)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependency and initialize Firebase

- [ ] T001 Install firebase-admin dependency: run `npm install firebase-admin`
- [ ] T002 Create Firebase Admin init module in `src/libs/firebase.ts` — use `FIREBASE_SERVICE_ACCOUNT` env var with `JSON.parse`, export `firebaseReady` boolean for graceful degradation (see data-model.md TASK 2)
- [ ] T003 [P] Add `FIREBASE_SERVICE_ACCOUNT` entry to `.env.example` with comment explaining it expects the full service account JSON string

**Checkpoint**: Firebase module exists and exports `admin` + `firebaseReady`. Server boots without Firebase credentials (graceful degradation).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prisma schema changes and domain entity updates that ALL stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Add `fcmToken String?` field to Session model in `prisma/schema.prisma` (after `userAgent` field, around line 19)
- [ ] T005 Add `@@index([userId, isRevoked])` index to Session model in `prisma/schema.prisma` (before `@@map`)
- [ ] T006 Add `lastNotificationReadAt DateTime?` and `notifications Notification[]` to User model in `prisma/schema.prisma` (after `workerProfile` field, around line 46)
- [ ] T007 Append `NotificationType` enum (19 values) and `BroadcastTargetRole` enum to end of `prisma/schema.prisma` (see data-model.md TASK 3c)
- [ ] T008 Append `Notification` model to `prisma/schema.prisma` with indexes on `[userId, createdAt]` and `[isSent, createdAt]` (see data-model.md TASK 3d)
- [ ] T009 Append `Broadcast` model to `prisma/schema.prisma` with indexes on `[targetRole, createdAt]` and `[targetGovId, createdAt]` (see data-model.md TASK 3e)
- [ ] T010 Run Prisma migration: `npx prisma migrate dev --name add-notification-system` then `npx prisma generate`
- [ ] T011 Add `fcmToken: string | null` field to Session type in `src/domain/session.entity.ts` (after `userAgent`)

**Checkpoint**: Schema migrated, Prisma client regenerated, Session entity updated. Run `npx tsc --noEmit` to verify no type errors.

---

## Phase 3: User Story 1 — Core Notification Infrastructure (Priority: P1) 🎯 MVP

**Goal**: Create the notification mapper and service — the core engine that creates notifications in DB and sends FCM pushes.

**Independent Test**: Import `NotificationService`, call `notify()` with a test userId and ORDER_ACCEPTED event — verify a Notification row is created in DB with correct title/body/data. Verify `getNotifications()` returns it. Verify `markAllRead()` updates `lastNotificationReadAt`. Verify `getUnreadCount()` returns correct cached count.

### Implementation for User Story 1

- [ ] T012 [US1] Create notification mapper in `src/notifications/notification.mapper.ts` — full file from data-model.md TASK 5. Exports: `NotificationData`, `NotificationEventContext`, `NotificationPayload`, `mapEventToNotification()`
- [ ] T013 [US1] Create notification service in `src/notifications/notification.service.ts` — full file from data-model-service.md TASK 6. Includes: `notify()`, `broadcast()`, `markAllRead()`, `getNotifications()`, `getUnreadCount()`, `sendFCMToUser()` with `firebaseReady` guard, `serializeData()`
- [ ] T014 [US1] Wire up NotificationService in `src/state.ts` — add import for `NotificationService` from `./notifications/notification.service.js` and export `notificationService = new NotificationService(prisma, redisClient)` (see data-model-service.md TASK 11)

**Checkpoint**: `notificationService` singleton exists in `state.ts`. The mapper correctly transforms all 19 event types into Arabic title/body payloads. Run `npx tsc --noEmit` to verify.

---

## Phase 4: User Story 2 — HTTP API Endpoints (Priority: P2)

**Goal**: Expose notification endpoints for the mobile app: list notifications, mark all read, update FCM token.

**Independent Test**: Call `GET /api/v1/notifications` with auth header → returns `{ notifications, nextCursor, unreadCount }`. Call `POST /api/v1/notifications/mark-all-read` → returns success. Call `PATCH /api/v1/auth/fcm-token` with body `{ fcmToken: "test" }` → session's fcmToken updated.

### Implementation for User Story 2

- [ ] T015 [P] [US2] Create notification controller in `src/notifications/notification.controller.ts` — exports `getNotifications` and `markAllRead` handlers using `asyncHandler` pattern (see data-model-service.md TASK 7)
- [ ] T016 [P] [US2] Create notification routes in `src/routes/v1/notifications.ts` — GET `/` with Zod query validation and POST `/mark-all-read` (see data-model-service.md TASK 8)
- [ ] T017 [US2] Register notification routes in `src/routes/v1/api.ts` — add `import notificationRouter` and `mainRouter.use('/notifications', authenticateAccess, isActive, notificationRouter)` after the orders line (see data-model-service.md TASK 10)
- [ ] T018 [US2] Add `updateFcmToken` handler to `src/controllers/AuthController.ts` — finds session by `userId + deviceId`, updates `fcmToken`. Add `import prisma from '../libs/database.js'` at top (see data-model-service.md TASK 9a)
- [ ] T019 [US2] Add FCM token route to `src/routes/v1/auth.ts` — import `updateFcmToken`, `z`, `validateBody`, add `FcmTokenSchema`, add `authRouter.patch('/fcm-token', authenticateAccess, isActive, validateBody(FcmTokenSchema), updateFcmToken)` (see data-model-service.md TASK 9b)

**Checkpoint**: All 3 endpoints respond correctly. `GET /notifications` returns paginated results with cursor. `PATCH /auth/fcm-token` updates the session. Run `npx tsc --noEmit`.

---

## Phase 5: User Story 3 — Retry Cron Job (Priority: P3)

**Goal**: Create a standalone retry script that re-sends failed notifications every 10 minutes.

**Independent Test**: Create a notification with `isSent: false` in DB. Run the cron script. If Firebase is configured, verify the notification gets marked `isSent: true`. If not, verify the script logs warnings and doesn't crash.

### Implementation for User Story 3

- [ ] T020 [US3] Create retry cron in `src/cron/notification-retry.cron.ts` — standalone script with own Prisma instance, processes unsent notifications in batches of 100, max age 24h, cleans invalid FCM tokens (see data-model-service.md TASK 12)

**Checkpoint**: Script can be run standalone with `npx tsx src/cron/notification-retry.cron.ts`. It logs found notifications and exits gracefully.

---

## Phase 6: User Story 4 — Example Trigger Integration (Priority: P4)

**Goal**: Add one real notification trigger (ORDER_ACCEPTED) to prove the system works end-to-end.

**Independent Test**: Accept a negotiation via the API. Verify a Notification record is created for the client with `type: ORDER_ACCEPTED` and Arabic title "تم قبول طلبك ✅".

### Implementation for User Story 4

- [ ] T021 [US4] Add `notificationService` import to `src/services/NegotiationService.ts` — add `import { notificationService } from '../state.js'` at top (see data-model-service.md TASK 13a)
- [ ] T022 [US4] Add ORDER_ACCEPTED notification trigger in `acceptNegotiation()` method of `src/services/NegotiationService.ts` — after `this.notifyOpponent(...)` call, resolve client userId from clientProfileId, call `notificationService.notify()` fire-and-forget (see data-model-service.md TASK 13b)

**Checkpoint**: Full end-to-end flow works: negotiation accepted → notification created in DB → FCM sent (if configured). Run `npx tsc --noEmit`.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories

- [ ] T023 Run full TypeScript type-check: `npx tsc --noEmit` — fix any errors
- [ ] T024 [P] Verify Prisma migration is clean: `npx prisma migrate status`
- [ ] T025 [P] Verify server starts without `FIREBASE_SERVICE_ACCOUNT` set — should log warning but not crash

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 (firebase-admin installed) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on US1 (T014 — notificationService in state.ts)
- **US3 (Phase 5)**: Depends on Phase 2 only (standalone script, no dependency on US1/US2)
- **US4 (Phase 6)**: Depends on US1 (T014 — notificationService in state.ts)
- **Polish (Phase 7)**: Depends on all phases complete

### User Story Dependencies

```
Phase 1 (Setup) ──► Phase 2 (Schema) ──┬──► US1 (Service) ──┬──► US2 (API)
                                        │                    └──► US4 (Trigger)
                                        └──► US3 (Cron) [independent]
```

### Parallel Opportunities

- T002 and T003 can run in parallel (different files)
- T004–T009 are sequential (same file: schema.prisma)
- T015 and T016 can run in parallel (different files)
- US3 and US1 can run in parallel (completely independent)
- US2 and US4 can run in parallel after US1 (different files)

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Schema + Migration (T004–T011)
3. Complete Phase 3: US1 — mapper + service + state.ts (T012–T014)
4. **STOP and VALIDATE**: Type-check passes, service instantiates
5. Ready for API and trigger integration

### Incremental Delivery

1. Setup + Schema → Foundation ready
2. Add US1 (Service) → Core engine works
3. Add US2 (API) → Mobile app can fetch notifications
4. Add US4 (Trigger) → First real notification flows end-to-end
5. Add US3 (Cron) → Failed deliveries retry automatically

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- ALL code is pre-written in companion docs — each task references the exact source
- Use `.js` extension in ALL imports (project convention)
- Use `uuid()` not `cuid()` for IDs (project convention)
- Use `isRevoked: false` not `isActive: true` for session queries
- Arabic strings for all user-facing title/body text
- Commit after each phase checkpoint
