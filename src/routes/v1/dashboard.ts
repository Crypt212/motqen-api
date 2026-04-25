import { Router } from 'express';
import {
  getUser,
  updateUser,
  getWorkerProfile,
  createWorkerProfile,
  updateWorkerProfile,
  deleteWorkerProfile,
  getWorkerGovernments,
  addWorkerGovernments,
  deleteWorkerGovernments,
  getWorkerSpecializations,
  getWorkerWorkingHours,
  setWorkerWorkingHours,
  addWorkerSpecializations,
  deleteWorkerSpecializations,
  getClientProfile,
  createClientProfile,
  updateClientProfile,
  deleteClientProfile,
  getWorkerSpecializationsTree,
} from '../../controllers/DashboardController.js';
import { authorizeWorker, unAuthorizeWorker } from '../../middlewares/workerMiddleware.js';
import { authorizeClient, unAuthorizeClient } from '../../middlewares/clientMiddleware.js';
import upload from '../../configs/multer.js';

// Import validators
import {
  UpdateUserSchema,
  CreateWorkerProfileSchema,
  UpdateWorkerProfileSchema,
  DeleteWorkerGovernmentsQuerySchema,
  AddWorkerGovernmentsSchema,
  DeleteWorkerGovernmentsSchema,
  AddWorkerSpecializationsSchema,
  DeleteWorkerSpecializationsSchema,
  DeleteWorkerSpecializationsQuerySchema,
  CreateClientProfileSchema,
  UpdateClientProfileSchema,
  WorkerGovernmentQuerySchema,
  WorkerSpecializationQuerySchema,
  SetWorkingHoursSchema,
} from '../../schemas/dashboard.js';
import { isActive } from '../../middlewares/authMiddleware.js';
import { validateBody, validateQuery } from '../../middlewares/validateRequest.js';

import locationRouter from './locations.js';

const usersRouter = Router();

usersRouter.use('/locations', locationRouter);

usersRouter.get('/', isActive, getUser);

usersRouter.put(
  '/',
  upload.single('personal_image'),
  isActive,
  validateBody(UpdateUserSchema),
  updateUser
);

usersRouter.post(
  '/worker-profile',
  isActive,
  unAuthorizeWorker,
  upload.fields([
    { name: 'personal_image', maxCount: 1 },
    { name: 'id_image', maxCount: 1 },
    { name: 'personal_with_id_image', maxCount: 1 },
  ]),
  validateBody(CreateWorkerProfileSchema),
  createWorkerProfile
);

usersRouter.get('/worker-profile', isActive, authorizeWorker, getWorkerProfile);
usersRouter.get('/worker-profile/working-hours', isActive, authorizeWorker, getWorkerWorkingHours);
usersRouter.post(
  '/worker-profile/working-hours',
  isActive,
  authorizeWorker,
  validateBody(SetWorkingHoursSchema),
  setWorkerWorkingHours
);

usersRouter.put(
  '/worker-profile',
  isActive,
  authorizeWorker,
  validateBody(UpdateWorkerProfileSchema),
  updateWorkerProfile
);

usersRouter.delete(
  '/worker-profile',
  isActive,
  authorizeWorker,
  authorizeClient,
  deleteWorkerProfile
);

usersRouter.get(
  '/worker-profile/work-governments',
  isActive,
  authorizeWorker,
  validateQuery(WorkerGovernmentQuerySchema),
  getWorkerGovernments
);

usersRouter.post(
  '/worker-profile/work-governments',
  isActive,
  authorizeWorker,
  validateBody(AddWorkerGovernmentsSchema),
  addWorkerGovernments
);

usersRouter.delete(
  '/worker-profile/work-governments',
  isActive,
  authorizeWorker,
  validateQuery(DeleteWorkerGovernmentsQuerySchema),
  validateBody(DeleteWorkerGovernmentsSchema),
  deleteWorkerGovernments
);

usersRouter.get(
  '/worker-profile/specializations/tree',
  isActive,
  authorizeWorker,
  validateQuery(WorkerSpecializationQuerySchema),
  getWorkerSpecializationsTree
);

usersRouter.get(
  '/worker-profile/specializations',
  isActive,
  authorizeWorker,
  validateQuery(WorkerSpecializationQuerySchema),
  getWorkerSpecializations
);

usersRouter.post(
  '/worker-profile/specializations',
  isActive,
  authorizeWorker,
  validateBody(AddWorkerSpecializationsSchema),
  addWorkerSpecializations
);

usersRouter.delete(
  '/worker-profile/specializations',
  isActive,
  authorizeWorker,
  validateQuery(DeleteWorkerSpecializationsQuerySchema),
  validateBody(DeleteWorkerSpecializationsSchema),
  deleteWorkerSpecializations
);

usersRouter.post(
  '/client-profile',
  isActive,
  unAuthorizeClient,
  validateBody(CreateClientProfileSchema),
  createClientProfile
);

usersRouter.get('/client-profile', isActive, authorizeClient, getClientProfile);

usersRouter.put(
  '/client-profile',
  isActive,
  authorizeClient,
  validateBody(UpdateClientProfileSchema),
  updateClientProfile
);

usersRouter.delete(
  '/client-profile',
  isActive,
  authorizeWorker,
  authorizeClient,
  deleteClientProfile
);

export default usersRouter;
