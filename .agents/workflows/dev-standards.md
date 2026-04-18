---
description: 
---

# Motqen Backend — Development Standards & Workflow

## 1. Code Architecture

### Layer Responsibilities

| Layer | Directory | Responsibility | Rules |
|-------|----------|---------------|-------|
| **Domain** | `src/domain/` | Entity types, filter descriptors | No imports from other layers. Pure types. |
| **Repository** | `src/repositories/` | Data access (Prisma queries) | Returns domain entities via `toDomain`. No business logic. |
| **Service** | `src/services/` | Business logic, validation, orchestration | Depends on repository interfaces (never concrete). No `req`/`res`. |
| **Controller** | `src/controllers/` | HTTP adaptation, request parsing | Thin — call service, wrap response in `SuccessResponse`. |
| **Schema** | `src/schemas/` | Zod validation | Validates input before it reaches controllers. |
| **Cache** | `src/cache/` | Redis-backed caching | Implements interfaces, never imported directly by services. |

### Dependency Flow
```
Controller → Service → Repository Interface
                  ↓
             Cache Interface
```
**Never** skip layers. A controller should not call a repository directly.

---

## 2. Feature Implementation Checklist

When implementing a new feature:

### Step 1: Domamin First
- [ ] Define the entity type in `src/domain/[feature].entity.ts`
- [ ] Add `FilterDescriptor` for query filtering
- [ ] Export `Filter` type using `FilterFromDescriptor`

### Step 2: Repository Interface
- [ ] Define the interface in `src/repositories/interfaces/[Feature]Repository.ts`
- [ ] Every method returns domain entities (never raw Prisma types)
- [ ] Methods accept `{ filter: ... }` objects (not positional args)

### Step 3: Prisma Repository
- [ ] Implement in `src/repositories/prisma/[Feature]Repository.ts`
- [ ] All Prisma calls wrapped in `try/catch → throw handlePrismaError(error, methodName)`
- [ ] Map results to domain entities via class methods or plain mapping
- [ ] Use `handlePagination()` and `handleSort()` for list queries

### Step 4: Schema (Validation)
- [ ] Define create/update schemas in `src/schemas/[feature].ts`
- [ ] Use shared primitives: `UUIDSchema`, `NameSchema`, `EgyptianPhoneSchema`
- [ ] Use `buildFilterSchema()` + `createQuerySchema()` for query params
- [ ] Export DTO types: `export type CreateXDTO = z.infer<typeof CreateXSchema>`

### Step 5: Service
- [ ] Constructor receives repository *interfaces* (not concrete classes)
- [ ] Wrap async logic in `tryCatch()` for uniform error handling
- [ ] Validate existence before mutating: check→act (not act→catch)
- [ ] Throw `AppError` with appropriate HTTP status codes
- [ ] No `req`/`res` objects, no Express imports

### Step 6: Controller
- [ ] Use `asyncHandler()` wrapper — never `try/catch` in controllers
- [ ] Validate body with `validate([schema])` middleware
- [ ] Return via `new SuccessResponse(message, data, statusCode).send(res)`
- [ ] For void operations: `new SuccessResponse('message', null, 200).send(res)`
- [ ] Extract user context from `req.userState` (set by auth middleware)

### Step 7: Register in State
- [ ] Instantiate repository in `src/state.ts`
- [ ] Instantiate service with repository dependency
- [ ] Wire into routes

### Step 8: Tests
- [ ] Add tests in `tests/services/[Feature]Service.test.ts`
- [ ] Use mock factories from `tests/helpers/mocks.ts`
- [ ] Run `npx vitest run` before committing

---

## 3. Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Entity types | PascalCase | `WorkerProfile`, `Conversation` |
| Filter types | PascalCase + Filter | `WorkerProfileFilter` |
| Repository interfaces | I + PascalCase + Repository | `IWorkerProfileRepository` |
| Repository implementations | PascalCase + Repository | `WorkerProfileRepository` |
| Services | PascalCase + Service | `WorkerProfileService` |
| Controller files | PascalCase + Controller | `DashboardController.ts` |
| Schema files | camelCase | `specializations.ts` |
| Private backing fields for getters | `_fieldName` | `private _presence` |
| Filter descriptors | PascalCase + FilterDescriptor | `GovernmentFilterDescriptor` |

---

## 4. Error Handling Standards

- Use `AppError` for all business errors with appropriate HTTP status codes:
  - `400` — Bad request (invalid input, business rule violation)
  - `404` — Entity not found
  - `403` — Unauthorized access
  - `409` — Conflict (duplicate)
  - `429` — Rate limited
  - `500` — Internal server error
- Use `RepositoryError` only inside repository implementations
- Never expose stack traces or raw DB errors in production
- Use `AppErrorDetails` subclasses for structured error payloads (e.g., `OTPErrorDetails`)

---

## 5. Code Quality Rules

### DO
- Use `const` by default, `let` only when reassignment is needed
- Use optional chaining (`?.`) for nullable access
- Use nullish coalescing (`??`) over `||` for default values
- Keep functions under 50 lines — extract helper functions
- Use `Promise.all()` for independent async operations
- Use structured logging via `logger` (winston), never `console.log`

### DON'T
- Don't use `console.log` in production code — use `logger.debug/info/warn/error`
- Don't mutate function parameters — create copies
- Don't use `String`, `Number`, `Boolean` (boxed types) — use `string`, `number`, `boolean`
- Don't use raw `Function` type — use specific signatures
- Don't catch errors just to re-throw them unchanged
- Don't leave unused variables or imports

---

## 6. Testing Standards

- Tests live in `tests/` (not co-located with source)
- Mock factories in `tests/helpers/mocks.ts`
- Domain factories: `makeUser()`, `makeConversation()`, etc.
- Test business logic, not implementation details
- Group tests by business flow, not by method name
- Run: `npx vitest run`
- Watch mode: `npx vitest`
