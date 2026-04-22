/**
 * @fileoverview User Routes - User management endpoints
 * @module routes/users
 */

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

const usersRouter = Router();

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current user
 *     description: Returns the authenticated user's profile information.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: User retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.get('/', isActive, getUser);

/**
 * @swagger
 * /me:
 *   put:
 *     summary: Update current user
 *     description: Updates the authenticated user's basic info. All fields are optional.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.put(
  '/',
  upload.single('personal_image'),
  isActive,
  validateBody(UpdateUserSchema),
  updateUser
);

/**
 * @swagger
 * /me/worker-profile:
 *   post:
 *     summary: Create worker profile
 *     description: |
 *       Creates a worker profile for the authenticated user (who must not already be a worker).
 *       Send as multipart/form-data with three required image files.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkerProfile'
 *     responses:
 *       200:
 *         description: Worker profile created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         workerProfile:
 *                           $ref: '#/components/schemas/WorkerProfile'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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

/**
 * @swagger
 * /me/worker-profile:
 *   get:
 *     summary: Get Craftsman Profile Details
 *     description: |
 *       Returns the complete profile of the authenticated craftsman/worker.
 *       Includes:
 *       - Experience years and team status
 *       - All specializations and sub-specializations
 *       - Operating governments/areas
 *       - Rating and badges
 *       - Verification status
 *       - Portfolio projects
 *       - Availability status for urgent jobs
 *
 *       User must be registered as a **Worker** (craftsman) to access this endpoint.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Worker profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         workerProfile:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             userId:
 *                               type: string
 *                               format: uuid
 *                             experienceYears:
 *                               type: integer
 *                               minimum: 0
 *                               maximum: 50
 *                             isInTeam:
 *                               type: boolean
 *                             acceptsUrgentJobs:
 *                               type: boolean
 *                             isApproved:
 *                               type: boolean
 *                               description: Admin approval status
 *                             bio:
 *                               type: string
 *                               nullable: true
 *                               description: Craftsman biography or description
 *                             specializations:
 *                               type: array
 *                               description: All specializations with sub-specializations
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     format: uuid
 *                                   name:
 *                                     type: string
 *                                     example: "Plumbing"
 *                                   subSpecializations:
 *                                     type: array
 *                                     items:
 *                                       type: object
 *                                       properties:
 *                                         id:
 *                                           type: string
 *                                           format: uuid
 *                                         name:
 *                                           type: string
 *                                           example: "Water Pipe Repairs"
 *                             workGovernments:
 *                               type: array
 *                               description: Operating areas/governments
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     format: uuid
 *                                   name:
 *                                     type: string
 *                                     example: "Cairo"
 *                             verification:
 *                               type: object
 *                               properties:
 *                                 status:
 *                                   type: string
 *                                   enum: [PENDING, APPROVED, REJECTED]
 *                                 idDocumentUrl:
 *                                   type: string
 *                                 idWithPersonalImageUrl:
 *                                   type: string
 *                             badges:
 *                               type: array
 *                               items:
 *                                 type: string
 *                                 enum: [VERIFIED, TOP_RATED, TRUSTED]
 *                             portfolio:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   description:
 *                                     type: string
 *                                   images:
 *                                     type: array
 *                                     items:
 *                                       type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.get('/worker-profile', isActive, authorizeWorker, getWorkerProfile);
usersRouter.get('/worker-profile/working-hours', isActive, authorizeWorker, getWorkerWorkingHours);
usersRouter.post(
  '/worker-profile/working-hours',
  isActive,
  authorizeWorker,
  validateBody(SetWorkingHoursSchema),
  setWorkerWorkingHours
);

/**
 * @swagger
 * /me/worker-profile:
 *   put:
 *     summary: Update worker profile
 *     description: Updates the authenticated worker's profile. All fields are optional.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkerProfile'
 *     responses:
 *       200:
 *         description: Worker profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.put(
  '/worker-profile',
  isActive,
  authorizeWorker,
  validateBody(UpdateWorkerProfileSchema),
  updateWorkerProfile
);

/**
 * @swagger
 * /me/worker-profile:
 *   delete:
 *     summary: Delete worker profile
 *     description: Deletes the authenticated worker's profile. All fields are optional.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteWorkerProfile'
 *     responses:
 *       200:
 *         description: Worker profile deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.delete(
  '/worker-profile',
  isActive,
  authorizeWorker,
  authorizeClient,
  deleteWorkerProfile
);

/**
 * @swagger
 * /me/worker-profile/work-governments:
 *   get:
 *     summary: Get worker governments
 *     description: Returns the list of governments where the authenticated worker operates.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Worker governments retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         workGovernments:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Government'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   post:
 *     summary: Add worker governments
 *     description: Adds governments where the authenticated worker operates.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workerProfile:
 *                 type: object
 *                 properties:
 *                   workGovernmentIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: uuid
 *                     description: Array of government IDs
 *     responses:
 *       200:
 *         description: Worker governments added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     summary: Delete worker governments
 *     description: Removes governments from the authenticated worker's operating regions.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - name: all
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: If true, removes all governments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workerProfile:
 *                 type: object
 *                 properties:
 *                   workGovernmentIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: uuid
 *                     description: Array of government IDs to remove
 *     responses:
 *       200:
 *         description: Worker governments deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

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

/**
 * @swagger
 * /me/worker-profile/specializations:
 *   get:
 *     summary: Get worker specializations
 *     description: Returns the list of specializations for the authenticated worker.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Worker specializations retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         specializations:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Specialization'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   post:
 *     summary: Add worker specializations
 *     description: Adds specializations for the authenticated worker.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specializationTree:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     mainId:
 *                       type: string
 *                       format: uuid
 *                       description: Main specialization ID
 *                     subIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *                       description: Array of sub-specialization IDs
 *     responses:
 *       200:
 *         description: Worker specializations added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     summary: Delete worker specializations
 *     description: Removes specializations from the authenticated worker.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *       - name: all
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: If true, removes all specializations
 *       - name: allSub
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: If true, removes all sub-specializations
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mainSpecializationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of main specialization IDs to remove
 *               specializationTree:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     mainId:
 *                       type: string
 *                       format: uuid
 *                     subIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uuid
 *     responses:
 *       200:
 *         description: Worker specializations deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

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

/**
 * @swagger
 * /me/client-profile:
 *   post:
 *     summary: Create client profile
 *     description: Creates a client profile for the authenticated user (who must not already be a client).
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClientProfile'
 *     responses:
 *       200:
 *         description: Client profile created
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         clientProfile:
 *                           $ref: '#/components/schemas/ClientProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.post(
  '/client-profile',
  isActive,
  unAuthorizeClient,
  validateBody(CreateClientProfileSchema),
  createClientProfile
);

/**
 * @swagger
 * /me/client-profile:
 *   get:
 *     summary: Get client profile
 *     description: Returns the authenticated client's profile. User must have a client profile.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Client profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         clientProfile:
 *                           $ref: '#/components/schemas/ClientProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.get('/client-profile', isActive, authorizeClient, getClientProfile);

/**
 * @swagger
 * /me/client-profile:
 *   put:
 *     summary: Update client profile
 *     description: Updates the authenticated client's profile. All fields are optional.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClientProfile'
 *     responses:
 *       200:
 *         description: Client profile updated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         clientProfile:
 *                           $ref: '#/components/schemas/ClientProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.put(
  '/client-profile',
  isActive,
  authorizeClient,
  validateBody(UpdateClientProfileSchema),
  updateClientProfile
);

/**
 * @swagger
 * /me/client-profile:
 *   delete:
 *     summary: Delete client profile
 *     description: Deletes the authenticated client's profile. All fields are optional.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeleteClientProfile'
 *     responses:
 *       200:
 *         description: Client profile deleted
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         clientProfile:
 *                           $ref: '#/components/schemas/ClientProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.delete(
  '/client-profile',
  isActive,
  authorizeWorker,
  authorizeClient,
  deleteClientProfile
);

export default usersRouter;
