import { Router } from 'express';
import {
  getUser,
  updateUser,
  getWorkerProfile,
  createWorkerProfile,
  updateWorkerProfile,
  getWorkerGovernments,
  addWorkerGovernments,
  deleteWorkerGovernments,
  getWorkerSpecializations,
  getWorkerWorkingHours,
  addDaysWorkerWorkingHours,
  removeWorkerWorkingHours,
  addWorkerSpecializations,
  deleteWorkerSpecializations,
  getClientProfile,
  createClientProfile,
  updateClientProfile,
  getWorkerSpecializationsTree,
  getVerification,
  resubmitVerification,
  createPortfolio,
  getPortfolio,
  updatePortfolio,
  addPortfolioImages,
  deletePortfolioImage,
  getWorkerOccupiedTimeSlots,
  getWorkerOrdersCount,
} from '../../controllers/DashboardController.js';
import { authorizeClient, unAuthorizeClient, authorizeApprovedWorker, authorizeWorker, unAuthorizeWorker } from '../../middlewares/accessMiddleware.js';
import upload from '../../configs/multer.js';

// Import validators
import {
  UpdateUserSchema,
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
  AddDaysWorkingHoursSchema,
  RemoveDaysWorkingHoursSchema,
} from '../../schemas/requests/dashboard.request.js';
import {
  CreatePortfolioSchema,
  UpdatePortfolioSchema,
  PortfolioImageIdParamsSchema,
  OccupiedTimeSlotsQuerySchema,
  CreateWorkerProfileSchema,
  UpdateWorkerProfileSchema,
} from '../../schemas/requests/worker-profile.request.js';
import { isActive } from '../../middlewares/authMiddleware.js';
import { createRoute } from '../../types/asyncHandler.js';

import locationRouter from './locations.js';
import { parseFormDataJson } from 'src/middlewares/multiformParserMiddleware.js';

const usersRouter = Router();

usersRouter.use('/locations', locationRouter);

usersRouter.get('/', isActive, createRoute({ schemas: {}, handler: getUser }));

usersRouter.put(
  '/',
  upload.single('personal_image'),
  isActive,
  createRoute({
    schemas: { body: UpdateUserSchema },
    handler: updateUser,
  })
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
  parseFormDataJson('workerProfile'),
  createRoute({
    schemas: { body: CreateWorkerProfileSchema },
    handler: createWorkerProfile,
  })
);

usersRouter.get('/worker-profile/verification', isActive, authorizeWorker, createRoute({ schemas: {}, handler: getVerification }));
usersRouter.put(
  '/worker-profile/verification',
  isActive,
  authorizeApprovedWorker,
  upload.fields([
    { name: 'id_image', maxCount: 1 },
    { name: 'personal_with_id_image', maxCount: 1 },
  ]),
  createRoute({ schemas: {}, handler: resubmitVerification })
);

usersRouter.post(
  '/worker-profile/portfolio',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { body: CreatePortfolioSchema },
    handler: createPortfolio,
  })
);

usersRouter.get('/worker-profile/portfolio', isActive, authorizeApprovedWorker, createRoute({ schemas: {}, handler: getPortfolio }));

usersRouter.put(
  '/worker-profile/portfolio',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { body: UpdatePortfolioSchema },
    handler: updatePortfolio,
  })
);

usersRouter.post(
  '/worker-profile/portfolio/images',
  isActive,
  authorizeApprovedWorker,
  upload.array('images', 10),
  createRoute({ schemas: {}, handler: addPortfolioImages })
);

usersRouter.delete(
  '/worker-profile/portfolio/images/:imageId',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { params: PortfolioImageIdParamsSchema },
    handler: deletePortfolioImage,
  })
);

usersRouter.get(
  '/worker-profile/occupied-time-slots',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { query: OccupiedTimeSlotsQuerySchema },
    handler: getWorkerOccupiedTimeSlots,
  })
);

usersRouter.get('/worker-profile', isActive, authorizeApprovedWorker, createRoute({ schemas: {}, handler: getWorkerProfile }));
usersRouter.get('/worker-profile/orders-count', isActive, authorizeApprovedWorker, createRoute({ schemas: {}, handler: getWorkerOrdersCount }));
usersRouter.get('/worker-profile/working-hours', isActive, authorizeApprovedWorker, createRoute({ schemas: {}, handler: getWorkerWorkingHours }));
usersRouter.post(
  '/worker-profile/working-hours',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { body: AddDaysWorkingHoursSchema },
    handler: addDaysWorkerWorkingHours,
  })
);
usersRouter.delete(
  '/worker-profile/working-hours',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { body: RemoveDaysWorkingHoursSchema },
    handler: removeWorkerWorkingHours,
  })
);

usersRouter.put(
  '/worker-profile',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { body: UpdateWorkerProfileSchema },
    handler: updateWorkerProfile,
  })
);

usersRouter.get(
  '/worker-profile/work-governments',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { query: WorkerGovernmentQuerySchema },
    handler: getWorkerGovernments,
  })
);

usersRouter.post(
  '/worker-profile/work-governments',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { body: AddWorkerGovernmentsSchema },
    handler: addWorkerGovernments,
  })
);

usersRouter.delete(
  '/worker-profile/work-governments',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { query: DeleteWorkerGovernmentsQuerySchema, body: DeleteWorkerGovernmentsSchema },
    handler: deleteWorkerGovernments,
  })
);

usersRouter.get(
  '/worker-profile/specializations/tree',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { query: WorkerSpecializationQuerySchema },
    handler: getWorkerSpecializationsTree,
  })
);

usersRouter.get(
  '/worker-profile/specializations',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { query: WorkerSpecializationQuerySchema },
    handler: getWorkerSpecializations,
  })
);

usersRouter.post(
  '/worker-profile/specializations',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { body: AddWorkerSpecializationsSchema },
    handler: addWorkerSpecializations,
  })
);

usersRouter.delete(
  '/worker-profile/specializations',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: { query: DeleteWorkerSpecializationsQuerySchema, body: DeleteWorkerSpecializationsSchema },
    handler: deleteWorkerSpecializations,
  })
);

usersRouter.post(
  '/client-profile',
  isActive,
  unAuthorizeClient,
  parseFormDataJson('clientProfile'),
  createRoute({
    schemas: { body: CreateClientProfileSchema },
    handler: createClientProfile,
  })
);


usersRouter.get('/client-profile', isActive, authorizeClient, createRoute({ schemas: {}, handler: getClientProfile }));

usersRouter.put(
  '/client-profile',
  isActive,
  authorizeClient,
  createRoute({
    schemas: { body: UpdateClientProfileSchema },
    handler: updateClientProfile,
  })
);

export default usersRouter;
