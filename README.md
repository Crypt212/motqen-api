# Motqen — Backend API

> A marketplace backend for home-services in Egypt, connecting clients who need maintenance work (plumbing, electrical, AC, painting, etc.) with verified workers — built with Express 5, Prisma, PostgreSQL, Redis, and Socket.IO.

---

## Table of Contents

- [What Is Motqen?](#what-is-motqen)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Directory Structure](#directory-structure)
- [Domain Model](#domain-model)
- [Order Lifecycle & State Machine](#order-lifecycle--state-machine)
- [API Reference](#api-reference)
- [Real-Time (WebSocket)](#real-time-websocket)
- [Financial Pipeline](#financial-pipeline)
- [External Providers](#external-providers)
- [Infrastructure](#infrastructure)
- [Getting Started](#getting-started)
- [Scripts Reference](#scripts-reference)
- [Testing](#testing)
- [Architectural Analysis](#architectural-analysis)

---

## What Is Motqen?

Motqen (مُتقِن — "Masterful" in Arabic) is a home-services marketplace for the Egyptian market. Think of it as a local TaskRabbit/Thumbtack:

1. **Clients** post service orders (fix a pipe, install an AC, paint a wall).
2. **Workers** get matched — either directly by the client picking a specific worker (**Direct orders**), or by the client posting a job publicly and workers submitting competitive proposals (**Global orders**).
3. The platform manages the full lifecycle: negotiation → payment → escrow → work execution → review → payout.

### Key Business Features

| Feature | Description |
|---------|-------------|
| **Phone-based OTP Auth** | No passwords — SMS/WhatsApp OTP login |
| **Dual Profiles** | Users can be both a client and a worker |
| **Direct & Global Orders** | Two order modes with distinct flows |
| **Price Negotiation** | Turn-based counter-offer system |
| **Proposal System** | Workers compete on global orders |
| **Escrow Payments** | Funds held until work completion (via Paymob) |
| **Real-Time Chat** | Socket.IO with contact-info detection & flagging |
| **Worker Verification** | National ID upload + admin approval |
| **Worker Scheduling** | Weekly availability + occupied time slots |
| **Push Notifications** | Firebase Cloud Messaging |
| **Admin Dashboard** | User management, verification, disputes, financials |
| **Dispute Resolution** | Client/worker disputes with admin mediation |
| **Worker Payouts** | Bank / InstaPay / Mobile Wallet withdrawals |
| **Reporting System** | Users report orders, messages, or profiles |
| **Geographic Hierarchy** | Governorates → Cities → Locations with PostGIS |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js (ESM) |
| **Framework** | Express 5 |
| **Language** | TypeScript (strict) |
| **ORM** | Prisma 7 with `@prisma/adapter-pg` |
| **Database** | PostgreSQL (Supabase-hosted) with PostGIS |
| **Cache / Pub-Sub** | Redis (Upstash) |
| **Real-Time** | Socket.IO with Redis adapter |
| **Validation** | Zod 4 + `zod-to-openapi` |
| **Auth** | JWT (access + refresh tokens) |
| **File Uploads** | Multer → Cloudinary |
| **SMS** | Twilio |
| **WhatsApp** | Baileys (unofficial API) |
| **Push Notifications** | Firebase Admin SDK (FCM) |
| **Payment Gateway** | Paymob (Egypt) |
| **API Docs** | Swagger UI (`/docs`) via OpenAPI 3 |
| **Transpilation** | SWC (build) + tsx (dev) |
| **Testing** | Vitest + Supertest |
| **Linting** | ESLint + Prettier + Husky + lint-staged |
| **Logging** | Winston (console + file) |

---

## Architecture Overview

The codebase follows a **layered architecture** with manual dependency injection:

```
┌─────────────────────────────────────────────────────┐
│                    Express App                       │
│  helmet → cors → json → rateLimiter → routes         │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              Routes (v1)                             │
│  validateRequest(zodSchema) → authMiddleware         │
│  → accessMiddleware → controller                     │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              Controllers                             │
│  Extract req data → call service → format response   │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              Services                                │
│  Business logic, validation, state transitions       │
│  Calls repositories, cache, providers                │
└────────┬───────────┬──────────────┬─────────────────┘
         │           │              │
    ┌────▼───┐  ┌────▼────┐  ┌─────▼──────┐
    │ Repos  │  │  Cache   │  │ Providers  │
    │(Prisma)│  │ (Redis)  │  │(Cloudinary,│
    │        │  │          │  │ Twilio,    │
    │        │  │          │  │ Firebase,  │
    │        │  │          │  │ Paymob)    │
    └────────┘  └──────────┘  └────────────┘
```

### Dependency Injection via `state.ts`

All instantiation happens in a single [`state.ts`](src/state.ts) file — a **composition root** that wires repositories, caches, services, and controllers together. There is no DI container; dependencies are passed manually via constructor injection.

### Key Patterns

| Pattern | Usage |
|---------|-------|
| **Repository Pattern** | Abstracts Prisma behind interfaces (fully adopted) |
| **Service Layer** | All business logic lives here — controllers are thin |
| **Composition Root** | `state.ts` wires everything |
| **Zod Schemas** | Request validation + OpenAPI generation from single source |
| **State Machine** | Order/work status transitions via `stateMachine.ts` |
| **Serializable Transactions** | Critical paths (accept proposal, accept negotiation) use `TransactionManager` |
| **Optimistic Locking** | `WorkerBalance.version` for concurrent financial ops |
| **Idempotency Keys** | All financial mutations (payment, escrow, refund, payout) |

---

## Directory Structure

```
src/
├── app.ts                    # Express app initialization (middleware chain)
├── server.ts                 # HTTP server + Socket.IO + startup
├── state.ts                  # Composition root (DI wiring)
│
├── routes/v1/                # Route definitions + validation
│   ├── api.ts                #   Main router (mounts all sub-routers)
│   ├── auth.ts               #   /auth
│   ├── orders.ts             #   /orders (+ nested proposals, negotiations)
│   ├── proposals.ts          #   /orders/:orderId/proposals
│   ├── workers.ts            #   /workers
│   ├── chat.ts               #   /chat
│   ├── governments.ts        #   /governments (+ cities, locations)
│   ├── specializations.ts    #   /specializations
│   ├── notifications.ts      #   /notifications
│   ├── dashboard.ts          #   /me (user dashboard)
│   ├── reports.ts            #   /reports
│   ├── payments.ts           #   /payments
│   ├── webhooks.ts           #   /webhooks
│   ├── locations.ts          #   /locations (not currently mounted)
│   └── financial/            #   /admin/* financial routes
│       ├── admin-dashboard.ts
│       ├── disputes.ts
│       ├── escrow.ts
│       ├── refunds.ts
│       ├── withdrawals.ts
│       └── worker-earnings.ts
│
├── controllers/              # Request handlers (thin — delegate to services)
│   ├── AuthController.ts
│   ├── OrderController.ts
│   ├── ProposalController.ts
│   ├── NegotiationController.ts
│   ├── ChatController.ts
│   ├── WorkerController.ts
│   ├── DashboardController.ts
│   ├── GovernmentController.ts
│   ├── LocationController.ts
│   ├── SpecializationController.ts
│   ├── NotificationController.ts
│   ├── ReportController.ts
│   ├── WebhookController.ts
│   └── financial/
│       ├── AdminDashboardController.ts
│       ├── DisputeController.ts
│       ├── EscrowController.ts
│       ├── PaymentController.ts
│       ├── RefundController.ts
│       ├── WithdrawalAdminController.ts
│       └── WorkerEarningsController.ts
│
├── services/                 # Business logic
│   ├── AuthService.ts
│   ├── OrderService.ts
│   ├── ProposalService.ts
│   ├── NegotiationService.ts
│   ├── ChatService.ts
│   ├── WorkerProfileService.ts
│   ├── ClientProfileService.ts
│   ├── UserService.ts
│   ├── LocationService.ts
│   ├── GovernmentService.ts
│   ├── SpecializationService.ts
│   ├── NotificationService.ts
│   ├── PresenceService.ts
│   ├── RateLimitService.ts
│   ├── ReportService.ts
│   ├── ContactDetectionService.ts
│   ├── Service.ts             # Base service class
│   └── financial/
│       ├── PaymentService.ts
│       ├── EscrowService.ts
│       ├── RefundService.ts
│       ├── WithdrawalService.ts
│       ├── DisputeService.ts
│       ├── DashboardService.ts
│       └── helpers/
│
├── repositories/             # Data access layer
│   ├── interfaces/           #   Repository contracts
│   └── prisma/               #   Prisma implementations
│       ├── TransactionManager.ts
│       └── financial/        #   Financial repositories
│
├── domain/                   # Entity type definitions
│   ├── order.entity.ts
│   ├── proposal.entity.ts
│   ├── negotiation.entity.ts
│   ├── user.entity.ts
│   ├── workerProfile.entity.ts
│   ├── conversation.entity.ts
│   ├── message.entity.ts
│   ├── notification.entity.ts
│   ├── report.entity.ts
│   ├── session.entity.ts
│   └── financial/
│
├── schemas/                  # Zod validation schemas
│   ├── common.ts             #   Shared schemas (pagination, sorting, filters)
│   ├── responses.ts          #   Response wrapper schemas
│   ├── entities/             #   Entity schemas (order, worker, proposal, etc.)
│   ├── requests/             #   Request body/params/query schemas
│   ├── responses/            #   Response DTOs
│   └── financial/            #   Financial schemas
│
├── middlewares/              # Express middleware
│   ├── authMiddleware.ts     #   JWT auth + device verification
│   ├── accessMiddleware.ts   #   Role-based access control
│   ├── rateLimitMiddleware.ts #  Redis-backed rate limiting
│   ├── validateRequest.ts    #   Zod request validation
│   ├── errorMiddleware.ts    #   Global error handler
│   ├── socketMiddleware.ts   #   Socket.IO auth
│   ├── cloudinaryMiddleware.ts # File upload
│   └── multiformParserMiddleware.ts
│
├── cache/                    # Redis cache layer
│   ├── interfaces/           #   Cache contracts
│   └── redis/                #   Redis implementations
│       ├── OTPCache.ts
│       ├── DataCache.ts
│       ├── TokenCache.ts
│       ├── RateLimitCache.ts
│       └── ChatPresenceCache.ts
│
├── providers/                # External service integrations
│   ├── FirebaseProvider.ts   #   FCM push notifications
│   ├── PaymobProvider.ts     #   Payment gateway
│   └── (Twilio, Cloudinary via configs)
│
├── socket/                   # WebSocket (Socket.IO)
│   ├── socketManager.ts      #   Server init + Redis adapter
│   ├── socketHandlers.ts     #   Event handlers
│   └── socket-emitter.ts     #   Emit utility
│
├── cron/                     # Scheduled jobs
│   ├── order-timeout.cron.ts #   Expire unpaid orders
│   └── notification-retry.cron.ts # Retry failed notifications
│
├── libs/                     # Library wrappers
│   ├── database.ts           #   Prisma client
│   ├── redis.ts              #   Redis client
│   ├── winston.ts            #   Logger
│   ├── firebase.ts           #   Firebase Admin
│   ├── openapi.ts            #   OpenAPI spec generator
│   └── zod.ts                #   Zod re-export
│
├── configs/                  # Environment configuration
│   └── environment.ts        #   Centralized env var reader
│
├── errors/                   # Error classes
├── types/                    # TypeScript augmentations
├── utils/                    # Utility functions
│   ├── stateMachine.ts       #   Order state transition engine
│   ├── reportStateMachine.ts #   Report state transitions
│   ├── contactDetection.ts   #   Phone/URL regex detection
│   ├── notificationMapper.ts #   Maps events → notification content
│   ├── tokens.ts             #   JWT sign/verify helpers
│   ├── handleFilteration.ts  #   Dynamic query filter builder
│   ├── serializeBigints.ts   #   JSON BigInt serialization
│   └── ...
│
├── docs/                     # OpenAPI documentation files
└── generated/                # Prisma generated client
```

---

## Domain Model

The system has **46 database models** organized across these subdomains:

### Entity Relationship Map

```
                         ┌─────────────┐
                         │    User      │
                         │ (phone auth) │
                         └──┬───────┬───┘
                            │       │
                   ┌────────▼┐   ┌──▼──────────┐
                   │ Client  │   │   Worker     │
                   │ Profile │   │   Profile    │
                   └────┬────┘   └──┬───────────┘
                        │           │  ├── WorkerVerification
                        │           │  ├── Portfolio → ProjectImages
                        │           │  ├── ChosenSpecializations
                        │           │  ├── DayWorkingHours
                        │           │  ├── WorkerOccupiedTimeSlots
                        │           │  ├── WorkerBalance
                        │           │  ├── PayoutMethods
                        │           │  └── WorkerBadges
                        │           │
                        └─────┬─────┘
                              │
                        ┌─────▼─────┐
                        │   Order    │◄──── Location
                        │            │◄──── SubSpecialization
                        └──┬──┬──┬───┘
                           │  │  │
              ┌────────────┘  │  └──────────────┐
              │               │                 │
        ┌─────▼─────┐  ┌─────▼──────┐   ┌──────▼──────┐
        │ Proposals  │  │ Negotiations│   │  Financial  │
        │ (global)   │  │ (pricing)   │   │  Pipeline   │
        └────────────┘  └─────────────┘   │             │
                                          ├─ Payment    │
                                          ├─ EscrowHold │
                                          ├─ Refund     │
                                          └─ WorkerDebt │
```

### Model Census by Subdomain

| Subdomain | Models | Count |
|-----------|--------|-------|
| **Users & Auth** | User, ClientProfile, WorkerProfile, Session, Admin, AdminSession | 6 |
| **Worker Domain** | WorkerVerification, Portfolio, ProjectImage, ChosenSpecialization, DayWorkingHours, WorkerOccupiedTimeSlot, WorkerBadge | 7 |
| **Geography** | Government, City, Location | 3 |
| **Specializations** | Specialization, SubSpecialization | 2 |
| **Orders & Proposals** | Order, OrderImage, Proposal, Negotiation | 4 |
| **Chat & Messaging** | Conversation, ConversationParticipant, Message, FlaggedMessage | 4 |
| **Notifications** | Notification, Broadcast | 2 |
| **Financial** | Payment, PaymentAttempt, PaymentIntention, EscrowHold, WorkerBalance, PayoutMethod, WithdrawRequest, PayoutExecution, Refund, WorkerDebt, FeeRule, WebhookEvent | 12 |
| **Disputes** | Dispute, DisputeMessage | 2 |
| **Reports** | Report, ReportImage | 2 |
| **Audit** | TransactionLog, ActivityLog | 2 |
| **Total** | | **46** |

### Enums (37 total)

Key enums governing business logic:

| Enum | Values | Used By |
|------|--------|---------|
| `OrderStatus` | `PENDING → PRICE_AGREED → PAID → COMPLETED \| CANCELLED` | Order |
| `WorkStatus` | `PENDING → WAITING_FOR_WORK → STARTED → DONE` | Order |
| `OrderMode` | `DIRECT`, `GLOBAL` | Order |
| `ProposalStatus` | `PENDING → NEGOTIATING → ACCEPTED \| REJECTED \| WITHDRAWN \| DISMISSED` | Proposal |
| `NegotiationStatus` | `PENDING → ACCEPTED \| REJECTED \| CANCELLED` | Negotiation |
| `VerificationStatus` | `PENDING → APPROVED \| REJECTED` | WorkerVerification |
| `EscrowHoldStatus` | `HELD → RELEASED \| REFUNDED` | EscrowHold |
| `AccountStatus` | `ACTIVE`, `SUSPENDED`, `BANNED` | User |
| `DisputeStatus` | `OPEN → AWAITING_INFO → RESOLVED \| DISMISSED` | Dispute |

---

## Order Lifecycle & State Machine

Orders are the **central business entity**. The lifecycle varies by order mode:

### Direct Order Flow

```
Client picks a specific worker
         │
         ▼
    ┌─────────┐     negotiate      ┌──────────────┐
    │ PENDING  │ ◄──────────────► │  Negotiations  │
    └────┬────┘    (counter-     └──────┬─────────┘
         │          offers)            │ accept
         │                             ▼
         │                    ┌──────────────┐
         │                    │ PRICE_AGREED  │
         │                    └──────┬───────┘
         │                           │ pay (Paymob)
         │                           ▼
         │                    ┌──────────────┐
         │                    │     PAID      │ ← EscrowHold created
         │                    └──────┬───────┘
         │                           │ worker starts
         │                           ▼
         │                    ┌──────────────┐
         │                    │  IN_PROGRESS  │ (workStatus)
         │                    └──────┬───────┘
         │                           │ worker finishes
         │                           ▼
         │                    ┌──────────────┐
         └──── cancel ──────► │  COMPLETED   │ → Escrow released
                (any stage)   └──────────────┘   → Worker balance credited
```

### Global Order Flow

```
Client posts job publicly (no worker selected)
         │
         ▼
    ┌──────────┐
    │   OPEN   │ ← Workers browse & submit proposals
    └────┬─────┘
         │  workers submit proposals
         ▼
    ┌────────────┐    negotiate per     ┌──────────────────────┐
    │  Proposals  │ ◄────────────────► │ Proposal Negotiations │
    └────┬───────┘    proposal          └──────────────────────┘
         │  client accepts one
         │  (others → DISMISSED)
         ▼
    ┌──────────────┐
    │ PRICE_AGREED  │
    └──────┬───────┘
           │
           ▼
      (same flow as Direct from here)
```

### State Transition Guards

- **Cannot cancel** after work has started (`workStatus: STARTED`)
- **Serializable isolation** on `acceptProposal` — prevents double-acceptance race conditions
- **Turn-based negotiations** — alternating `WORKER_TO_CLIENT` / `CLIENT_TO_WORKER` enforced
- **One proposal per worker per order** — database unique constraint

---

## API Reference

Base URL: `/api/v1`

### Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/send-otp` | No | Send OTP via SMS/WhatsApp |
| `POST` | `/auth/verify-otp` | No | Verify OTP → returns login or register token |
| `POST` | `/auth/register` | Register token | Create account (client or worker) |
| `POST` | `/auth/login` | Login token | Exchange for access + refresh tokens |
| `POST` | `/auth/refresh-token` | Refresh token | Rotate access + refresh tokens |
| `POST` | `/auth/check-phone` | No | Check if phone number is registered |

### Orders (`/orders`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/orders` | Yes | Client | Create order (DIRECT or GLOBAL) |
| `GET` | `/orders/:id` | Yes | Any | Get order details |
| `PATCH` | `/orders/:id/cancel` | Yes | Owner | Cancel order |
| `PATCH` | `/orders/:id/start-work` | Yes | Worker | Start work on order |
| `PATCH` | `/orders/:id/finish-work` | Yes | Worker | Complete work on order |
| `GET` | `/orders/client/my-orders` | Yes | Client | List client's orders |
| `GET` | `/orders/worker/my-orders` | Yes | Worker | List worker's orders |

### Proposals (`/orders/:orderId/proposals`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/` | Yes | Worker | Submit proposal on global order |
| `GET` | `/` | Yes | Client/Admin | List proposals for an order |
| `GET` | `/mine` | Yes | Worker | Get own proposal for an order |
| `GET` | `/:proposalId` | Yes | Owner | Get proposal details |
| `DELETE` | `/:proposalId` | Yes | Worker | Withdraw proposal |
| `POST` | `/:proposalId/reject` | Yes | Client | Reject proposal |
| `POST` | `/:proposalId/accept` | Yes | Client | Accept proposal (dismisses others) |

### Negotiations (`/orders/:orderId/proposals/:proposalId/negotiations`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | Yes | Submit counter-offer |
| `GET` | `/` | Yes | List negotiation history |
| `POST` | `/accept` | Yes | Accept current price |
| `POST` | `/reject` | Yes | Reject current offer |

### Workers (`/workers`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | No | List/search workers (paginated, filterable) |
| `GET` | `/:id` | No | Get worker profile |
| `PUT` | `/profile` | Yes | Update own worker profile |
| `POST` | `/verification` | Yes | Submit verification documents |
| `GET` | `/:id/working-hours` | No | Get worker's weekly schedule |
| `PUT` | `/working-hours` | Yes | Update own working hours |
| `GET` | `/:id/occupied-time-slots` | No | Get worker's booked slots |

### Chat (`/chat`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/conversations` | Yes | List conversations |
| `GET` | `/conversations/:id/messages` | Yes | Get messages (paginated) |
| `POST` | `/conversations/:id/messages` | Yes | Send message (text/image/file/voice) |
| `POST` | `/conversations/:id/read` | Yes | Mark conversation as read |

### Governments (`/governments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | No | List all governorates |
| `GET` | `/:id` | No | Get governorate details |
| `GET` | `/:id/cities` | No | List cities in governorate |
| `GET` | `/:id/cities/:cityId/locations` | No | List locations in city |
| `POST/PUT/DELETE` | `/*` | Admin | CRUD operations |

### Specializations (`/specializations`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | No | List specializations |
| `GET` | `/:id` | No | Get specialization with sub-specializations |
| `POST/PUT/DELETE` | `/*` | Admin | CRUD operations |

### Notifications (`/notifications`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Yes | List notifications (paginated) |
| `POST` | `/:id/read` | Yes | Mark notification as read |
| `POST` | `/read-all` | Yes | Mark all as read |
| `POST` | `/fcm-token` | Yes | Register FCM device token |

### Reports (`/reports`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | Yes | Submit a report |
| `GET` | `/my-reports` | Yes | List own reports |
| `GET` | `/` | Admin | List all reports |
| `GET` | `/:id` | Admin | Get report details |
| `PATCH` | `/:id/status` | Admin | Update report status |

### User Dashboard (`/me`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | Yes | Get own profile |
| `PUT` | `/` | Yes | Update own profile |
| Various | `/...` | Admin | User management, verification approvals |

### Payments (`/payments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/orders/:orderId/pay` | Yes | Initiate payment |
| `GET` | `/orders/:orderId/status` | Yes | Check payment status |

### Webhooks (`/webhooks`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/payment/callback` | HMAC | Paymob payment callback |

### Financial Admin (`/admin/*`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/escrow-holds` | Admin | List escrow holds |
| `POST` | `/admin/escrow-holds/:id/release` | Admin | Release escrow to worker |
| `GET/POST` | `/admin/orders/:orderId/refunds` | Admin | Manage refunds |
| `GET` | `/admin/financial/*` | Admin | Financial dashboard & stats |
| `GET/PATCH` | `/admin/disputes/*` | Admin | Dispute management |
| `GET/PATCH` | `/admin/withdraw-requests/*` | Admin | Withdrawal approvals |

### Worker Earnings (`/workers/me/earnings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/balance` | Worker | Get balance & earnings |
| `GET` | `/payout-methods` | Worker | List payout methods |
| `POST` | `/payout-methods` | Worker | Add payout method |
| `POST` | `/withdraw` | Worker | Request withdrawal |

---

## Real-Time (WebSocket)

Socket.IO server shares the HTTP port. Redis adapter enables horizontal scaling.

### Connection

```javascript
const socket = io('ws://localhost:3001', {
  auth: { token: 'Bearer <access_token>' }
});
```

### Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `message:new` | Server→Client | `{ message, conversationId }` | New chat message received |
| `message:read` | Server→Client | `{ conversationId, readBy }` | Messages marked as read |
| `user:online` | Server→Client | `{ userId }` | User came online |
| `user:offline` | Server→Client | `{ userId }` | User went offline |
| `typing:start` | Client→Server | `{ conversationId }` | User started typing |
| `typing:stop` | Client→Server | `{ conversationId }` | User stopped typing |
| `notification:new` | Server→Client | `{ notification }` | New push notification |

### Presence

Online/offline status is tracked in Redis with TTL. Socket connection/disconnection triggers presence updates broadcast to relevant conversation partners.

---

## Financial Pipeline

```
                    Paymob Webhook
                         │
                         ▼
                  ┌──────────────┐
                  │ WebhookEvent │ (raw payload stored)
                  └──────┬───────┘
                         │ validate HMAC
                         ▼
                  ┌──────────────┐
                  │   Payment    │ (idempotent by key)
                  └──────┬───────┘
                         │
                    ┌────▼────┐
                    │ Escrow  │ (HELD)
                    │  Hold   │
                    └────┬────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         work done    dispute    cancel
              │          │          │
              ▼          ▼          ▼
         ┌────────┐ ┌────────┐ ┌────────┐
         │RELEASED│ │DISPUTED│ │REFUNDED│
         └───┬────┘ └───┬────┘ └───┬────┘
             │          │          │
             ▼          │          ▼
      ┌────────────┐   │   ┌──────────┐
      │  Worker    │   │   │  Refund  │
      │  Balance   │   │   └──────────┘
      │  +credit   │   │          │
      └─────┬──────┘   │          ▼
            │          │   ┌──────────┐
            ▼          │   │ WorkerDebt│ (if worker owes)
     ┌──────────────┐ │   └──────────┘
     │ Withdraw     │ │
     │ Request      │ │
     └──────┬───────┘ │
            │          │
            ▼          │
     ┌──────────────┐ │
     │   Payout     │ │
     │  Execution   │ │
     └──────────────┘ │
                       ▼
                  Admin resolves
```

### Key Financial Safeguards

- **Idempotency keys** on every mutation (payment, escrow, refund, payout)
- **Optimistic locking** on `WorkerBalance` (version field)
- **Fee rules** stored as configurable `FeeRule` records with effective dates
- **BigInt** for all monetary amounts (piaster precision, avoids floating-point)
- **Webhook event** raw payload stored before processing
- **Payment attempts** tracked separately from successful payments
- **Worker debt** system for post-refund worker obligations

---

## External Providers

| Provider | Purpose | Config |
|----------|---------|--------|
| **Paymob** | Egyptian payment gateway (cards, mobile wallets) | `PaymobProvider.ts` |
| **Firebase Admin** | Push notifications via FCM | `FIREBASE_SERVICE_ACCOUNT` env |
| **Twilio** | SMS OTP delivery | `TWILIO_*` env vars |
| **Baileys** | WhatsApp OTP delivery (unofficial API) | `WHATSAPP_API_KEY` env |
| **Cloudinary** | Image/file upload & CDN | `CLOUDINARY_*` env vars |

---

## Infrastructure

### Database

- **PostgreSQL** hosted on Supabase with PgBouncer connection pooling
- **PostGIS** for geospatial queries (location proximity, GiST indexes)
- **Prisma 7** with `@prisma/adapter-pg` for driver-level control

### Caching (Redis)

| Cache | Purpose |
|-------|---------|
| `OTPCache` | OTP codes with TTL |
| `TokenCache` | Revoked/blacklisted tokens |
| `DataCache` | Expensive query results (worker lists, governments) |
| `RateLimitCache` | Rate limit counters |
| `ChatPresenceCache` | Online/offline status |

### Cron Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `order-timeout` | Configurable interval | Expire unpaid orders after N hours |
| `notification-retry` | Configurable interval | Retry failed FCM notifications |

### Logging

Winston with console + rotating file transports. Log levels configurable via `LOGGING_LEVEL` env var.

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- PostgreSQL (or Supabase account)
- Redis (or Upstash account)
- Cloudinary account
- Twilio account (for SMS)
- Firebase project (for push notifications)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database
npm run seed

# Start development server
npm run dev
```

### Environment Variables

See [`.env.example`](.env.example) for all required variables. Key groups:

| Group | Variables |
|-------|----------|
| **Server** | `PORT`, `FRONTEND_URL`, `NODE_ENV` |
| **Database** | `DATABASE_URL`, `DB_MAX_CONNECTIONS`, `DB_SSL` |
| **Redis** | `REDIS_URL`, `REDIS_TTL` |
| **JWT** | `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, etc. (4 token types) |
| **API** | `API_BASE_URL`, `API_VERSION` |
| **Rate Limiting** | `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, etc. |
| **Cloudinary** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Twilio** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VIRTUAL_NUMBER` |
| **Firebase** | `FIREBASE_SERVICE_ACCOUNT` (JSON string) |
| **Crons** | `CRON_ORDER_TIMEOUT_*`, `CRON_ESCROW_RELEASE_*` |

---

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `tsx watch src/server.js` | Development server with hot reload |
| `build` | `db:generate + swc transpile` | Production build |
| `start` | `node dist/server.js` | Run production build |
| `type-check` | `tsc --noEmit` | TypeScript validation |
| `test` | `vitest run` | Run all tests |
| `test:watch` | `vitest` | Watch mode |
| `test:unit` | `vitest run src/**/*.test.ts` | Unit tests only |
| `test:coverage` | `vitest run --coverage` | Coverage report |
| `db:migrate` | `prisma migrate dev` | Run pending migrations |
| `db:generate` | `prisma generate` | Regenerate Prisma client |
| `db:push` | `prisma db push` | Push schema to DB (no migration) |
| `db:studio` | `prisma studio` | Visual DB browser |
| `db:reset` | `prisma migrate reset --force` | Reset DB + re-seed |
| `seed` | Sequential seed scripts | Seed all sample data |
| `lint` | `eslint src --fix` | Lint and auto-fix |
| `format` | `prettier --write src` | Format code |
| `check:all` | Type check + lint + format + test | Full CI check |

---

## Testing

- **Framework**: Vitest with v8 coverage
- **Integration tests**: Supertest for HTTP endpoint testing
- **Structure**: Tests in `/tests/unit/` and co-located `.test.ts` files
- **Coverage**: Partial — not all services/controllers have tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

---

## Architectural Analysis

### ✅ What's Done Well

| Aspect | Details |
|--------|---------|
| **Schema design** | Well-normalized, proper indexes, compound unique constraints, PostGIS for geo |
| **Financial safety** | Idempotency keys everywhere, optimistic locking, BigInt for money, webhook event storage |
| **Separation of concerns** | Clean controller → service → repository layering |
| **Validation** | Zod schemas as single source of truth for validation AND OpenAPI docs |
| **State machine** | Explicit transition guards prevent invalid order state changes |
| **Serializable transactions** | Critical paths (accept proposal, accept negotiation) properly isolated |
| **Contact detection** | Prevents platform bypass by detecting phone numbers in chat |
| **Composition root** | `state.ts` makes dependency graph explicit and testable |

### ⚠️ Inconsistencies & Gaps

| Issue | Details |
|-------|---------|
| **Schema vs. code drift** | PLAN.md references `TIME_SPECIFIED`, `WORKER_SELECTED` statuses that have been removed from the schema (CHANGELOG confirms removal), yet some service code may still reference them |
| **CORS wildcard** | `cors({ origin: '*' })` in production — should be restricted to `FRONTEND_URL` |
| **Missing graceful shutdown** | `SIGINT` handler just calls `process.exit(0)` — doesn't close Redis, DB pool, or drain HTTP connections |
| **locations route not mounted** | `locations.ts` exists but is NOT mounted in `api.ts` — dead code |
| **WhatsApp commented out** | `connectWhatsApp()` is commented out in `server.ts` — unclear if intentional or broken |
| **Mixed file extensions** | Some utils are `.js` (`HTTTHeaders.js`, `OTP.js`, `governmentDistance.js`), some `.ts` — inconsistent |
| **`state.ts` import ordering** | Financial imports are scattered mid-file after usage (lines 183-211) — imports should be at top |
| **Dashboard route at `/me`** | Dashboard is mounted at `/me` but the route file is named `dashboard.ts` — naming mismatch |
| **No payment initiation route visible** | The payments route exists but the pay-for-order flow isn't clearly connected to the order lifecycle |
| **4 JWT secret types** | Access, refresh, login, and register secrets — the login/register distinction adds complexity |

### 🔧 What Could Be Better

| Area | Recommendation |
|------|----------------|
| **Error handling** | Mix of `@hapi/boom` and custom `AppError` — should consolidate to one approach |
| **Test coverage** | Financial services (the riskiest code) appear to have minimal test coverage |
| **Admin auth** | Admin model exists in schema with separate sessions, but admin routes use the User auth middleware + `isAdmin` flag — dual system is confusing |
| **Cache invalidation** | `DataCache` exists but invalidation strategy isn't systematic — risk of stale data |
| **Cron job management** | No dead-letter queue or failure alerting for cron jobs |
| **API versioning** | Routes are under `/v1` but there's no strategy for breaking changes |
| **Request logging** | No request/response logging middleware (only Winston for application logs) |
| **Seed files as `.js`** | Seed scripts are `.js` but the project is TypeScript — should be `.ts` |

### 🏗️ Potential Over-Engineering

| Area | Details |
|------|---------|
| **Repository interfaces** | Every repository has a separate interface file + Prisma implementation, even for simple CRUD. In a team of this size, the indirection adds maintenance cost without clear benefit (no repository swapping is planned) |
| **Financial model count (12 tables)** | `Payment`, `PaymentAttempt`, `PaymentIntention`, `EscrowHold`, `WorkerBalance`, `PayoutMethod`, `WithdrawRequest`, `PayoutExecution`, `Refund`, `WorkerDebt`, `FeeRule`, `WebhookEvent` — this is an enterprise-grade financial ledger for what is currently a pre-revenue marketplace. Consider whether all of this is needed at launch |
| **37 enums** | Some enums have very few uses or overlap (`OrderType` vs `OrderMode`, `TransactionType` exists in both general and wallet-specific variants) |
| **Dispute system** | Full dispute model with message threads, evidence tracking, resolution types — high complexity for a feature that will see very low volume initially |
| **Contact detection** | Regex-based phone/URL/social-handle detection with a separate `FlaggedMessage` model — sophisticated for early stage |
| **Broadcast model** | Push notification broadcasts with target role/government filtering — unlikely to be used until significant user base exists |
| **Activity/Transaction logs** | Two separate audit log tables — one might suffice initially |
| **Worker badges** | Badge system exists in schema but no service/controller code visible for it |

---

## License

ISC
]]>
