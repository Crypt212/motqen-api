import { Router } from 'express';
import { locationController } from '../../state.js';
import { validateQuery, validateBody, validateParams } from '../../middlewares/validateRequest.js';
import {
  LocationQuerySchema,
  CreateLocationSchema,
  LocationIdParamsSchema,
  UpdateLocationSchema,
} from '../../schemas/location.js';

const router = Router();

router.get('/', validateQuery(LocationQuerySchema), locationController.list);
router.post('/', validateBody(CreateLocationSchema), locationController.create);
router.get('/main', locationController.getMain);
router.put('/main', validateBody(UpdateLocationSchema), locationController.updateMain);
router.put(
  '/:locationId',
  validateParams(LocationIdParamsSchema),
  validateBody(UpdateLocationSchema),
  locationController.update
);
router.get('/:locationId', validateParams(LocationIdParamsSchema), locationController.getById);
router.delete('/:locationId', validateParams(LocationIdParamsSchema), locationController.remove);

export default router;
