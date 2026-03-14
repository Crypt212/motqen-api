# Motqen Backend - Code Style Guide

## Overview

This document outlines the coding standards, patterns, and best practices for the Motqen Backend project. All developers should follow these guidelines to maintain consistency across the codebase.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Naming Conventions](#naming-conventions)
3. [Repository Pattern](#repository-pattern)
4. [Service Layer](#service-layer)
5. [Controllers](#controllers)
6. [Validators](#validators)
7. [Dynamic Query System](#dynamic-query-system)
8. [Error Handling](#error-handling)
9. [TypeScript JSDoc](#typescript-jsdoc)
10. [File Organization](#file-organization)

---

## Project Structure

```
src/
├── configs/           # Configuration files
├── controllers/      # HTTP request handlers
├── errors/           # Custom error classes
├── libs/             # Library utilities
├── middlewares/      # Express middlewares
├── providers/        # External service providers
├── repositories/
│   ├── cache/        # Cache repositories
│   └── database/     # Database repositories
├── responses/        # Response formatters
├── routes/           # Route definitions
├── services/         # Business logic
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── validators/      # Request validation
```

---

## Naming Conventions

### Files
- Use camelCase: `userService.js`, `authController.js`
- Use PascalCase for classes: `UserRepository.js`, `AuthService.js`

### Variables and Functions
- Use camelCase: `getUser()`, `findById()`
- Use PascalCase for Classes: `class UserRepository`
- Use UPPER_SNAKE_CASE for constants: `MAX_RETRY_COUNT`

### Methods
- `find*` - Find single record(s)
- `findById*` - Find by unique ID
- `findMany*` - Find multiple records
- `create*` - Create new record
- `update*` - Update existing record
- `delete*` - Delete record
- `upsert*` - Update or insert

---

## Repository Pattern

### Base Repository

All repositories extend the base `Repository` class which provides:

```javascript
// Basic CRUD operations
findFirst(where, select)
findById(id, select)
findMany({ where, select, pagination, orderBy, include, paginate })
create(data)
createMany(data)
update(data, where)
updateMany(data, where)
delete(where)
deleteMany(where)
exists(where)
count(where)
```

### Flexible findMany Method

The `findMany` method supports pagination, filtering, and ordering:

```javascript
const result = await repository.findMany({
  where: { status: 'ACTIVE' },           // Filtering
  pagination: { page: 1, limit: 20 },   // Pagination
  orderBy: [{ field: 'createdAt', order: 'desc' }], // Ordering
  include: ['user', 'profile'],           // Relations
  paginate: true                         // Return paginated result
});
```

### Custom Repository Methods

Add custom methods for specific business logic:

```javascript
class UserRepository extends Repository {
  constructor(prisma) {
    super(prisma, "user");
  }

  async findActiveUsers({ governmentId }) {
    return this.findMany({
      where: { 
        status: 'ACTIVE',
        governmentId 
      }
    });
  }
}
```

---

## Service Layer

### Service Structure

Services contain business logic and use repositories for data access:

```javascript
import Service, { tryCatch } from "./Service.js";
import UserRepository from "../repositories/database/UserRepository.js";

export default class UserService extends Service {
  #userRepository;

  constructor({ userRepository }) {
    super();
    this.#userRepository = userRepository;
  }

  async getUser(userId) {
    return tryCatch(async () => {
      return await this.#userRepository.findById(userId);
    });
  }
}
```

### Using tryCatch

Always wrap async operations with `tryCatch` to handle errors consistently:

```javascript
async methodName(params) {
  return tryCatch(async () => {
    // Business logic here
  });
}
```

---

## Controllers

### Controller Structure

Controllers handle HTTP requests and responses:

```javascript
import { matchedData } from "express-validator";
import SuccessResponse from "../responses/successResponse.js";
import { userService } from "../state.js";
import { asyncHandler } from '../types/asyncHandler.js';

export const getUser = asyncHandler(async (req, res) => {
  const userId = req.userState.userId;
  const user = await userService.getUser(userId);

  new SuccessResponse(
    "User retrieved successfully",
    { user },
    200
  ).send(res);
});
```

### Query Parameter Handling

For endpoints with pagination/filtering/ordering:

```javascript
import { parseQueryParams } from '../validators/common.js';

const QUERY_CONFIG = {
  allowedFilterFields: ['name', 'status'],
  filterFieldTypes: {
    name: { type: 'string', minLength: 2 },
    status: { type: 'enum', enumValues: ['ACTIVE', 'INACTIVE'] }
  },
  allowedOrderByFields: ['name', 'createdAt'],
  allowedSearchFields: ['name']
};

export const getItems = asyncHandler(async (req, res) => {
  const { pagination, filter, orderBy } = parseQueryParams(req.query, QUERY_CONFIG);
  
  const result = await repository.findMany({
    filter,
    pagination,
    orderBy,
    paginate: true
  });

  new SuccessResponse("Items retrieved", {
    items: result.data,
    pagination: result.pagination
  }, 200).send(res);
});
```

---

## Validators

### Using Dynamic Validators

Use `createQueryValidator` for flexible query parameter validation:

```javascript
import { createQueryValidator } from '../validators/common.js';

const QUERY_CONFIG = {
  allowedFilterFields: ['name', 'status'],
  filterFieldTypes: {
    name: { type: 'string', minLength: 2 },
    status: { type: 'enum', enumValues: ['ACTIVE', 'INACTIVE'] }
  },
  allowedOrderByFields: ['name', 'createdAt'],
  allowedSearchFields: ['name']
};

export const validateGetItems = [
  ...createQueryValidator(QUERY_CONFIG)
];
```

### Field Type Definitions

Supported field types:
- `string` - Text with optional length validation
- `number` - Numeric values with min/max
- `boolean` - true/false
- `uuid` - Valid UUID format
- `date` - ISO 8601 date format
- `enum` - Specific allowed values

```javascript
filterFieldTypes: {
  name: { type: 'string', minLength: 2, maxLength: 100 },
  age: { type: 'number', min: 18, max: 100 },
  status: { type: 'enum', enumValues: ['ACTIVE', 'INACTIVE'] },
  userId: { type: 'uuid' },
  createdAt: { type: 'date' }
}
```

---

## Dynamic Query System

### Query Flow

1. **Validator** - Validates query parameters
2. **parseQueryParams** - Converts validated params to repository format
3. **Repository** - Executes query with filters

### Example Endpoint

```javascript
// Route
router.get('/users', 
  validateGetUsers, 
  validateRequest, 
  getUsers
);

// Validator
export const validateGetUsers = [
  ...createQueryValidator({
    allowedFilterFields: ['role', 'status'],
    filterFieldTypes: {
      role: { type: 'enum', enumValues: ['USER', 'ADMIN'] },
      status: { type: 'enum', enumValues: ['ACTIVE', 'INACTIVE'] }
    },
    allowedOrderByFields: ['createdAt', 'name'],
    allowedSearchFields: ['name', 'email']
  })
];

// Controller
export const getUsers = asyncHandler(async (req, res) => {
  const QUERY_CONFIG = {/* ... */};
  const { pagination, filter, orderBy } = parseQueryParams(req.query, QUERY_CONFIG);
  
  const result = await userService.findMany({
    filter,
    pagination,
    orderBy,
    paginate: true
  });

  new SuccessResponse("Users retrieved", result, 200).send(res);
});
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `sortBy` | string | Field to sort by |
| `sortOrder` | string | 'asc' or 'desc' |
| `search` | string | Search term |
| `{field}` | any | Filter by specific field |

---

## Error Handling

### Custom Errors

Use custom error classes for consistent error handling:

```javascript
// Throwing an error
throw new AppError("User not found", 404);

// With additional info
throw new AppError("Invalid data", 400, { field: "email" });
```

### Error Middleware

Errors are handled by middleware:

```javascript
// In errors/AppError.js
export default class AppError extends Error {
  constructor(message, statusCode = 500, info = null) {
    super(message);
    this.statusCode = statusCode;
    this.info = info;
    this.isOperational = true;
  }
}
```

---

## TypeScript JSDoc

Use JSDoc for type annotations:

```javascript
/** @typedef {import("../repositories/database/UserRepository.js").IDType} IDType */

/**
 * Find a user by ID
 * @param {Object} params
 * @param {IDType} params.userId - User ID
 * @returns {Promise<User | null>}
 */
async findUserById({ userId }) {
  return await this.prismaClient.user.findUnique({
    where: { id: userId }
  });
}
```

---

## File Organization

### Import Order

1. Node built-ins
2. External packages
3. Internal modules (relative)

```javascript
// 1. Node built-ins
import path from 'path';

// 2. External packages
import { PrismaClient } from '@prisma/client';

// 3. Internal modules
import AppError from '../errors/AppError.js';
import UserRepository from '../repositories/database/UserRepository.js';
```

### Class Structure

```javascript
/**
 * @fileoverview Description of the file
 * @module path/to/module
 */

// Imports...

/** @typedef {import('./types').TypeName} TypeName */

// Class with JSDoc
/**
 * Class description
 * @class
 * @extends ParentClass
 */
export default class ClassName extends ParentClass {
  /** @type {TypeName} */
  #privateField;

  /**
   * @param {Object} params
   * @param {TypeName} params.field - Description
   */
  constructor({ field }) {
    super();
    this.#privateField = field;
  }

  /**
   * Method description
   * @async
   * @method methodName
   * @param {string} param - Description
   * @returns {Promise<TypeName>}
   */
  async methodName(param) {
    // Implementation
  }
}
```

---

## Best Practices

### Do's
- ✅ Use the flexible `findMany` method with optional parameters
- ✅ Use `tryCatch` wrapper in services
- ✅ Use proper JSDoc types
- ✅ Use consistent naming conventions
- ✅ Use the dynamic query validator for list endpoints
- ✅ Keep services focused on business logic

### Don'ts
- ❌ Don't create separate methods for pagination/filtering
- ❌ Don't use `any` type in JSDoc
- ❌ Don't bypass the validator layer
- ❌ Don't mix business logic in controllers
- ❌ Don't use hardcoded values - use config files

---

## Testing

When writing tests:
- Test repository methods with mock Prisma
- Test services with mock repositories
- Test controllers with supertest

---

## References

- [Express Validator](https://express-validator.github.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JSDoc Reference](https://jsdoc.app/)
