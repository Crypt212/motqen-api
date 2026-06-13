import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  GetLocationsQuerySchema,
  GetLocationsParamsSchema,
  CreateLocationRequestSchema,
  CreateLocationQuerySchema,
  CreateLocationParamsSchema,
  GetMainLocationRequestSchema,
  GetMainLocationQuerySchema,
  GetMainLocationParamsSchema,
  UpdateMainLocationRequestSchema,
  UpdateMainLocationQuerySchema,
  UpdateMainLocationParamsSchema,
  UpdateLocationRequestSchema,
  UpdateLocationQuerySchema,
  UpdateLocationParamsSchema,
  SetMainLocationQuerySchema,
  SetMainLocationParamsSchema,
  GetLocationByIdQuerySchema,
  GetLocationByIdParamsSchema,
  DeleteLocationQuerySchema,
  DeleteLocationParamsSchema,
} from '../../../schemas/requests/location.request.js';
import { MessageOnlyResponseSchema } from '../../../schemas/responses.js';
import {
  GetLocationsResponseSchema,
  CreateLocationResponseSchema,
  GetMainLocationResponseSchema,
  UpdateMainLocationResponseSchema,
  UpdateLocationResponseSchema,
  SetMainLocationResponseSchema,
  GetLocationByIdResponseSchema,
  DeleteLocationResponseSchema,
} from '../../../schemas/responses/location.response.js';
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
      query: GetLocationsQuerySchema,
      params: GetLocationsParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Locations retrieved',
        content: { 'application/json': { schema: GetLocationsResponseSchema } },
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
      query: CreateLocationQuerySchema,
      params: CreateLocationParamsSchema,
      body: {
        content: { 'application/json': { schema: CreateLocationRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Location created',
        content: { 'application/json': { schema: CreateLocationResponseSchema } },
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
    request: {
      query: GetMainLocationQuerySchema,
      params: GetMainLocationParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Main location retrieved',
        content: { 'application/json': { schema: GetMainLocationResponseSchema } },
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
      query: UpdateMainLocationQuerySchema,
      params: UpdateMainLocationParamsSchema,
      body: {
        content: { 'application/json': { schema: UpdateMainLocationRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Main location updated',
        content: { 'application/json': { schema: UpdateMainLocationResponseSchema } },
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
      query: GetLocationByIdQuerySchema,
      params: GetLocationByIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Location retrieved',
        content: { 'application/json': { schema: GetLocationByIdResponseSchema } },
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
      query: UpdateLocationQuerySchema,
      params: UpdateLocationParamsSchema,
      body: {
        content: { 'application/json': { schema: UpdateLocationRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Location updated',
        content: { 'application/json': { schema: UpdateLocationResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PATCH /me/locations/{locationId}/set-main
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/me/locations/{locationId}/set-main',
    tags: ['Locations'],
    summary: 'Set location to be main by ID',
    description: 'Sets an existing location to be main by its UUID.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: SetMainLocationQuerySchema,
      params: SetMainLocationParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Location has been set as main successfully',
        content: { 'application/json': { schema: SetMainLocationResponseSchema } },
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
    summary: 'Delete location by ID',
    description: 'Deletes an existing location by its UUID.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: DeleteLocationQuerySchema,
      params: DeleteLocationParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Location deleted',
        content: { 'application/json': { schema: DeleteLocationResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });
}
