import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  RegisterClientSchema,
  RegisterWorkerSchema,
  RequestOTPSchema,
  VerifyOTPSchema,
} from '../../../schemas/auth.js';
import {
  RequestOTPResponseSchema,
  VerifyOTPResponseSchema,
  RegisterClientResponseSchema,
  RegisterWorkerResponseSchema,
  LoginResponseSchema,
  EmptySuccessResponseSchema,
  AccessTokenResponseSchema,
  ReviewStatusResponseSchema,
} from '../../../schemas/responses.js';
import { z } from '../../../libs/zod.js';

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
    request: {
      body: {
        content: { 'application/json': { schema: RequestOTPSchema } },
      },
    },
    responses: {
      200: {
        description: 'OTP sent successfully',
        content: { 'application/json': { schema: RequestOTPResponseSchema } },
      },
      400: { description: 'Bad Request' },
      422: { description: 'Validation Error' },
      429: { description: 'Too Many Requests' },
      500: { description: 'Internal Server Error' },
    },
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
    request: {
      body: {
        content: { 'application/json': { schema: VerifyOTPSchema } },
      },
    },
    responses: {
      200: {
        description: 'OTP verified successfully',
        content: { 'application/json': { schema: VerifyOTPResponseSchema } },
      },
      400: { description: 'Bad Request' },
      422: { description: 'Validation Error' },
      429: { description: 'Too Many Requests' },
      500: { description: 'Internal Server Error' },
    },
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
    responses: {
      200: {
        description: 'Client registered successfully',
        content: { 'application/json': { schema: RegisterClientResponseSchema } },
      },
      400: { description: 'Bad Request' },
      401: { description: 'Unauthorized' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
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
    responses: {
      200: {
        description: 'Worker registered successfully',
        content: { 'application/json': { schema: RegisterWorkerResponseSchema } },
      },
      400: { description: 'Bad Request' },
      401: { description: 'Unauthorized' },
      422: { description: 'Validation Error' },
      500: { description: 'Internal Server Error' },
    },
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
    responses: {
      200: {
        description: 'Login successful',
        content: { 'application/json': { schema: LoginResponseSchema } },
      },
      400: { description: 'Bad Request' },
      401: { description: 'Unauthorized' },
      500: { description: 'Internal Server Error' },
    },
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
    responses: {
      200: {
        description: 'Logged out successfully',
        content: { 'application/json': { schema: EmptySuccessResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      500: { description: 'Internal Server Error' },
    },
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
    responses: {
      200: {
        description: 'Access token generated',
        content: { 'application/json': { schema: AccessTokenResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      500: { description: 'Internal Server Error' },
    },
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
    responses: {
      200: {
        description: 'Approval status returned',
        content: { 'application/json': { schema: ReviewStatusResponseSchema } },
      },
      401: { description: 'Unauthorized' },
      500: { description: 'Internal Server Error' },
    },
  });
}
