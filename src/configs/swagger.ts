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
        url: `http://localhost:${environment.backend.port || 3000}/api/${environment.api.version || 'v1'}`,
        description: `API version ${environment.api.version || 'v1'}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT token — use the token returned by /auth/otp/verify, /auth/login, or /auth/access depending on the endpoint',
        },
      },
      parameters: {
        DeviceFingerprint: {
          in: 'header',
          name: 'x-device-fingerprint',
          required: true,
          schema: {
            type: 'string',
            example: 'fp_abc123',
          },
          description: 'Device fingerprint for session/device identification',
        },
        UUIDPathId: {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          description: 'Resource UUID',
        },
        RegisterToken: {
          in: 'header',
          name: 'Authorization',
          required: true,
          schema: {
            type: 'string',
            example: 'Bearer <register_token_from_otp_verify>',
          },
          description:
            'Register token from /auth/otp/verify (tokenType: "register"). Format: Bearer <token>',
        },
        LoginToken: {
          in: 'header',
          name: 'Authorization',
          required: true,
          schema: {
            type: 'string',
            example: 'Bearer <login_token_from_otp_verify>',
          },
          description:
            'Login token from /auth/otp/verify (tokenType: "login"). Format: Bearer <token>',
        },
        AccessToken: {
          in: 'header',
          name: 'Authorization',
          required: true,
          schema: {
            type: 'string',
            example: 'Bearer <access_token>',
          },
          description: 'Access token from /auth/login or /auth/access. Format: Bearer <token>',
        },
        RefreshToken: {
          in: 'header',
          name: 'Authorization',
          required: true,
          schema: {
            type: 'string',
            example: 'Bearer <refresh_token>',
          },
          description: 'Refresh token from /auth/login. Format: Bearer <token>',
        },
      },
      schemas: {
        // ─── Auth Request Schemas ───────────────────────────────
        OTPRequest: {
          type: 'object',
          required: ['phoneNumber', 'method'],
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
          description:
            'Multipart form-data. Fields `userData` and `clientProfile` are JSON strings.',
          properties: {
            personal_image: {
              type: 'string',
              format: 'binary',
              description: 'Profile image file (optional)',
            },
            userData: {
              type: 'string',
              description: 'JSON string containing user data',
              example:
                '{"firstName":"أحمد","middleName":"علي","lastName":"محمد","governmentId":"uuid","city":"المنصورة"}',
            },
            clientProfile: {
              type: 'string',
              description: 'JSON string containing client profile data',
              example: '{"address":"123 Main St","addressNotes":"Near the park"}',
            },
          },
        },
        RegisterClientUserData: {
          type: 'object',
          required: ['firstName', 'middleName', 'lastName', 'governmentId', 'city'],
          properties: {
            firstName: {
              type: 'string',
              example: 'أحمد',
              description: 'First name (2-50 chars)',
            },
            middleName: {
              type: 'string',
              example: 'علي',
              description: 'Middle name (2-50 chars)',
            },
            lastName: {
              type: 'string',
              example: 'محمد',
              description: 'Last name (2-50 chars)',
            },
            governmentId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'Government UUID',
            },
            city: {
              type: 'string',
              example: 'المنصورة',
              description: 'City name (2-50 chars)',
            },
          },
        },
        RegisterClientProfile: {
          type: 'object',
          required: ['address'],
          properties: {
            address: {
              type: 'string',
              example: '123 Main Street',
              description: 'Client address (required)',
            },
            addressNotes: {
              type: 'string',
              example: 'Near the park',
              description: 'Optional address notes',
            },
          },
        },
        RegisterWorker: {
          type: 'object',
          description:
            'Multipart form-data. Fields `userData` and `workerProfile` are JSON strings. Three image files are required.',
          properties: {
            personal_image: {
              type: 'string',
              format: 'binary',
              description: 'Personal photo (required)',
            },
            id_image: {
              type: 'string',
              format: 'binary',
              description: 'National ID image (required)',
            },
            personal_with_id_image: {
              type: 'string',
              format: 'binary',
              description: 'Photo holding national ID (required)',
            },
            userData: {
              type: 'string',
              description: 'JSON string containing user data',
              example:
                '{"firstName":"أحمد","middleName":"علي","lastName":"محمد","governmentId":"uuid","city":"المنصورة"}',
            },
            workerProfile: {
              type: 'string',
              description: 'JSON string containing worker profile data',
              example:
                '{"experienceYears":5,"isInTeam":false,"acceptsUrgentJobs":true,"specializationsTree":[{"mainId":"uuid","subIds":["uuid"]}],"workGovernmentIds":["uuid"]}',
            },
          },
        },
        RegisterWorkerProfile: {
          type: 'object',
          required: [
            'experienceYears',
            'isInTeam',
            'acceptsUrgentJobs',
            'specializationsTree',
            'workGovernmentIds',
          ],
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
            specializationsTree: {
              type: 'array',
              items: {
                type: 'object',
                required: ['mainId'],
                properties: {
                  mainId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Main specialization UUID',
                  },
                  subIds: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                    description: 'Sub-specialization UUIDs',
                  },
                },
              },
              description: 'Specialization tree with main and sub specializations',
            },
            workGovernmentIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              example: ['123e4567-e89b-12d3-a456-426614174000'],
              description: 'Government UUIDs where worker can work',
            },
          },
        },
        Login: {
          type: 'object',
          description:
            'Login token is sent via Authorization header. Device fingerprint via x-device-fingerprint header.',
          properties: {},
        },
        // ─── User Request Schemas ───────────────────────────────
        UpdateUser: {
          type: 'object',
          description: 'All fields are optional — only provide fields to update',
          properties: {
            firstName: {
              type: 'string',
              example: 'أحمد',
              description: 'First name (2-50 characters, letters only)',
            },
            lastName: {
              type: 'string',
              example: 'محمد',
              description: 'Last name (2-50 characters, letters only)',
            },
            governmentId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'Government UUID',
            },
            city: {
              type: 'string',
              example: 'المنصورة',
              description: 'City name (2-100 characters)',
            },
            bio: {
              type: 'string',
              example: 'مستخدم نشط',
              description: 'Bio (max 500 characters)',
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
              example: 'USER',
              description: 'User role',
            },
          },
        },
        UpdateWorkerProfile: {
          type: 'object',
          description: 'All fields are optional — only provide fields to update',
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
            specializationsTree: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  mainId: { type: 'string', format: 'uuid' },
                  subIds: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                  },
                },
              },
              description: 'Specialization tree (optional)',
            },
            workGovernmentIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
              description: 'Government UUIDs where worker can work (optional)',
            },
          },
        },
        CreateWorkerProfile: {
          type: 'object',
          description:
            'Multipart form-data. Three image files required: personal_image, id_image, personal_with_id_image.',
          properties: {
            personal_image: {
              type: 'string',
              format: 'binary',
              description: 'Personal photo (required)',
            },
            id_image: {
              type: 'string',
              format: 'binary',
              description: 'National ID image (required)',
            },
            personal_with_id_image: {
              type: 'string',
              format: 'binary',
              description: 'Photo holding national ID (required)',
            },
            experienceYears: {
              type: 'integer',
              example: 5,
              description: 'Years of experience (0-50)',
            },
            isInTeam: {
              type: 'boolean',
              example: false,
            },
            acceptsUrgentJobs: {
              type: 'boolean',
              example: true,
            },
            specializationsTree: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  mainId: { type: 'string', format: 'uuid' },
                  subIds: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
            workGovernmentIds: {
              type: 'array',
              items: { type: 'string', format: 'uuid' },
            },
          },
        },
        UpdateClientProfile: {
          type: 'object',
          description: 'All fields are optional — only provide fields to update',
          properties: {
            address: {
              type: 'string',
              example: '123 Main Street',
              description: 'Client address (5-500 characters)',
            },
            addressNotes: {
              type: 'string',
              example: 'Near the park',
              description: 'Address notes (max 500 characters)',
            },
          },
        },
        CreateClientProfile: {
          type: 'object',
          required: ['address'],
          properties: {
            address: {
              type: 'string',
              example: '123 Main Street',
              description: 'Client address (5-500 characters, required)',
            },
            addressNotes: {
              type: 'string',
              example: 'Near the park',
              description: 'Optional address notes (max 500 characters)',
            },
          },
        },
        // ─── Government / Specialization Request Schemas ────────
        GovernmentInput: {
          type: 'object',
          required: ['name', 'nameAr', 'long', 'lat'],
          properties: {
            name: {
              type: 'string',
              example: 'Cairo',
              description: 'Government name in English (2-100 characters)',
            },
            nameAr: {
              type: 'string',
              example: 'القاهرة',
              description: 'Government name in Arabic (2-100 characters)',
            },
            long: {
              type: 'string',
              example: '31.2357',
              description: 'Longitude coordinate',
            },
            lat: {
              type: 'string',
              example: '30.0444',
              description: 'Latitude coordinate',
            },
          },
        },
        CityInput: {
          type: 'object',
          required: ['name', 'nameAr', 'long', 'lat', 'governmentId'],
          properties: {
            name: {
              type: 'string',
              example: 'Maadi',
              description: 'City name in English (2-100 characters)',
            },
            nameAr: {
              type: 'string',
              example: 'المعادي',
              description: 'City name in Arabic (2-100 characters)',
            },
            long: {
              type: 'string',
              example: '31.2571',
              description: 'Longitude coordinate',
            },
            lat: {
              type: 'string',
              example: '29.9592',
              description: 'Latitude coordinate',
            },
            governmentId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'Government UUID (required)',
            },
          },
        },
        SpecializationInput: {
          type: 'object',
          required: ['name', 'nameAr', 'category'],
          properties: {
            name: {
              type: 'string',
              example: 'Plumbing',
              description: 'Specialization name in English (2-100 characters)',
            },
            nameAr: {
              type: 'string',
              example: 'سباكة',
              description: 'Specialization name in Arabic (2-100 characters)',
            },
            category: {
              type: 'string',
              enum: [
                'ELECTRICITY',
                'PLUMBING',
                'AC',
                'CARPENTRY',
                'GENERALMAINTENANCE',
                'PAINTING',
                'CONSTRUCTION',
                'CLEANING',
                'INSTALLATION',
                'FURNITURETRANSPORT',
                'DRILLING',
                'ELECTRICALAPPLIANCES',
                'DEFAULTCATEGORY',
              ],
              example: 'PLUMBING',
              description: 'Specialization category',
            },
          },
        },
        SubSpecializationInput: {
          type: 'object',
          required: ['name', 'nameAr'],
          properties: {
            name: {
              type: 'string',
              example: 'Installation',
              description: 'Sub-specialization name in English (2-100 characters)',
            },
            nameAr: {
              type: 'string',
              example: 'تركيب',
              description: 'Sub-specialization name in Arabic (2-100 characters)',
            },
          },
        },
        // ─── Response Data Models ───────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            phoneNumber: {
              type: 'string',
              example: '+201234567890',
            },
            firstName: {
              type: 'string',
              example: 'أحمد',
            },
            middleName: {
              type: 'string',
              example: 'علي',
            },
            lastName: {
              type: 'string',
              example: 'محمد',
            },
            governmentId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            cityId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            cityName: {
              type: 'string',
              nullable: true,
              example: 'المنصورة',
            },
            profileImageUrl: {
              type: 'string',
              nullable: true,
              example: 'https://res.cloudinary.com/.../image.jpg',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'SUSPENDED', 'BANNED'],
              example: 'ACTIVE',
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN'],
              example: 'USER',
            },
          },
        },
        WorkerProfile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            experienceYears: {
              type: 'integer',
              example: 5,
            },
            isInTeam: {
              type: 'boolean',
              example: false,
            },
            acceptsUrgentJobs: {
              type: 'boolean',
              example: true,
            },
            isApproved: {
              type: 'boolean',
              example: false,
              description: 'Admin approval status',
            },
          },
        },
        ClientProfile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            address: {
              type: 'string',
              example: '123 Main Street',
            },
            addressNotes: {
              type: 'string',
              nullable: true,
              example: 'Near the park',
            },
          },
        },
        Government: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Cairo',
            },
            nameAr: {
              type: 'string',
              example: 'القاهرة',
            },
            long: {
              type: 'string',
              example: '31.2357',
            },
            lat: {
              type: 'string',
              example: '30.0444',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        City: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            governmentId: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Maadi',
            },
            nameAr: {
              type: 'string',
              example: 'المعادي',
            },
            long: {
              type: 'string',
              example: '31.2571',
            },
            lat: {
              type: 'string',
              example: '29.9592',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Specialization: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Plumbing',
            },
            nameAr: {
              type: 'string',
              example: 'سباكة',
            },
            category: {
              type: 'string',
              enum: [
                'ELECTRICITY',
                'PLUMBING',
                'AC',
                'CARPENTRY',
                'GENERALMAINTENANCE',
                'PAINTING',
                'CONSTRUCTION',
                'CLEANING',
                'INSTALLATION',
                'FURNITURETRANSPORT',
                'DRILLING',
                'ELECTRICALAPPLIANCES',
                'DEFAULTCATEGORY',
              ],
              example: 'PLUMBING',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        SubSpecialization: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Installation',
            },
            nameAr: {
              type: 'string',
              example: 'تركيب',
            },
            mainSpecializationId: {
              type: 'string',
              format: 'uuid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        WorkerVerification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            workerProfileId: {
              type: 'string',
              format: 'uuid',
            },
            idWithPersonalImageUrl: {
              type: 'string',
              example: 'https://res.cloudinary.com/.../id_selfie.jpg',
            },
            idDocumentUrl: {
              type: 'string',
              example: 'https://res.cloudinary.com/.../id_doc.jpg',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
              example: 'PENDING',
            },
            reason: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        // ─── Generic Response Schemas ───────────────────────────
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
        // ─── Chat Schemas ───────────────────────────────────────
        SendMessageRequest: {
          type: 'object',
          required: ['conversationId', 'content'],
          properties: {
            conversationId: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
              description: 'Conversation UUID',
            },
            content: {
              type: 'string',
              example: 'Hello, are you available today?',
              description: 'Message text content',
            },
            type: {
              type: 'string',
              enum: ['TEXT', 'IMAGE'],
              default: 'TEXT',
              description: 'Message type',
            },
          },
        },
        PartnerUser: {
          type: 'object',
          description: 'Brief public info about the conversation partner',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string', example: 'أحمد' },
            lastName: { type: 'string', example: 'محمد' },
            profileImageUrl: {
              type: 'string',
              nullable: true,
              example: 'https://res.cloudinary.com/.../avatar.jpg',
            },
            isOnline: {
              type: 'boolean',
              description: 'Whether the partner is currently online',
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
            conversationId: { type: 'string', format: 'uuid' },
            senderId: { type: 'string', format: 'uuid' },
            messageNumber: {
              type: 'integer',
              example: 42,
              description: 'Per-conversation sequential number — used as cursor',
            },
            content: {
              type: 'string',
              example: 'Hello, are you available today?',
            },
            type: { type: 'string', enum: ['TEXT', 'IMAGE'], example: 'TEXT' },
            createdAt: { type: 'string', format: 'date-time' },
            sender: { $ref: '#/components/schemas/PartnerUser' },
          },
        },
        ConversationSummary: {
          type: 'object',
          description: 'Conversation list item with unread count derived from counter difference',
          properties: {
            id: { type: 'string', format: 'uuid' },
            messageCounter: {
              type: 'integer',
              example: 42,
              description: 'Total messages sent in this conversation',
            },
            unreadCount: {
              type: 'integer',
              example: 5,
              description: 'messageCounter − lastReadMessageNumber',
            },
            partnerLastReceivedMessageNumber: {
              type: 'integer',
              example: 40,
              description: 'Last messageNumber the partner has received (delivered)',
            },
            partnerLastReadMessageNumber: {
              type: 'integer',
              example: 38,
              description: 'Last messageNumber the partner has read',
            },
            lastMessage: {
              nullable: true,
              $ref: '#/components/schemas/Message',
            },
            partner: { $ref: '#/components/schemas/PartnerUser' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            messageCounter: { type: 'integer', example: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // ─── Explore Schemas ────────────────────────────────────
        ExploreWorkerCard: {
          type: 'object',
          description: 'Worker card data for Explore search results',
          properties: {
            workerId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
              description: 'Worker user ID',
            },
            name: {
              type: 'string',
              example: 'أحمد علي محمد',
              description: 'Worker full name',
            },
            profileImage: {
              type: 'string',
              nullable: true,
              example: 'https://res.cloudinary.com/.../avatar.jpg',
              description: 'Worker profile image URL',
            },
            service_title: {
              type: 'string',
              example: 'تركيب الأنابيب',
              description: 'Main specialization name',
            },
            rating: {
              type: 'number',
              format: 'float',
              example: 4.5,
              description: 'Average rating from completed orders (0-5)',
            },
            area: {
              type: 'string',
              example: 'القاهرة',
              description: 'Main work government/area',
            },
            isAvailableNow: {
              type: 'boolean',
              example: true,
              description: 'Whether worker is currently available',
            },
            completedServices: {
              type: 'integer',
              example: 15,
              description: 'Number of completed or reviewed orders',
            },
            acceptsUrgentJobs: {
              type: 'boolean',
              example: true,
              description: 'Whether worker accepts urgent jobs',
            },
            distanceKm: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 5.2,
              description: 'Distance in kilometers (only when nearest=true)',
            },
          },
        },
        ExploreSearchResponse: {
          type: 'object',
          description: 'Paginated list of worker cards',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ExploreWorkerCard' },
              description: 'List of worker cards',
            },
            meta: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  example: 50,
                  description: 'Total number of matching workers',
                },
                page: {
                  type: 'integer',
                  example: 1,
                  description: 'Current page number',
                },
                limit: {
                  type: 'integer',
                  example: 10,
                  description: 'Results per page',
                },
                totalPages: {
                  type: 'integer',
                  example: 5,
                  description: 'Total number of pages',
                },
              },
            },
          },
        },
        WorkerPortfolioImage: {
          type: 'object',
          description: 'Portfolio project image',
          properties: {
            imageUrl: {
              type: 'string',
              example: 'https://res.cloudinary.com/.../project1.jpg',
              description: 'Image URL',
            },
          },
        },
        WorkerPortfolioProject: {
          type: 'object',
          description: 'Portfolio project entry',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'proj-id-1',
            },
            description: {
              type: 'string',
              example: 'مشروع تركيب مواسير دقيقة',
              description: 'Project description',
            },
            projectImages: {
              type: 'array',
              items: { $ref: '#/components/schemas/WorkerPortfolioImage' },
              description: 'Project images',
            },
          },
        },
        WorkerBadge: {
          type: 'string',
          enum: ['TOP_RATED', 'VERIFIED', 'EXPERT', 'TRUSTED'],
          example: 'TOP_RATED',
          description: 'Worker achievement badge',
        },
        WorkerDetailResponse: {
          type: 'object',
          description: 'Full public profile of a worker',
          properties: {
            workerId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              example: 'أحمد علي محمد',
            },
            profileImage: {
              type: 'string',
              nullable: true,
              example: 'https://res.cloudinary.com/.../avatar.jpg',
            },
            specializations: {
              type: 'array',
              items: { type: 'string' },
              example: ['تركيب الأنابيب', 'إصلاح الأنابيب'],
              description: 'List of specialization names',
            },
            experienceYears: {
              type: 'integer',
              example: 5,
              description: 'Years of experience',
            },
            area: {
              type: 'string',
              example: 'القاهرة',
              description: 'Primary work area',
            },
            workGovernments: {
              type: 'array',
              items: { type: 'string' },
              example: ['القاهرة', 'الجيزة'],
              description: 'List of work governments/areas',
            },
            badges: {
              type: 'array',
              items: { $ref: '#/components/schemas/WorkerBadge' },
              description: 'Achievement badges',
            },
            verificationStatus: {
              type: 'string',
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
              example: 'APPROVED',
              description: 'Verification status',
            },
            bio: {
              type: 'string',
              example: 'متخصص في السباكة لمدة 5 سنوات',
              description: 'Worker bio',
            },
            portfolio: {
              type: 'array',
              items: { $ref: '#/components/schemas/WorkerPortfolioProject' },
              description: 'Portfolio projects',
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
                  {
                    type: 'field',
                    message: 'Method must be either SMS or WhatsApp',
                  },
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
                message: 'Resource not found',
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
        description: 'Authentication endpoints (OTP, registration, login, logout, token refresh)',
      },
      {
        name: 'Dashboard',
        description: 'Authenticated user dashboard endpoints (profiles, settings, management)',
      },
      {
        name: 'Governments',
        description: 'Government & city lookup and management',
      },
      {
        name: 'Specializations',
        description: 'Specialization & sub-specialization lookup and management',
      },
      {
        name: 'Workers',
        description: 'Worker profile management and details',
      },
      {
        name: 'Chat',
        description:
          'Real-time chat — REST endpoints for conversation bootstrap, message history, and offline sync. ' +
          'Real-time messaging itself happens over Socket.IO (see Socket Events in the project docs).',
      },
    ],
  },
  apis: ['./src/routes/v1/**/*.{ts,js}'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
