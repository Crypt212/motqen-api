# Motqen Backend API

A role-based service marketplace backend connecting clients and workers. This API handles authentication (OTP-based), user management, job lifecycle, reviews, and authorization.

## Features

- **OTP Authentication** - Phone number verification via SMS or WhatsApp
- **JWT Token Management** - Access and refresh token-based authentication
- **Session Management** - Device fingerprint and IP tracking for security
- **Role-Based Access Control** - Client, Worker, and Admin roles
- **User Profile Management** - Basic info and worker-specific information
- **Input Validation** - Comprehensive request validation
- **Error Handling** - Structured error responses

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **OTP**: Twilio

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Setup database
npx prisma migrate dev

# Start development server
npm run dev
```

## Project Structure

```
src/
├── configs/          # Configuration files
├── controllers/      # HTTP request handlers
├── errors/          # Custom error classes
├── libs/            # Database, Redis, Logger utilities
├── middlewares/     # Express middleware
├── providers/       # External service providers
├── repositories/    # Data access layer
├── responses/       # Response formatters
├── routes/          # Route definitions
├── services/        # Business logic layer
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── validators/      # Request validation
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/otp/request` | Request OTP |
| POST | `/api/auth/otp/verify` | Verify OTP |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/access` | Refresh access token |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/basic-info` | Update basic info |
| PUT | `/api/users/worker-info` | Update worker info |

## Authentication Flow

1. **Request OTP** - User requests OTP via SMS/WhatsApp
2. **Verify OTP** - System validates OTP and returns login/register token
3. **Login/Register** - Use token to login or complete registration
4. **Session Creation** - System creates session with device fingerprint and IP
5. **Access Token** - Use refresh token to get new access tokens

## Security Features

- OTP-based phone authentication
- Device fingerprint tracking
- IP address logging
- Token expiration (7-day refresh, 15-minute access)
- Rate limiting
- CORS protection
- Helmet security headers

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/motqen

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Twilio
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_VIRTUAL_NUMBER=your-number

# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## License

ISC
