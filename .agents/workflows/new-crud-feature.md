---
description: Prompt for implementing a new CRUD feature following Motqen's architecture
---

# New CRUD Feature Prompt

Copy-paste this prompt to an AI assistant when you need to add a new CRUD feature:

---

## The Prompt

```
I need to add a new CRUD feature to the Motqen backend (TypeScript, Express, Prisma, Zod).
The feature is: [DESCRIBE YOUR FEATURE HERE — e.g., "Job Requests: clients can create job requests specifying a specialization, description, budget, and urgency level"]

Follow the exact architecture and patterns already used in this codebase. Here are the steps and patterns to follow precisely:

### Step 1: Domain Entity (`src/domain/[feature].entity.ts`)
- Define the main entity type (e.g., `JobRequest`) with all fields including `id: IDType`, `createdAt: Date`, `updatedAt: Date`
- Define `CreateInput` and `UpdateInput` types (UpdateInput should be `Partial<CreateInput>`)
- Define a `FilterDescriptor` using `FieldTypeDefinition` with `type`, `sortable`, `searchable` flags
- Export a `Filter` type using `FilterFromDescriptor<typeof [Feature]FilterDescriptor>`
- Reference pattern: look at `src/domain/government.entity.ts` and `src/domain/workerProfile.entity.ts`

### Step 2: Repository Interface (`src/repositories/interfaces/[Feature]Repository.ts`)
- Export a default interface `I[Feature]Repository`
- Standard methods: `find`, `findMany`, `exists`, `create`, `update`, `delete`
- `findMany` should accept `{ filter, pagination?: PaginationOptions, sort?: SortOptions<Entity> }` and return `Promise<PaginatedResultMeta & { [plural]: Entity[] }>`
- All methods accept object params `{ filter: ... }`, not positional arguments
- Reference pattern: look at `src/repositories/interfaces/GovernmentRepository.ts`

### Step 3: Prisma Repository (`src/repositories/prisma/[Feature]Repository.ts`)
- Extend `Repository` base class, implement `I[Feature]Repository`
- Constructor takes `PrismaClient`
- Every method: `try { ... } catch (error) { throw handlePrismaError(error as Error, 'methodName'); }`
- Use `handlePagination()` and `handleSort()` from `../../utils/handleFilteration.js` for list queries
- Use `isEmptyFilter()` guard for find operations
- Return domain entities, not raw Prisma objects (map if needed)
- Reference pattern: look at `src/repositories/prisma/GovernmentRepository.ts`

### Step 4: Zod Schemas (`src/schemas/[feature].ts`)
- Import shared primitives from `./common.js`: `UUIDSchema`, `NameSchema`, `buildFilterSchema`, `createQuerySchema`
- Define `Create[Feature]Schema`, `Update[Feature]Schema` (= CreateSchema.partial())
- Define `[Feature]IdParamsSchema` for route params
- Define `[Feature]FilterSchema` using `buildFilterSchema([Feature]FilterDescriptor)`
- Define `[Feature]QuerySchema` using `createQuerySchema([Feature]FilterSchema)`
- Export DTO types: `export type Create[Feature]DTO = z.infer<typeof Create[Feature]Schema>`
- Reference pattern: look at `src/schemas/governments.ts` and `src/schemas/specializations.ts`

### Step 5: Service (`src/services/[Feature]Service.ts`)
- Extend `Service` base class
- Constructor receives repository *interface* (not concrete class): `I[Feature]Repository`
- Import and use `tryCatch` from `./Service.js` to wrap async operations
- Always check existence before update/delete: `find → if (!result) throw new AppError('...not found', 404)`
- Throw `AppError` with appropriate status codes (400, 404, 409, 500)
- NO Express imports, NO `req`/`res` — pure business logic
- Reference pattern: look at `src/services/GovernmentService.ts`

### Step 6: Controller (`src/controllers/[Feature]Controller.ts`)
- Use `asyncHandler()` from `../types/asyncHandler.js` for every route handler
- Use `validate([schema])` middleware on routes that accept body/query input
- Use `parseQueryParams(req.query, filterSchema)` for list endpoints
- Return responses with `new SuccessResponse(message, data, statusCode).send(res)`
- For void ops (delete): `new SuccessResponse('Deleted successfully', null, 200).send(res)`
- Pull user context from `req.userState` (set by auth middleware)
- Keep controllers THIN — just parse input, call service, send response
- Reference pattern: look at `src/controllers/GovernmentController.ts`

### Step 7: Routes (`src/routes/[feature].ts`)
- Use Express Router
- Apply `authenticate` middleware where needed
- Apply `validate(schema)` middleware for body validation
- RESTful: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
- Reference pattern: look at `src/routes/governments.ts`

### Step 8: Wire Up (`src/state.ts`)
- Import the concrete repository
- Instantiate it with `prisma`
- Import the service
- Instantiate it with the repository
- Export the service instance

### CRITICAL RULES:
- Use `import ... from '...js'` (with .js extension) for all local imports — this is an ESM project
- Never use `console.log` — use `logger` from `../libs/winston.js` if needed
- Use primitive types (`string`, `number`, `boolean`), never boxed (`String`, `Number`, `Boolean`)
- Don't mutate function parameters — create copies
- Use `const` by default, `let` only when reassignment is needed
- All filter objects should use optional chaining for nullable access
```
