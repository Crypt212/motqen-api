/**
 * @fileoverview Government Routes - Government management endpoints
 * @module routes/governments
 */

import { Router } from 'express';
import { governmentController } from '../../state.js';
import { isActive } from '../../middlewares/authMiddleware.js';
import { createRoute } from '../../types/asyncHandler.js';
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
} from '../../schemas/requests/government.request.js';
import { authorizeAdmin } from 'src/middlewares/accessMiddleware.js';

const governmentRouter = Router();

governmentRouter.get(
  '/',
  createRoute({
    schemas: {
      body: GetGovernmentsRequestSchema,
      query: GetGovernmentsQuerySchema,
      params: GetGovernmentsParamsSchema,
    },
    handler: governmentController.getGovernments,
  })
);

governmentRouter.get(
  '/:governmentId',
  createRoute({
    schemas: {
      body: GetGovernmentByIdRequestSchema,
      query: GetGovernmentByIdQuerySchema,
      params: GetGovernmentByIdParamsSchema,
    },
    handler: governmentController.getGovernmentById,
  })
);

governmentRouter.post(
  '/',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: {
      body: CreateGovernmentRequestSchema,
      query: CreateGovernmentQuerySchema,
      params: CreateGovernmentParamsSchema,
    },
    handler: governmentController.createGovernment,
  })
);

governmentRouter.put(
  '/:governmentId',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: {
      body: UpdateGovernmentRequestSchema,
      query: UpdateGovernmentQuerySchema,
      params: UpdateGovernmentParamsSchema,
    },
    handler: governmentController.updateGovernment,
  })
);

governmentRouter.delete(
  '/:governmentId',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: {
      body: DeleteGovernmentRequestSchema,
      query: DeleteGovernmentQuerySchema,
      params: DeleteGovernmentParamsSchema,
    },
    handler: governmentController.deleteGovernment,
  })
);

governmentRouter.get(
  '/:governmentId/cities',
  createRoute({
    schemas: {
      body: GetCitiesByGovernmentRequestSchema,
      query: GetCitiesByGovernmentQuerySchema,
      params: GetCitiesByGovernmentParamsSchema,
    },
    handler: governmentController.getCitiesByGovernment,
  })
);

governmentRouter.get(
  '/cities/:cityId',
  createRoute({
    schemas: {
      body: GetCityByIdRequestSchema,
      query: GetCityByIdQuerySchema,
      params: GetCityByIdParamsSchema,
    },
    handler: governmentController.getCityById,
  })
);

governmentRouter.post(
  '/:governmentId/cities',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: {
      body: CreateCityRequestSchema,
      query: CreateCityQuerySchema,
      params: CreateCityParamsSchema,
    },
    handler: governmentController.createCity,
  })
);

governmentRouter.put(
  '/cities/:cityId',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: {
      body: UpdateCityRequestSchema,
      query: UpdateCityQuerySchema,
      params: UpdateCityParamsSchema,
    },
    handler: governmentController.updateCity,
  })
);

governmentRouter.delete(
  '/cities/:cityId',
  isActive,
  authorizeAdmin,
  createRoute({
    schemas: {
      body: DeleteCityRequestSchema,
      query: DeleteCityQuerySchema,
      params: DeleteCityParamsSchema,
    },
    handler: governmentController.deleteCity,
  })
);

export default governmentRouter;
