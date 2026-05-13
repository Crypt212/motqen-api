# Admin panel wiring (motqen-api + MOTQEN-Dashboard)

Implemented in the codebase. Summary:

## motqen-api

1. **`src/configs/environment.ts`** — `adminPanel.phone`, `adminPanel.passwordSha256Hex` from env.
2. **`.env.example`** — `ADMIN_PANEL_PHONE`, `ADMIN_PANEL_PASSWORD_SHA256` (documented).
3. **`src/routes/v1/admin/login.routes.ts`** — `POST /admin/auth/login` (mounted at `/api/v1/admin/auth/login`).
4. **`src/routes/v1/admin/protected.routes.ts`** — `authenticateAccess` + `authorizeAdmin`: `/dashboard/stats`, `/dashboard/recent-events`, `/craftsmen` CRUD-style actions, stubs for `/disputes`, `/users`, `/finance/*`.
5. **`src/routes/v1/api.ts`** — mounts admin routers; **`dashboard.ts` unchanged** (still `/me`).
6. **`OrderService` / `OrderController`** — `viewerRole === 'ADMIN'` for order access; `getOrderDetailForAdmin` for dashboard-shaped order detail.
7. **`OrderRepository.toDomain`** — safe `workerProfile?.userId`.
8. **`seeds/samples/createTestUsers.js`** — ensures admin user for `ADMIN_PANEL_PHONE` (default `01009999999`).

Password hash:

```bash
node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD','utf8').digest('hex'))"
```

## MOTQEN-Dashboard

1. **`VITE_API_BASE_URL`** — default `http://localhost:3001/api/v1` in dev fallback and `.env.example`.
2. **`src/api/client.ts`** — `x-device-fingerprint` (persisted), unwrap `SuccessResponse.data`.
3. **`src/main.tsx`** — mocks only when `VITE_USE_MOCKS=true`.
4. **`src/api/auth.ts`** — `POST /admin/auth/login`.
5. **`src/api/orders.ts`** — maps API list `{ orders, total, page, limit }` and `{ order }` detail to UI types.
6. **`LoginPage`** — reads API `message` from error body.

## Optional

- Extend stubs to real Prisma models for finance/disputes/users.
- Add `POST` stubs for finance mutations if the UI calls them without navigating away.
