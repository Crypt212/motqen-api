---
description: How to add a new feature or fix to the Motqen backend
---

# Adding a Feature or Fix

Follow this order to ensure consistency with the existing architecture.

## 1. Domain Entity
- Create or update `src/domain/<entity>.entity.ts`
- Define: `Entity`, `EntityCreateInput`, `EntityUpdateInput`, `EntityFilterDescriptor`, `EntityFilter`
- Keep Prisma-free — import only from `types/` and `schemas/common.ts`

## 2. Database Schema (if needed)
- Update `prisma/schema.prisma`
- Run migration:
// turbo
```bash
npm run db:migrate
```
// turbo
```bash
npm run db:generate
```

## 3. Repository Interface
- Create or update `src/repositories/interfaces/<Entity>Repository.ts`
- Use `PaginatedResult<{ entities: Entity[] }>` for list methods
- Return domain types only

## 4. Prisma Repository
- Create or update `src/repositories/prisma/<Entity>Repository.ts`
- Implement the interface
- Include `toDomain()` mapper
- Use `handlePagination` + `paginateResult` from `utils.ts`
- Wrap errors with `handlePrismaError`

## 5. Service Layer
- Create or update `src/services/<Entity>Service.ts`
- Inject repository via constructor
- Business logic, validation, orchestration here

## 6. Validation Schemas
- Create or update `src/schemas/<entity>.ts`
- Use `buildFilterSchema(descriptor)` → `createQuerySchema(filterSchema)` for list endpoints
- Reuse primitives from `common.ts` (UUIDSchema, NameSchema, etc.)

## 7. Controller
- Create or update `src/controllers/<Entity>Controller.ts`
- Use **class-based** pattern with injected service (like GovernmentController)
- Use `parseQueryParams` for list endpoints
- Return via `new SuccessResponse(...).send(res)`

## 8. Routes
- Create or update `src/routes/v1/<entity>.ts`
- Wire middleware: `validateBody`, `validateQuery`, `validateParams`
- Wire auth: `authenticateAccess`, `isActive`, `authorizeAdmin`/etc.
- Register in `src/routes/v1/api.ts`

## 9. OpenAPI Docs
- Create or update `src/docs/paths/v1/<entity>.docs.ts`
- Register paths with `registryV1.registerPath`
- Always include: `parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }]`
- Use `createResponseDoc` for responses

## 10. Wire DI
- Update `src/state.ts`:
  - Instantiate repository → service → controller
  - Export as needed

## 11. Tests
- Service tests: `tests/services/<Entity>Service.test.ts` — mock repositories
- Schema tests: Add to `tests/schemas/validation.test.ts`
- Add mock factories to `tests/helpers/mocks.ts` if needed

## 12. Verify
// turbo-all
```bash
npm run type-check
```
```bash
npm run lint
```
```bash
npm run test
```

Or run all at once:
```bash
npm run check:all
```
