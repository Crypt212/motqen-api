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
  addWorkerDaysWorkingHours,
  removeWorkerWorkingDays,
  addWorkerSpecializations,
  deleteWorkerSpecializations,
  getClientProfile,
  createClientProfile,
  getWorkerSpecializationsTree,
  getVerification,
  resubmitVerification,
  createPortfolio,
  getPortfolio,
  updatePortfolio,
  addPortfolioImages,
  deletePortfolioImage,
  getWorkerOccupiedTimeSlots,
  getWorkerOrdersStatistics,
} from '../../controllers/DashboardController.js';
import { authorizeClient,
unAuthorizeClient,
authorizeApprovedWorker,
authorizeWorker,
unAuthorizeWorker } from '../../middlewares/accessMiddleware.js';
import upload from '../../configs/multer.js';

// Import validators
import {
  GetUserRequestSchema,
  GetUserQuerySchema,
  GetUserParamsSchema,
  UpdateUserRequestSchema,
  UpdateUserQuerySchema,
  UpdateUserParamsSchema,
  GetVerificationRequestSchema,
  GetVerificationQuerySchema,
  GetVerificationParamsSchema,
  ResubmitVerificationRequestSchema,
  ResubmitVerificationQuerySchema,
  ResubmitVerificationParamsSchema,
  DeleteWorkerGovernmentsQuerySchema,
  AddWorkerGovernmentsRequestSchema,
  AddWorkerGovernmentsQuerySchema,
  AddWorkerGovernmentsParamsSchema,
  DeleteWorkerGovernmentsRequestSchema,
  DeleteWorkerGovernmentsParamsSchema,
  AddWorkerSpecializationsRequestSchema,
  AddWorkerSpecializationsQuerySchema,
  AddWorkerSpecializationsParamsSchema,
  DeleteWorkerSpecializationsRequestSchema,
  DeleteWorkerSpecializationsQuerySchema,
  DeleteWorkerSpecializationsParamsSchema,
  GetClientProfileRequestSchema,
  GetClientProfileQuerySchema,
  GetClientProfileParamsSchema,
  CreateClientProfileRequestSchema,
  CreateClientProfileQuerySchema,
  CreateClientProfileParamsSchema,
  CreateWorkerProfileQuerySchema,
  CreateWorkerProfileParamsSchema,
  CreatePortfolioRequestSchema,
  CreatePortfolioQuerySchema,
  CreatePortfolioParamsSchema,
  GetPortfolioRequestSchema,
  GetPortfolioQuerySchema,
  GetPortfolioParamsSchema,
  UpdatePortfolioRequestSchema,
  UpdatePortfolioQuerySchema,
  UpdatePortfolioParamsSchema,
  AddPortfolioImagesRequestSchema,
  AddPortfolioImagesQuerySchema,
  AddPortfolioImagesParamsSchema,
  DeletePortfolioImageRequestSchema,
  DeletePortfolioImageQuerySchema,
  DeletePortfolioImageParamsSchema,
  GetWorkerOccupiedTimeSlotsRequestSchema,
  GetWorkerOccupiedTimeSlotsQuerySchema,
  GetWorkerOccupiedTimeSlotsParamsSchema,
  GetWorkerProfileRequestSchema,
  GetWorkerProfileQuerySchema,
  GetWorkerProfileParamsSchema,
  GetWorkerOrdersStatisticsRequestSchema,
  GetWorkerOrdersStatisticsQuerySchema,
  GetWorkerOrdersStatisticsParamsSchema,
  // UpdateClientProfileSchema,
  GetWorkerGovernmentsQuerySchema,
  GetWorkerGovernmentsRequestSchema,
  GetWorkerGovernmentsParamsSchema,
  GetWorkerSpecializationsTreeRequestSchema,
  GetWorkerSpecializationsTreeQuerySchema,
  GetWorkerSpecializationsTreeParamsSchema,
  GetWorkerSpecializationsRequestSchema,
  GetWorkerSpecializationsQuerySchema,
  GetWorkerSpecializationsParamsSchema,
  AddWorkerDaysWorkingHoursRequestSchema,
  AddWorkerDaysWorkingHoursQuerySchema,
  AddWorkerDaysWorkingHoursParamsSchema,
  RemoveWorkerWorkingDaysRequestSchema,
  RemoveWorkerWorkingDaysQuerySchema,
  RemoveWorkerWorkingDaysParamsSchema,
  GetWorkerWorkingHoursRequestSchema,
  GetWorkerWorkingHoursQuerySchema,
  GetWorkerWorkingHoursParamsSchema,
  CreateWorkerProfileRequestSchema,
  UpdateWorkerProfileRequestSchema,
  UpdateWorkerProfileQuerySchema,
  UpdateWorkerProfileParamsSchema,
} from '../../schemas/requests/dashboard.request.js';
import { isActive } from '../../middlewares/authMiddleware.js';
import { createRoute } from '../../types/asyncHandler.js';

