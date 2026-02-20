/**
 * @fileoverview Swagger Configuration - OpenAPI documentation setup
 * @module configs/swagger
 */

import swaggerJsdoc from 'swagger-jsdoc';
import environment from './environment.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Motqen API',
      version: '1.0.0',
      description: 'API documentation for the Motqen backend application',
      contact: {
        name: 'API Support',
        email: 'support@motqen.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${environment.port || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token received from /auth/login or /auth/access endpoints',
        },
      },
      schemas: {
        // Auth Schemas
        OTPRequest: {
          type: 'object',
          required: ['phoneNumber'],
          properties: {
            phoneNumber: {
              type: 'string',
              example: '+201234567890',
              description: 'Egyptian phone number',
            },
            method: {
              type: 'string',
              enum: ['SMS', 'WhatsApp'],
              example: 'SMS',
              description: 'OTP delivery method',
            },
          },
        },
        OTPVerify: {
          type: 'object',
          required: ['phoneNumber', 'otp', 'method'],
          properties: {
            phoneNumber: {
              type: 'string',
              example: '+201234567890',
              description: 'Egyptian phone number',
            },
            otp: {
              type: 'string',
              example: '123456',
              description: 'One-time password (4-6 digits)',
            },
            method: {
              type: 'string',
              enum: ['SMS', 'WhatsApp'],
              example: 'SMS',
              description: 'OTP delivery method used',
            },
          },
        },
        RegisterClient: {
          type: 'object',
          required: ['registerToken', 'firstName', 'lastName', 'government', 'city'],
          properties: {
            registerToken: {
              type: 'string',
              example: 'reg_token_xxx',
              description: 'Registration token from OTP verification',
            },
            firstName: {
              type: 'string',
              example: 'أحمد',
              description: 'User first name (Arabic or English)',
            },
            lastName: {
              type: 'string',
              example: 'محمد',
              description: 'User last name (Arabic or English)',
            },
            government: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'Government UUID',
            },
            city: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174001',
              description: 'City UUID',
            },
            bio: {
              type: 'string',
              example: 'مستخدم جديد',
              description: 'Optional bio (max 500 characters)',
            },
          },
        },
        RegisterWorker: {
          type: 'object',
          required: [
            'registerToken',
            'firstName',
            'lastName',
            'government',
            'city',
            'experienceYears',
            'isInTeam',
            'acceptsUrgentJobs',
            'specializationNames',
            'workGovernmentNames',
          ],
          properties: {
            registerToken: {
              type: 'string',
              example: 'reg_token_xxx',
              description: 'Registration token from OTP verification',
            },
            firstName: {
              type: 'string',
              example: 'أحمد',
              description: 'Worker first name (Arabic or English)',
            },
            lastName: {
              type: 'string',
              example: 'محمد',
              description: 'Worker last name (Arabic or English)',
            },
            government: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'Government UUID (residence)',
            },
            city: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174001',
              description: 'City UUID (residence)',
            },
            bio: {
              type: 'string',
              example: 'فني خبرة 10 سنوات',
              description: 'Optional bio (max 500 characters)',
            },
            experienceYears: {
              type: 'integer',
              example: 5,
              description: 'Years of experience (0-50)',
            },
            isInTeam: {
              type: 'boolean',
              example: false,
              description: 'Whether the worker works in a team',
            },
            acceptsUrgentJobs: {
              type: 'boolean',
              example: true,
              description: 'Whether the worker accepts urgent jobs',
            },
            specializationNames: {
              type: 'array',
              items: { type: 'string' },
              example: [' plumbing', 'electrical'],
              description: 'List of specialization names',
            },
            subSpecializationNames: {
              type: 'array',
              items: { type: 'string' },
              example: ['installation', 'repair'],
              description: 'List of sub-specialization names (optional)',
            },
            workGovernmentNames: {
              type: 'array',
              items: { type: 'string' },
              example: ['Cairo', 'Giza'],
              description: 'List of governments where worker can work',
            },
          },
        },
        Login: {
          type: 'object',
          required: ['loginToken'],
          properties: {
            loginToken: {
              type: 'string',
              example: 'login_token_xxx',
              description: 'Login token from OTP verification',
            },
            deviceFingerprint: {
              type: 'string',
              example: 'fp_abc123',
              description: 'Optional device fingerprint',
            },
          },
        },
        GenerateAccessToken: {
          type: 'object',
          properties: {},
          required: [],
        },
        // User Schemas
        UpdateUserBasicInfo: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
              example: 'USER',
              description: 'User role',
            },
            firstName: {
              type: 'string',
              example: 'أحمد',
              description: 'User first name (optional - only provide fields to update)',
            },
            lastName: {
              type: 'string',
              example: 'محمد',
              description: 'User last name',
            },
            government: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'Government UUID',
            },
            city: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174001',
              description: 'City UUID',
            },
            bio: {
              type: 'string',
              example: 'مستخدم نشط',
              description: 'Optional bio (max 500 characters)',
            },
          },
        },
        UpdateWorkerInfo: {
          type: 'object',
          properties: {
            experienceYears: {
              type: 'integer',
              example: 5,
              description: 'Years of experience (0-50)',
            },
            isInTeam: {
              type: 'boolean',
              example: false,
              description: 'Whether the worker works in a team',
            },
            acceptsUrgentJobs: {
              type: 'boolean',
              example: true,
              description: 'Whether the worker accepts urgent jobs',
            },
          },
        },
        // User Schema
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'User unique identifier',
            },
            phoneNumber: {
              type: 'string',
              example: '+201234567890',
              description: 'Egyptian phone number',
            },
            firstName: {
              type: 'string',
              example: 'أحمد',
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              example: 'محمد',
              description: 'User last name',
            },
            governmentId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'Government UUID',
            },
            cityId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description: 'City UUID',
            },
            bio: {
              type: 'string',
              nullable: true,
              example: 'مستخدم نشط',
              description: 'User bio (max 500 characters)',
            },
            profileImage: {
              type: 'string',
              nullable: true,
              example: 'https://res.cloudinary.com/.../image.jpg',
              description: 'Profile image URL',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'SUSPENDED', 'BANNED'],
              example: 'ACTIVE',
              description: 'Account status',
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
              example: 'USER',
              description: 'User role',
            },
          },
        },
        WorkerProfile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174002',
              description: 'Worker profile unique identifier',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            experienceYears: {
              type: 'integer',
              example: 5,
              description: 'Years of experience',
            },
            isInTeam: {
              type: 'boolean',
              example: false,
              description: 'Whether the worker works in a team',
            },
            acceptsUrgentJobs: {
              type: 'boolean',
              example: true,
              description: 'Whether the worker accepts urgent jobs',
            },
          },
        },
        ClientProfile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174003',
              description: 'Client profile unique identifier',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
          },
        },
        // Response Schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Error message',
                },
                code: {
                  type: 'string',
                  example: 'ERROR_CODE',
                },
              },
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Invalid input parameters',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  message: 'Validation error: Phone number is required',
                  code: 'VALIDATION_ERROR',
                },
              },
            },
          },
        },
        Unauthorized: {
          description: 'Unauthorized - Invalid or missing authentication',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  message: 'Invalid or expired token',
                  code: 'UNAUTHORIZED',
                },
              },
            },
          },
        },
        Forbidden: {
          description: 'Forbidden - Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  message: 'Access denied',
                  code: 'FORBIDDEN',
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Not Found - Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  message: 'Resource not found',
                  code: 'NOT_FOUND',
                },
              },
            },
          },
        },
        Conflict: {
          description: 'Conflict - Resource already exists',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  message: 'User already exists',
                  code: 'CONFLICT',
                },
              },
            },
          },
        },
        TooManyRequests: {
          description: 'Too Many Requests - Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  message: 'Too many requests. Please try again later.',
                  code: 'RATE_LIMIT_EXCEEDED',
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                success: false,
                error: {
                  message: 'Internal server error',
                  code: 'INTERNAL_ERROR',
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
