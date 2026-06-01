# Tasks: Admin Authentication & Administration System

**Input**: Design documents from `/specs/008-admin-auth/`
**Feature Branch**: `008-admin-auth`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish admin auth structure and route surface for the feature.

- [x] T001 Create admin route entrypoint at `src/routes/v1/admin/auth.ts`
- [x] T002 [P] Create admin management route file at `src/routes/v1/admin/users.ts`
- [x] T003 [P] Add admin API documentation stub in `src/docs/paths/v1/admin.docs.ts`
- [x] T004 Create dedicated admin middleware file at `src/middlewares/adminAuthMiddleware.ts`
- [x] T005 Add admin token payload and purpose types in `src/types/tokens.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the core admin domain and authentication plumbing that all user stories depend on.

- [x] T006 Add `Admin` and `AdminSession` models to `prisma/schema.prisma`
- [x] T007 Generate Prisma client after schema changes with `pnpm prisma generate`
- [x] T008 Create `src/repositories/prisma/AdminRepository.ts`
- [x] T009 Create `src/repositories/prisma/AdminSessionRepository.ts`
- [x] T010 Create admin domain entities in `src/domain/admin.entity.ts` and `src/domain/adminSession.entity.ts`
- [x] T011 Update `src/utils/tokens.ts` to support admin access/refresh token generation and verification
- [x] T012 Add admin auth service skeleton in `src/services/AdminAuthService.ts`
- [x] T013 Add admin auth controller skeleton in `src/controllers/AdminAuthController.ts`
- [x] T014 Wire admin repositories and service into `src/state.ts`
- [x] T015 Add admin request/response schema files in `src/schemas/requests/admin-auth.request.ts` and `src/schemas/responses/admin-auth.response.ts`

---

## Phase 3: User Story 1 - Admin authentication and status control (Priority: P1)

**Goal**: Allow admins to log in with username/password, authenticate with active status, and revoke sessions on logout.

**Independent Test**: Verify active admin login succeeds, disabled admin login fails, logout revokes the session, and audit records are created.

- [x] T016 [P] [US1] Implement admin username/password login in `src/services/AdminAuthService.ts`
- [x] T017 [US1] Implement admin login endpoint in `src/controllers/AdminAuthController.ts`
- [x] T018 [US1] Implement admin logout endpoint in `src/controllers/AdminAuthController.ts`
- [x] T019 [P] [US1] Implement `authenticateAdminAccess` and `authenticateAdminRefresh` in `src/middlewares/adminAuthMiddleware.ts`
- [x] T020 [US1] Add admin access token generation and refresh handling in `src/services/AdminAuthService.ts`
- [x] T021 [US1] Add admin auth routes to `src/routes/v1/admin/auth.ts` and register them in `src/routes/v1/api.ts`
- [x] T022 [US1] Add Zod validation for admin auth requests in `src/schemas/requests/admin-auth.request.ts`
- [x] T023 [US1] Add admin auth documentation in `src/docs/paths/v1/admin.docs.ts`
- [ ] T024 [US1] Add integration tests for active admin login, disabled admin rejection, and logout in `src/tests/integration/admin-auth.test.ts`
- [ ] T025 [US1] Add audit logging for admin login success, login failure, and logout in `src/services/AdminAuthService.ts`

---

## Phase 4: User Story 2 - Admin management and role assignment (Priority: P1)

**Goal**: Allow `SUPER_ADMIN` to create, list, update, and manage admin accounts with paginated results.

**Independent Test**: Verify `SUPER_ADMIN` can create an admin, list admins with `hasNext`/`hasPrevious`, update profile/role, and audit logs are created.

- [ ] T026 [P] [US2] Implement create admin logic in `src/services/AdminAuthService.ts`
- [ ] T027 [US2] Implement admin list query with pagination in `src/repositories/prisma/AdminRepository.ts`
- [ ] T028 [US2] Implement admin list endpoint in `src/controllers/AdminUsersController.ts`
- [ ] T029 [US2] Implement admin profile update endpoint in `src/controllers/AdminUsersController.ts`
- [ ] T030 [US2] Implement admin role change endpoint in `src/controllers/AdminUsersController.ts`
- [ ] T031 [US2] Implement disable/enable admin endpoint behavior in `src/controllers/AdminUsersController.ts`
- [ ] T032 [US2] Add `authorizeAdminRole('SUPER_ADMIN')` guard to `src/middlewares/adminAuthMiddleware.ts`
- [ ] T033 [US2] Add admin management routes to `src/routes/v1/admin/users.ts` and register them in `src/routes/v1/api.ts`
- [ ] T034 [US2] Add admin management request/response schemas in `src/schemas/requests/admin-users.request.ts` and `src/schemas/responses/admin-users.response.ts`
- [ ] T035 [US2] Add admin management documentation in `src/docs/paths/v1/admin.docs.ts`
- [ ] T036 [US2] Add integration tests for admin creation, paginated listing, profile update, and role change in `src/tests/integration/admin-users.test.ts`
- [ ] T037 [US2] Add audit logging for admin creation, update, role change, disable, and enable in `src/services/AdminAuthService.ts`

---

## Phase 5: User Story 3 - Super Admin protection and recovery (Priority: P2)

**Goal**: Protect the Super Admin account and provide recovery and force logout capabilities.

**Independent Test**: Verify Super Admin cannot be disabled/deleted/role-changed and that recovery and force-logout actions are audited.

- [ ] T038 [US3] Implement Super Admin protection rules in `src/services/AdminAuthService.ts`
- [ ] T039 [US3] Implement admin password reset endpoint in `src/controllers/AdminUsersController.ts`
- [ ] T040 [US3] Implement optional force logout of all admin sessions on password reset in `src/services/AdminAuthService.ts`
- [ ] T041 [US3] Implement force logout all target admin sessions endpoint in `src/controllers/AdminUsersController.ts`
- [ ] T042 [US3] Add recovery and force-logout request/response schemas in `src/schemas/requests/admin-users.request.ts`
- [ ] T043 [US3] Add admin recovery and force logout documentation in `src/docs/paths/v1/admin.docs.ts`
- [ ] T044 [US3] Add integration tests for Super Admin protections, recovery, and force logout in `src/tests/integration/admin-users.test.ts`
- [ ] T045 [US3] Add audit logging for recovery, force logout, and Super Admin protection checks in `src/services/AdminAuthService.ts`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish documentation, cleanup, and final integration validation.

- [ ] T046 [P] Update `docs/specs/audits/admin-auth-audit.md` with implementation details and any changes
- [ ] T047 [P] Update `docs/specs/progress/admin-auth.md` with implemented files and decisions
- [ ] T048 [P] Review and finalize Swagger/OpenAPI docs in `src/docs/paths/v1/admin.docs.ts`
- [ ] T049 [P] Add additional unit tests for token verification and admin middleware in `src/tests/unit/admin-auth.unit.test.ts`
- [ ] T050 [P] Refactor `src/middlewares/adminAuthMiddleware.ts` to align with existing middleware patterns
- [ ] T051 [P] Verify `hasNext` / `hasPrevious` pagination behavior in admin list responses
- [ ] T052 [P] Validate the admin auth quickstart notes in `specs/008-admin-auth/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup** must complete before Foundational starts.
- **Foundational** must complete before any User Story work begins.
- **User Stories** may proceed in parallel after Foundational is complete, but US1 is the MVP priority.
- **Polish** depends on all user stories and foundational infrastructure being complete.