import locationRouter from './locations.js';
import { parseFormDataJson } from 'src/middlewares/multiformParserMiddleware.js';

const usersRouter = Router();

usersRouter.use('/locations', locationRouter);

usersRouter.get('/', isActive, createRoute({ schemas: {
    body: GetUserRequestSchema,
    query: GetUserQuerySchema,
    params: GetUserParamsSchema
}, handler: getUser }));

usersRouter.put(
  '/',
  upload.single('personal_image'),
  isActive,
  createRoute({
    schemas: {
        body: UpdateUserRequestSchema,
        query: UpdateUserQuerySchema,
        params: UpdateUserParamsSchema
    },
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
    schemas: {
        body: CreateWorkerProfileRequestSchema,
        query: CreateWorkerProfileQuerySchema,
        params: CreateWorkerProfileParamsSchema
    },
    handler: createWorkerProfile,
  })
);

usersRouter.get('/worker-profile/verification', isActive, authorizeWorker, createRoute({ schemas: {
    body: GetVerificationRequestSchema,
    query: GetVerificationQuerySchema,
    params: GetVerificationParamsSchema
}, handler: getVerification }));
usersRouter.put(
  '/worker-profile/verification',
  isActive,
  authorizeApprovedWorker,
  upload.fields([
    { name: 'id_image', maxCount: 1 },
    { name: 'personal_with_id_image', maxCount: 1 },
  ]),
  createRoute({ schemas: {
      body: ResubmitVerificationRequestSchema,
      query: ResubmitVerificationQuerySchema,
      params: ResubmitVerificationParamsSchema
}, handler: resubmitVerification })
);

usersRouter.post(
  '/worker-profile/portfolio',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: CreatePortfolioRequestSchema,
        query: CreatePortfolioQuerySchema,
        params: CreatePortfolioParamsSchema
    },
    handler: createPortfolio,
  })
);

usersRouter.get('/worker-profile/portfolio', isActive, authorizeApprovedWorker, createRoute({ schemas: {
    body: GetPortfolioRequestSchema,
    query: GetPortfolioQuerySchema,
    params: GetPortfolioParamsSchema
}, handler: getPortfolio }));

usersRouter.put(
  '/worker-profile/portfolio',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: UpdatePortfolioRequestSchema,
        query: UpdatePortfolioQuerySchema,
        params: UpdatePortfolioParamsSchema
    },
    handler: updatePortfolio,
  })
);

usersRouter.post(
  '/worker-profile/portfolio/images',
  isActive,
  authorizeApprovedWorker,
  upload.array('images', 10),
  createRoute({ schemas: {
      body: AddPortfolioImagesRequestSchema,
      query: AddPortfolioImagesQuerySchema,
      params: AddPortfolioImagesParamsSchema
}, handler: addPortfolioImages })
);

usersRouter.delete(
  '/worker-profile/portfolio/images/:imageId',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: DeletePortfolioImageRequestSchema,
        query: DeletePortfolioImageQuerySchema,
        params: DeletePortfolioImageParamsSchema
    },
    handler: deletePortfolioImage,
  })
);

usersRouter.get(
  '/worker-profile/occupied-time-slots',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: GetWorkerOccupiedTimeSlotsRequestSchema,
        query: GetWorkerOccupiedTimeSlotsQuerySchema,
        params: GetWorkerOccupiedTimeSlotsParamsSchema
    },
    handler: getWorkerOccupiedTimeSlots,
  })
);

