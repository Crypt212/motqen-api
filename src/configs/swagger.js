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
        // Response Schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success'],
              example: 'success',
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
              nullable: true,
              description: 'Response data (null when no data is returned)',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['fail', 'error'],
              example: 'fail',
              description: '"fail" for 4xx errors, "error" for 5xx errors',
            },
            message: {
              type: 'string',
              example: 'Error description',
            },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Validation failed',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    example: 'field',
                  },
                  message: {
                    type: 'string',
                    example: 'Phone number is required',
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Operation failed due to invalid data or business logic',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                status: 'fail',
                message: 'Invalid or expired OTP',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation Error - Request body did not pass validation',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationErrorResponse',
              },
              example: {
                success: false,
                message: 'Validation failed',
                errors: [
                  { type: 'field', message: 'Phone number is required' },
                  { type: 'field', message: 'Method must be either SMS or WhatsApp' },
                ],
              },
            },
          },
        },
        Unauthorized: {
          description: 'Unauthorized - Invalid, expired, or missing access token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                status: 'fail',
                message: 'Unauthorized',
              },
            },
          },
        },
        Forbidden: {
          description: 'Forbidden - Insufficient permissions for this action',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                status: 'fail',
                message: 'Unauthorized',
              },
            },
          },
        },
        NotFound: {
          description: 'Not Found - Requested resource does not exist',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                status: 'fail',
                message: 'User not found',
              },
            },
          },
        },
        Conflict: {
          description: 'Conflict - Resource already exists (e.g., phone number already registered)',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                status: 'fail',
                message: 'User already exists',
              },
            },
          },
        },
        TooManyRequests: {
          description: 'Too Many Requests - Rate limit exceeded',
          headers: {
            'Retry-After': {
              description: 'Number of seconds to wait before retrying',
              schema: {
                type: 'integer',
                example: 60,
              },
            },
          },
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                status: 'fail',
                message: 'Too many requests, please try again later',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal Server Error - Unexpected server failure',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                status: 'error',
                message: 'Something went wrong',
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
