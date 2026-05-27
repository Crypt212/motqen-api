import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  RegisterClientSchema,
  RegisterWorkerSchema,
  RequestOTPSchema,
  VerifyOTPSchema,
} from '../../../schemas/requests/auth.request.js';
import {
  RequestOTPResponseSchema,
  VerifyOTPResponseSchema,
  RegisterResponseSchema,
  LoginResponseSchema,
  AccessTokenResponseSchema,
  ReviewStatusResponseSchema,
} from '../../../schemas/responses/auth.response.js';
import { EmptySuccessResponseSchema } from '../../../schemas/responses.js';
import { z } from '../../../libs/zod.js';
import { createResponseDoc } from '../../../docs/common.js';

export default function registerAuthDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/otp/request
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/otp/request',
    tags: ['Auth'],
    summary: 'Request OTP',
    description:
      'Sends a one-time password to the provided Egyptian phone number via SMS or WhatsApp.',
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: { 'application/json': { schema: RequestOTPSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'OTP sent successfully',
        content: { 'application/json': { schema: RequestOTPResponseSchema } },
      },
      badRequestResponse: true,
      validationErrorResponse: true,
      tooManyRequestsResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/otp/verify
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/otp/verify',
    tags: ['Auth'],
    summary: 'Verify OTP',
    description:
      'Verifies the OTP and returns either a login token (existing user) or a register token (new user).',
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: { 'application/json': { schema: VerifyOTPSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'OTP verified successfully',
        content: { 'application/json': { schema: VerifyOTPResponseSchema } },
      },
      badRequestResponse: true,
      validationErrorResponse: true,
      tooManyRequestsResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/register-client
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/register-client',
    tags: ['Auth'],
    summary: 'Register a new client',
    description:
      'Registers a new client user. Requires a register token (from OTP verify) as Bearer token. Send as multipart/form-data with `userData` (JSON string) and optional `personal_image`.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: RegisterClientSchema.extend({
              personal_image: z
                .any()
                .openapi({
                  type: 'string',
                  format: 'binary',
                  description: 'Personal photo (jpeg, png, bmp, gif)',
                })
                .optional(),
            }),
          },
        },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Client registered successfully',
        content: { 'application/json': { schema: RegisterResponseSchema } },
      },
      badRequestResponse: true,
      validationErrorResponse: true,
      tooManyRequestsResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/register-worker
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/register-worker',
    tags: ['Auth'],
    summary: 'Register a new worker',
    description:
      'Registers a new worker user. Requires a register token (from OTP verify) as Bearer token. Send as multipart/form-data with `userData`, `workerProfile` (JSON strings) and required images: personal_image, id_image, personal_with_id_image.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: RegisterWorkerSchema.extend({
              personal_image: z.any().openapi({
                type: 'string',
                format: 'binary',
                description: 'Personal photo (required, jpeg/png/bmp/gif)',
              }),
              id_image: z.any().openapi({
                type: 'string',
                format: 'binary',
                description: 'National ID document image (required, jpeg/png/bmp/gif)',
              }),
              personal_with_id_image: z.any().openapi({
                type: 'string',
                format: 'binary',
                description: 'Selfie holding national ID (required, jpeg/png/bmp/gif)',
              }),
            }),
          },
        },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Worker registered successfully',
        content: { 'application/json': { schema: RegisterResponseSchema } },
      },
      badRequestResponse: true,
      validationErrorResponse: true,
      tooManyRequestsResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/login
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/login',
    tags: ['Auth'],
    summary: 'Login',
    description:
      'Authenticates an existing user using a login token (from OTP verify) and creates a session. Set it as Bearer <token> in the Authorization header.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Login successful',
        content: { 'application/json': { schema: LoginResponseSchema } },
      },
      badRequestResponse: true,
      validationErrorResponse: true,
      tooManyRequestsResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /auth/logout
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/logout',
    tags: ['Auth'],
    summary: 'Logout',
    description: "Revokes the user's current session. Requires a valid access token.",
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Logged out successfully',
        content: { 'application/json': { schema: EmptySuccessResponseSchema } },
      },
      unauthorizedResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /auth/access
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/auth/access',
    tags: ['Auth'],
    summary: 'Refresh access token',
    description:
      'Generates a new access token using a valid refresh token in the Authorization header.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Access token generated',
        content: { 'application/json': { schema: AccessTokenResponseSchema } },
      },
      unauthorizedResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /auth/review-status
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/auth/review-status',
    tags: ['Auth'],
    summary: 'Check review / approval status',
    description:
      'Returns whether the authenticated user (worker) has been approved by an admin. Requires access token.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Approval status returned',
        content: { 'application/json': { schema: ReviewStatusResponseSchema } },
      },
      unauthorizedResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /auth/fcm-token
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/auth/fcm-token',
    tags: ['Auth'],
    summary: 'Update FCM token',
    description:
      'Updates the Firebase Cloud Messaging token for the current user session. This token is used to send push notifications to the device.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              fcmToken: z.string().min(1).openapi({
                description: 'Firebase Cloud Messaging token for push notifications',
                example: 'eA1B2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4',
              }),
            }),
          },
        },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'FCM token updated successfully',
        content: { 'application/json': { schema: EmptySuccessResponseSchema } },
      },
      badRequestResponse: true,
      validationErrorResponse: true,
      unauthorizedResponse: true,
      internalServerError: true,
    }),
  });
}