usersRouter.get('/worker-profile', isActive, authorizeApprovedWorker, createRoute({ schemas: {
    body: GetWorkerProfileRequestSchema,
    query: GetWorkerProfileQuerySchema,
    params: GetWorkerProfileParamsSchema
}, handler: getWorkerProfile }));
usersRouter.get('/worker-profile/orders-count', isActive, authorizeApprovedWorker, createRoute({ schemas: {
    body: GetWorkerOrdersStatisticsRequestSchema,
    query: GetWorkerOrdersStatisticsQuerySchema,
    params: GetWorkerOrdersStatisticsParamsSchema
}, handler: getWorkerOrdersStatistics }));
usersRouter.get('/worker-profile/working-hours', isActive, authorizeApprovedWorker, createRoute({ schemas: {
    body: GetWorkerWorkingHoursRequestSchema,
    query: GetWorkerWorkingHoursQuerySchema,
    params: GetWorkerWorkingHoursParamsSchema
}, handler: getWorkerWorkingHours }));
usersRouter.post(
  '/worker-profile/working-hours',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: AddWorkerDaysWorkingHoursRequestSchema,
        query: AddWorkerDaysWorkingHoursQuerySchema,
        params: AddWorkerDaysWorkingHoursParamsSchema
    },
    handler: addWorkerDaysWorkingHours,
  })
);
usersRouter.delete(
  '/worker-profile/working-hours',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: RemoveWorkerWorkingDaysRequestSchema,
        query: RemoveWorkerWorkingDaysQuerySchema,
        params: RemoveWorkerWorkingDaysParamsSchema
    },
    handler: removeWorkerWorkingDays,
  })
);

usersRouter.put(
  '/worker-profile',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: UpdateWorkerProfileRequestSchema,
        query: UpdateWorkerProfileQuerySchema,
        params: UpdateWorkerProfileParamsSchema
    },
    handler: updateWorkerProfile,
  })
);

usersRouter.get(
  '/worker-profile/work-governments',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: GetWorkerGovernmentsRequestSchema,
        query: GetWorkerGovernmentsQuerySchema,
        params: GetWorkerGovernmentsParamsSchema
    },
    handler: getWorkerGovernments,
  })
);

usersRouter.post(
  '/worker-profile/work-governments',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: AddWorkerGovernmentsRequestSchema,
        query: AddWorkerGovernmentsQuerySchema,
        params: AddWorkerGovernmentsParamsSchema
    },
    handler: addWorkerGovernments,
  })
);

usersRouter.delete(
  '/worker-profile/work-governments',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: DeleteWorkerGovernmentsRequestSchema,
        query: DeleteWorkerGovernmentsQuerySchema,
        params: DeleteWorkerGovernmentsParamsSchema
    },
    handler: deleteWorkerGovernments,
  })
);

usersRouter.get(
  '/worker-profile/specializations/tree',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: GetWorkerSpecializationsTreeRequestSchema,
        query: GetWorkerSpecializationsTreeQuerySchema,
        params: GetWorkerSpecializationsTreeParamsSchema
    },
    handler: getWorkerSpecializationsTree,
  })
);

usersRouter.get(
  '/worker-profile/specializations',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: GetWorkerSpecializationsRequestSchema,
        query: GetWorkerSpecializationsQuerySchema,
        params: GetWorkerSpecializationsParamsSchema
    },
    handler: getWorkerSpecializations,
  })
);

usersRouter.post(
  '/worker-profile/specializations',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: AddWorkerSpecializationsRequestSchema,
        query: AddWorkerSpecializationsQuerySchema,
        params: AddWorkerSpecializationsParamsSchema
    },
    handler: addWorkerSpecializations,
  })
);

usersRouter.delete(
  '/worker-profile/specializations',
  isActive,
  authorizeApprovedWorker,
  createRoute({
    schemas: {
        body: DeleteWorkerSpecializationsRequestSchema,
        query: DeleteWorkerSpecializationsQuerySchema,
        params: DeleteWorkerSpecializationsParamsSchema
    },
    handler: deleteWorkerSpecializations,
  })
);

usersRouter.post(
  '/client-profile',
  isActive,
  unAuthorizeClient,
  parseFormDataJson('clientProfile'),
  createRoute({
    schemas: {
        body: CreateClientProfileRequestSchema,
        query: CreateClientProfileQuerySchema,
        params: CreateClientProfileParamsSchema
    },
    handler: createClientProfile,
  })
);


usersRouter.get('/client-profile', isActive, authorizeClient, createRoute({ schemas: {
    body: GetClientProfileRequestSchema,
    query: GetClientProfileQuerySchema,
    params: GetClientProfileParamsSchema
}, handler: getClientProfile }));

// usersRouter.put(
//   '/client-profile',
//   isActive,
//   authorizeClient,
//   createRoute({
//     schemas: { body: UpdateClientProfileSchema },
//     handler: updateClientProfile,
//   })
// );

export default usersRouter;
