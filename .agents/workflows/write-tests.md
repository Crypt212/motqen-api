---
description: Prompt for creating comprehensive tests for a new feature
---

# Write Tests Prompt

Copy-paste this prompt to an AI assistant after implementing a feature to generate tests:

---

## The Prompt

```
I just implemented a new feature in the Motqen backend. I need comprehensive vitest tests for it.

The feature is: [DESCRIBE YOUR FEATURE — e.g., "JobRequestService with CRUD operations and status transitions"]
The service file is at: [PATH — e.g., src/services/JobRequestService.ts]

Follow these exact testing patterns already used in this codebase:

### Setup Rules
- Tests go in `tests/services/[Feature]Service.test.ts`
- Import from `vitest`: `describe, it, expect, vi, beforeEach`
- Import the service class under test
- Import `AppError` from `../../src/errors/AppError.js`
- Import mock factories and domain factories from `../helpers/mocks.js`
- Mock external providers that make network calls:
  ```ts
  vi.mock('../../src/providers/cloudinaryProvider.js', () => ({
    default: vi.fn().mockResolvedValue({ url: 'https://cdn.motqen.com/uploaded.jpg' }),
  }));
  ```

### Mock Factory Pattern
- If the feature needs a new repository mock, add a factory to `tests/helpers/mocks.ts`:
  ```ts
  export const createMock[Feature]Repository = (): {
    [K in keyof I[Feature]Repository]: ReturnType<typeof vi.fn>;
  } => ({
    find: vi.fn(),
    findMany: vi.fn(),
    exists: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  });
  ```
- If the feature needs a new domain factory, add one too:
  ```ts
  export const make[Feature] = (overrides: Partial<any> = {}) => ({
    id: '[feature]-1',
    // ... all required fields with realistic Egyptian test data
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  });
  ```

### Test Structure
```ts
describe('[Feature]Service', () => {
  let service: [Feature]Service;
  let repo: ReturnType<typeof createMock[Feature]Repository>;
  // ... other mocked dependencies

  beforeEach(() => {
    repo = createMock[Feature]Repository();
    service = new [Feature]Service({ [feature]Repository: repo });
  });

  describe('[methodName]', () => {
    // Tests here
  });
});
```

### What to Test (IN THIS ORDER OF PRIORITY)

#### 1. Core Business Rules (MOST IMPORTANT)
- What makes this feature tick? Test the actual business logic decisions.
- State transitions (e.g., PENDING → APPROVED → COMPLETED)
- Authorization checks (who can do what?)
- Computed values (e.g., unread counts, ratings, distances)

#### 2. Existence Checks (404 paths)
- Every `find → if (!result) throw 404` must have a test
- Test that mutation (update/delete) does NOT happen if entity is missing:
  ```ts
  it('should not update when entity does not exist', async () => {
    repo.find.mockResolvedValue(null);
    await expect(service.update({ id: 'nope', data: {} })).rejects.toThrow('not found');
    expect(repo.update).not.toHaveBeenCalled(); // THIS IS KEY
  });
  ```

#### 3. Validation Edge Cases
- Empty strings, negative numbers, missing required fields
- Boundary values (min/max limits)

#### 4. Data Flow Verification
- Verify the right data reaches the repository:
  ```ts
  expect(repo.create).toHaveBeenCalledWith(
    expect.objectContaining({
      [feature]: expect.objectContaining({ status: 'PENDING' }),
    })
  );
  ```

#### 5. Relationship Integrity
- If the feature depends on other entities (user, worker, government):
  ```ts
  it('should validate [parent] exists before creating [child]', async () => {
    parentRepo.find.mockResolvedValue(null);
    await expect(service.create({ parentId: 'nope' })).rejects.toThrow('[Parent] not found');
    expect(childRepo.create).not.toHaveBeenCalled();
  });
  ```

### What NOT to Test
- Don't test that `vi.fn()` was called with exact TypeScript types (the lint errors are fine)
- Don't test Prisma queries directly — that's the repository's job
- Don't test Express routing — that's integration testing
- Don't test third-party libraries (Zod, bcrypt) work correctly
- Don't write trivial tests like "should call find" — test BEHAVIOR, not MECHANICS

### Test Naming Convention
Use descriptive names that read like business rules:
- ✅ `'should return register token for new users (phone not in system)'`
- ✅ `'should prevent self-conversations'`
- ✅ `'should NOT increment verify counter on success path'`
- ❌ `'should call find'`
- ❌ `'should return result'`
- ❌ `'test create method'`

### Final Check
After generating the tests:
1. Run `npx vitest run` — all tests must pass
2. If any test data is missing from `tests/helpers/mocks.ts`, add it
3. Make sure no test relies on execution order
4. Every `describe` block should have a `beforeEach` that resets all mocks
```
