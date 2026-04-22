import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  CreateLocationSchema,
  UpdateLocationSchema,
  LocationIdParamsSchema,
  LocationQuerySchema,
} from '../../../schemas/location.js';
import {
  LocationResponseSchema,
  LocationListResponseSchema,
  MessageOnlyResponseSchema,
} from '../../../schemas/responses.js';
import { createResponseDoc } from '../../../docs/common.js';

export default function registerLocationsDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/locations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/locations',
    tags: ['Locations'],
    summary: 'Get all my locations',
    description: 'Returns a list of all locations belonging to the authenticated user.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: LocationQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Locations retrieved',
        content: { 'application/json': { schema: LocationListResponseSchema } },
      },
      unauthorizedResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /me/locations
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/me/locations',
    tags: ['Locations'],
    summary: 'Add a new location',
    description: 'Adds a new location for the authenticated user.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: { 'application/json': { schema: CreateLocationSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Location created',
        content: { 'application/json': { schema: LocationResponseSchema } },
      },
      unauthorizedResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/locations/main
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/locations/main',
    tags: ['Locations'],
    summary: 'Get main location',
    description: 'Returns the main location for the authenticated user.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Main location retrieved',
        content: { 'application/json': { schema: LocationResponseSchema } },
      },
      unauthorizedResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /me/locations/main
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'put',
    path: '/api/v1/me/locations/main',
    tags: ['Locations'],
    summary: 'Update main location',
    description: 'Updates the main location for the authenticated user.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      body: {
        content: { 'application/json': { schema: UpdateLocationSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Main location updated',
        content: { 'application/json': { schema: LocationResponseSchema } },
      },
      unauthorizedResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /me/locations/{locationId}
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/me/locations/{locationId}',
    tags: ['Locations'],
    summary: 'Get location by ID',
    description: 'Returns a single location by its UUID.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: LocationIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Location retrieved',
        content: { 'application/json': { schema: LocationResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /me/locations/{locationId}
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'put',
    path: '/api/v1/me/locations/{locationId}',
    tags: ['Locations'],
    summary: 'Update location by ID',
    description: 'Updates an existing location by its UUID.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: LocationIdParamsSchema,
      body: {
        content: { 'application/json': { schema: UpdateLocationSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Location updated',
        content: { 'application/json': { schema: LocationResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /me/locations/{locationId}
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/me/locations/{locationId}',
    tags: ['Locations'],
    summary: 'Delete location',
    description: 'Deletes a location by its UUID.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: LocationIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Location deleted',
        content: { 'application/json': { schema: MessageOnlyResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });
}
