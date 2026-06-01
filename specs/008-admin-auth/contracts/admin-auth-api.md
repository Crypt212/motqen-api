# Admin Authentication API Contracts

## Endpoints

### POST `/api/v1/admin/auth/login`

**Auth**: None

**Body**:

```json
{
  "username": "admin@example.com",
  "password": "securePassword123"
}
```

**Response 200**:

```json
{
  "status": "success",
  "message": "Admin authenticated successfully",
  "data": {
    "admin": {
      "id": "uuid",
      "username": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### POST `/api/v1/admin/auth/logout`

**Auth**: Required (`authenticateAdminAccess`)

**Body**: None

**Response 200**:

```json
{
  "status": "success",
  "message": "Logged out successfully",
  "data": null
}
```

### POST `/api/v1/admin/auth/refresh`

**Auth**: Required (`authenticateAdminRefresh`)

**Body**: None

**Response 200**:

```json
{
  "status": "success",
  "message": "Access token generated successfully",
  "data": {
    "accessToken": "new-jwt-access-token"
  }
}
```

### GET `/api/v1/admin/users`

**Auth**: Required (`authenticateAdminAccess` + `authorizeAdminRole('SUPER_ADMIN')`)

**Query Parameters**:

| Param | Type   | Required | Default | Notes       |
| ----- | ------ | -------- | ------- | ----------- |
| page  | number | No       | 1       | Page number |
| limit | number | No       | 20      | Page size   |

**Response 200**:

```json
{
  "status": "success",
  "message": "Admins retrieved successfully",
  "data": {
    "items": [
      {
        "id": "uuid",
        "username": "admin@example.com",
        "firstName": "Admin",
        "lastName": "User",
        "role": "SUPER_ADMIN",
        "status": "ACTIVE",
        "createdAt": "2026-06-01T00:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

### POST `/api/v1/admin/users`

**Auth**: Required (`authenticateAdminAccess` + `authorizeAdminRole('SUPER_ADMIN')`)

**Body**:

```json
{
  "username": "newadmin@example.com",
  "password": "securePassword123",
  "firstName": "New",
  "lastName": "Admin",
  "role": "USER_MANAGEMENT"
}
```

**Response 201**:

```json
{
  "status": "success",
  "message": "Admin created successfully",
  "data": {
    "id": "uuid",
    "username": "newadmin@example.com",
    "firstName": "New",
    "lastName": "Admin",
    "role": "USER_MANAGEMENT",
    "status": "ACTIVE",
    "createdAt": "2026-06-01T00:00:00.000Z"
  }
}
```
