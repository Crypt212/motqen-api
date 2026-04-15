---
description: Post-feature polish checklist — run this after implementing a new feature
---

# Post-Feature Polish Prompt

Copy-paste this prompt to an AI assistant after implementing a new feature:

---

## The Prompt

```
I just implemented a new feature in the Motqen backend (TypeScript, Express, Prisma, Zod).
Please review my changes for the following issues:

### 1. Type Safety
- Any use of `any`, `String`, `Number`, `Boolean` (boxed types)?
- Any missing null checks that could cause runtime crashes?
- Do all service method return types match what the repository actually returns?
- Are all Zod schemas properly typed with `z.infer<typeof Schema>`?

### 2. Business Logic
- Am I checking entity existence (find → null check → throw 404) before mutating?
- Am I accidentally mutating input parameters instead of creating copies?
- Am I handling the worker verification status correctly (PENDING/APPROVED/REJECTED)?
- For chat features: am I validating conversation participation before reading/writing?

### 3. Error Handling
- Am I using `AppError` with correct HTTP status codes (400, 404, 403, 409, 429)?
- Am I wrapping service methods in `tryCatch()`?
- Am I using `asyncHandler()` in controllers (not try/catch)?
- Am I using `new SuccessResponse(message, data, statusCode).send(res)` correctly?
  - For void operations, data should be `null`, not the status code
- Am I catching RepositoryErrors only in repository layer?

### 4. Performance
- Am I doing sequential awaits in loops? (Should use `Promise.all` or batch queries)
- Am I doing N+1 queries? (Should use includes/joins)
- Am I fetching more data than needed? (Use `select` in Prisma queries)

### 5. Security
- Any `console.log` statements with sensitive data?
- Am I validating user authorization (not just authentication)?
- Am I sanitizing input via Zod schemas before it reaches business logic?

### 6. Consistency
- Repository: methods accept `{ filter: ... }` objects, return domain entities
- Service: depends on interfaces (not concrete repos), no Express types
- Controller: thin wrapper, delegates to service immediately
- Naming: PascalCase for types, interfaces prefixed with `I`, descriptors end in `Descriptor`
- File: schema files use camelCase, everything else uses PascalCase

### 7. Tests
- Did I add tests for the new service methods?
- Do my tests cover:
  - The happy path
  - Entity-not-found (404) cases
  - Validation failures
  - Edge cases specific to my feature

Point out every issue you find, with the file path and line number.
Do NOT just say "looks good" — dig deep.
```

---

## Quick Self-Check Before Opening a PR

1. `npx tsc --noEmit` — zero errors
2. `npx vitest run` — all tests pass
3. `grep -r "console.log" src/ --include="*.ts"` — should return nothing
4. No `any` types in service or controller layer
5. Every new Zod schema has at least one test case
