import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  GetGovernmentsRequestSchema,
  GetGovernmentsQuerySchema,
  GetGovernmentsParamsSchema,
  GetGovernmentByIdRequestSchema,
  GetGovernmentByIdQuerySchema,
  GetGovernmentByIdParamsSchema,
  CreateGovernmentRequestSchema,
  CreateGovernmentQuerySchema,
  CreateGovernmentParamsSchema,
  UpdateGovernmentRequestSchema,
  UpdateGovernmentQuerySchema,
  UpdateGovernmentParamsSchema,
  DeleteGovernmentRequestSchema,
  DeleteGovernmentQuerySchema,
  DeleteGovernmentParamsSchema,
  GetCitiesByGovernmentRequestSchema,
  GetCitiesByGovernmentQuerySchema,
  GetCitiesByGovernmentParamsSchema,
  GetCityByIdRequestSchema,
  GetCityByIdQuerySchema,
  GetCityByIdParamsSchema,
  CreateCityRequestSchema,
  CreateCityQuerySchema,
  CreateCityParamsSchema,
  UpdateCityRequestSchema,
  UpdateCityQuerySchema,
  UpdateCityParamsSchema,
  DeleteCityRequestSchema,
  DeleteCityQuerySchema,
  DeleteCityParamsSchema,
} from '../../../schemas/requests/government.request.js';
import {
  GetGovernmentsResponseSchema,
  GetGovernmentByIdResponseSchema,
  CreateGovernmentResponseSchema,
  UpdateGovernmentResponseSchema,
  DeleteGovernmentResponseSchema,
  GetCitiesByGovernmentResponseSchema,
  GetCityByIdResponseSchema,
  CreateCityResponseSchema,
  UpdateCityResponseSchema,
  DeleteCityResponseSchema,
} from '../../../schemas/responses/government.response.js';
import { createResponseDoc } from '../../../docs/common.js';

export default function registerGovernmentsDocs(registry: OpenAPIRegistry) {
  // ─────────────────────────────────────────────────────────────────────────────
  // GET /governments
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/governments',
    tags: ['Governments'],
    summary: 'Get all governments',
    description: 'Returns a list of all governments. Public endpoint.',
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: GetGovernmentsQuerySchema,
      params: GetGovernmentsParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Governments retrieved',
        content: { 'application/json': { schema: GetGovernmentsResponseSchema } },
      },
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /governments/:governmentId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/governments/{governmentId}',
    tags: ['Governments'],
    summary: 'Get government by ID',
    description: 'Returns a single government by its UUID. Public endpoint.',
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: GetGovernmentByIdQuerySchema,
      params: GetGovernmentByIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Government retrieved',
        content: { 'application/json': { schema: GetGovernmentByIdResponseSchema } },
      },
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /governments
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/governments',
    tags: ['Governments'],
    summary: 'Create government (Admin)',
    description: 'Creates a new government. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: CreateGovernmentQuerySchema,
      params: CreateGovernmentParamsSchema,
      body: {
        content: { 'application/json': { schema: CreateGovernmentRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Government created',
        content: { 'application/json': { schema: CreateGovernmentResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /governments/:governmentId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'put',
    path: '/api/v1/governments/{governmentId}',
    tags: ['Governments'],
    summary: 'Update government (Admin)',
    description: 'Updates an existing government by UUID. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: UpdateGovernmentQuerySchema,
      params: UpdateGovernmentParamsSchema,
      body: {
        content: { 'application/json': { schema: UpdateGovernmentRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Government updated',
        content: { 'application/json': { schema: UpdateGovernmentResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /governments/:governmentId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/governments/{governmentId}',
    tags: ['Governments'],
    summary: 'Delete government (Admin)',
    description: 'Deletes a government by UUID. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: DeleteGovernmentQuerySchema,
      params: DeleteGovernmentParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Government deleted',
        content: { 'application/json': { schema: DeleteGovernmentResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /governments/:governmentId/cities
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/governments/{governmentId}/cities',
    tags: ['Governments'],
    summary: 'Get cities by government',
    description: 'Returns all cities under a specific government.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      params: GetCitiesByGovernmentParamsSchema,
      query: GetCitiesByGovernmentQuerySchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'Cities retrieved',
        content: { 'application/json': { schema: GetCitiesByGovernmentResponseSchema } },
      },
      unauthorizedResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /governments/cities/:cityId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'get',
    path: '/api/v1/governments/cities/{cityId}',
    tags: ['Governments', 'Cities'],
    summary: 'Get city by ID',
    description: 'Returns a single city by its UUID.',
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: GetCityByIdQuerySchema,
      params: GetCityByIdParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'City retrieved',
        content: { 'application/json': { schema: GetCityByIdResponseSchema } },
      },
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /governments/:governmentId/cities
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'post',
    path: '/api/v1/governments/{governmentId}/cities',
    tags: ['Governments', 'Cities'],
    summary: 'Create city (Admin)',
    description: 'Creates a new city under a specific government. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: CreateCityQuerySchema,
      params: CreateCityParamsSchema,
      body: {
        content: { 'application/json': { schema: CreateCityRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'City created',
        content: { 'application/json': { schema: CreateCityResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /governments/cities/:cityId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'put',
    path: '/api/v1/governments/cities/{cityId}',
    tags: ['Governments', 'Cities'],
    summary: 'Update city (Admin)',
    description: 'Updates an existing city by UUID. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: UpdateCityQuerySchema,
      params: UpdateCityParamsSchema,
      body: {
        content: { 'application/json': { schema: UpdateCityRequestSchema } },
      },
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'City updated',
        content: { 'application/json': { schema: UpdateCityResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      validationErrorResponse: true,
      internalServerError: true,
    }),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /governments/cities/:cityId
  // ─────────────────────────────────────────────────────────────────────────────

  registry.registerPath({
    method: 'delete',
    path: '/api/v1/governments/cities/{cityId}',
    tags: ['Governments', 'Cities'],
    summary: 'Delete city (Admin)',
    description: 'Deletes a city by UUID. Requires admin access token.',
    security: [{ BearerAuth: [] }],
    parameters: [{ $ref: '#/components/parameters/DeviceFingerprint' }],
    request: {
      query: DeleteCityQuerySchema,
      params: DeleteCityParamsSchema,
    },
    responses: createResponseDoc({
      successfulResponse: {
        description: 'City deleted',
        content: { 'application/json': { schema: DeleteCityResponseSchema } },
      },
      unauthorizedResponse: true,
      forbiddenResponse: true,
      notFoundResponse: true,
      internalServerError: true,
    }),
  });
}
