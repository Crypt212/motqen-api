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
import { validateBody, validateParams, validateQuery } from '../../middlewares/validateRequest.js';

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

usersRouter.get('/worker-profile/verification', isActive, authorizeWorker, getVerification);
usersRouter.put(
  '/worker-profile/verification',
  isActive,
  authorizeApprovedWorker,
  upload.fields([
    { name: 'id_image', maxCount: 1 },
    { name: 'personal_with_id_image', maxCount: 1 },
  ]),
  resubmitVerification
);

usersRouter.post(
  '/worker-profile/portfolio',
  isActive,
  authorizeApprovedWorker,
  validateBody(CreatePortfolioSchema),
  createPortfolio
);

usersRouter.get('/worker-profile/portfolio', isActive, authorizeApprovedWorker, getPortfolio);

usersRouter.put(
  '/worker-profile/portfolio',
  isActive,
  authorizeApprovedWorker,
  validateBody(UpdatePortfolioSchema),
  updatePortfolio
);

usersRouter.post(
  '/worker-profile/portfolio/images',
  isActive,
  authorizeApprovedWorker,
  upload.array('images', 10),
  addPortfolioImages
);

usersRouter.delete(
  '/worker-profile/portfolio/images/:imageId',
  isActive,
  authorizeApprovedWorker,
  validateParams(PortfolioImageIdParamsSchema),
  deletePortfolioImage
);

usersRouter.get(
  '/worker-profile/occupied-time-slots',
  isActive,
  authorizeApprovedWorker,
  validateQuery(OccupiedTimeSlotsQuerySchema),
  getWorkerOccupiedTimeSlots
);

usersRouter.get('/worker-profile', isActive, authorizeApprovedWorker, getWorkerProfile);
usersRouter.get('/worker-profile/orders-count', isActive, authorizeApprovedWorker, getWorkerOrdersCount);
usersRouter.get('/worker-profile/working-hours', isActive, authorizeApprovedWorker, getWorkerWorkingHours);
usersRouter.post(
  '/worker-profile/working-hours',
  isActive,
  authorizeApprovedWorker,
  validateBody(AddDaysWorkingHoursSchema),
  addDaysWorkerWorkingHours
);
usersRouter.delete(
  '/worker-profile/working-hours',
  isActive,
  authorizeApprovedWorker,
  validateBody(RemoveDaysWorkingHoursSchema),
  removeWorkerWorkingHours
);

usersRouter.put(
  '/worker-profile',
  isActive,
  authorizeApprovedWorker,
  validateBody(UpdateWorkerProfileSchema),
  updateWorkerProfile
);

usersRouter.get(
  '/worker-profile/work-governments',
  isActive,
  authorizeApprovedWorker,
  validateQuery(WorkerGovernmentQuerySchema),
  getWorkerGovernments
);

usersRouter.post(
  '/worker-profile/work-governments',
  isActive,
  authorizeApprovedWorker,
  validateBody(AddWorkerGovernmentsSchema),
  addWorkerGovernments
);

usersRouter.delete(
  '/worker-profile/work-governments',
  isActive,
  authorizeApprovedWorker,
  validateQuery(DeleteWorkerGovernmentsQuerySchema),
  validateBody(DeleteWorkerGovernmentsSchema),
  deleteWorkerGovernments
);

usersRouter.get(
  '/worker-profile/specializations/tree',
  isActive,
  authorizeApprovedWorker,
  validateQuery(WorkerSpecializationQuerySchema),
  getWorkerSpecializationsTree
);

usersRouter.get(
  '/worker-profile/specializations',
  isActive,
  authorizeApprovedWorker,
  validateQuery(WorkerSpecializationQuerySchema),
  getWorkerSpecializations
);

usersRouter.post(
  '/worker-profile/specializations',
  isActive,
  authorizeApprovedWorker,
  validateBody(AddWorkerSpecializationsSchema),
  addWorkerSpecializations
);

usersRouter.delete(
  '/worker-profile/specializations',
  isActive,
  authorizeApprovedWorker,
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

export default usersRouter;
