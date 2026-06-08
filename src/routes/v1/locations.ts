import { Router } from 'express';
import { locationController } from '../../state.js';
import { createRoute } from '../../types/asyncHandler.js';
import {
  LocationQuerySchema,
  CreateLocationSchema,
  LocationIdParamsSchema,
  UpdateLocationSchema,
} from '../../schemas/requests/location.request.js';

const router = Router();

router.get(
  '/',
  createRoute({
    schemas: { query: LocationQuerySchema },
    handler: locationController.list,
  })
);

router.post(
  '/',
  createRoute({
    schemas: { body: CreateLocationSchema },
    handler: locationController.create,
  })
);

router.get(
  '/main',
  createRoute({
    schemas: {},
    handler: locationController.getMain,
  })
);

router.put(
  '/main',
  createRoute({
    schemas: { body: UpdateLocationSchema },
    handler: locationController.updateMain,
  })
);

router.put(
  '/:locationId',
  createRoute({
    schemas: { params: LocationIdParamsSchema, body: UpdateLocationSchema },
    handler: locationController.update,
  })
);

router.patch(
  '/:locationId/set-main',
  createRoute({
    schemas: { params: LocationIdParamsSchema },
    handler: locationController.setMain,
  })
);

router.get(
  '/:locationId',
  createRoute({
    schemas: { params: LocationIdParamsSchema },
    handler: locationController.getById,
  })
);

export default router;