### Story Dependencies

- **US1**: independent after Foundational.
- **US2**: independent after Foundational, but uses admin auth middleware and session concepts from US1.
- **US3**: independent after Foundational, but depends on admin session revocation and role rules from US1/US2.

## Parallel Opportunities

- **T002** and **T003** can run in parallel as route and documentation stubs.
- **T008** and **T009** can run in parallel for repository scaffolding.
- **T016**, **T019**, and **T022** can be worked in parallel across middleware, service, and routes for US1.
- **T026**, **T027**, and **T032** can be executed in parallel for US2 repository, service, and guard work.
- **T038**, **T039**, and **T041** can be parallelized for US3 protection, reset, and force logout implementation.
- **Polish phase tasks** are all marked [P] and can be completed in parallel once implementation is in place.

## Suggested MVP Scope

- Complete **Phase 1**, **Phase 2**, and **Phase 3** first.
- Deliver admin authentication, logout, refresh, and disabled-account rejection as the initial MVP.
- Add admin management and Super Admin protections after MVP authentication is validated.

## Implementation Strategy

- Deliver the MVP admin auth domain first: token lifecycle, login/logout, disabled admin handling.
- Then deliver `SUPER_ADMIN` management endpoints, pagination, and audit logging.
- Finally deliver Super Admin protection and recovery with force logout and audit trails.

---

## Extension Hooks

**Optional Hook**: git
Command: `speckit.git.commit`
Description: Commit task changes?

Prompt: Commit outstanding changes after task generation?
To execute: `/speckit.git.commit`
