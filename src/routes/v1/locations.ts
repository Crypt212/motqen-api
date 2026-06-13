import { Router } from 'express';
import { locationController } from '../../state.js';
import { createRoute } from '../../types/asyncHandler.js';
import {
  GetLocationsRequestSchema,
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
  SetMainLocationRequestSchema,
  SetMainLocationQuerySchema,
  SetMainLocationParamsSchema,
  GetLocationByIdRequestSchema,
  GetLocationByIdQuerySchema,
  GetLocationByIdParamsSchema,
  DeleteLocationRequestSchema,
  DeleteLocationQuerySchema,
  DeleteLocationParamsSchema,
} from '../../schemas/requests/location.request.js';

const router = Router();

router.get(
  '/',
  createRoute({
    schemas: { 
      body: GetLocationsRequestSchema,
      query: GetLocationsQuerySchema,
      params: GetLocationsParamsSchema,
    },
    handler: locationController.list,
  })
);

router.post(
  '/',
  createRoute({
    schemas: { 
      body: CreateLocationRequestSchema,
      query: CreateLocationQuerySchema,
      params: CreateLocationParamsSchema,
    },
    handler: locationController.create,
  })
);

router.get(
  '/main',
  createRoute({
    schemas: { 
      body: GetMainLocationRequestSchema,
      query: GetMainLocationQuerySchema,
      params: GetMainLocationParamsSchema,
    },
    handler: locationController.getMain,
  })
);

router.put(
  '/main',
  createRoute({
    schemas: { 
      body: UpdateMainLocationRequestSchema,
      query: UpdateMainLocationQuerySchema,
      params: UpdateMainLocationParamsSchema,
    },
    handler: locationController.updateMain,
  })
);

router.put(
  '/:locationId',
  createRoute({
    schemas: { 
      body: UpdateLocationRequestSchema,
      query: UpdateLocationQuerySchema,
      params: UpdateLocationParamsSchema,
    },
    handler: locationController.update,
  })
);

router.patch(
  '/:locationId/set-main',
  createRoute({
    schemas: { 
      body: SetMainLocationRequestSchema,
      query: SetMainLocationQuerySchema,
      params: SetMainLocationParamsSchema,
    },
    handler: locationController.setMain,
  })
);

router.get(
  '/:locationId',
  createRoute({
    schemas: { 
      body: GetLocationByIdRequestSchema,
      query: GetLocationByIdQuerySchema,
      params: GetLocationByIdParamsSchema,
    },
    handler: locationController.getById,
  })
);

router.delete(
  '/:locationId',
  createRoute({
    schemas: { 
      body: DeleteLocationRequestSchema,
      query: DeleteLocationQuerySchema,
      params: DeleteLocationParamsSchema,
    },
    handler: locationController.delete,
  })
);

export default router;
