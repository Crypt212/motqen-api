/**
 * @fileoverview User Routes - User management endpoints
 * @module routes/users
 */

import { Router } from "express";
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
  addWorkerSpecializations,
  deleteWorkerSpecializations,


  getClientProfile,
  createClientProfile,
  updateClientProfile,
  deleteClientProfile,

} from "../controllers/DashboardController.js";
import { authorizeWorker, unAuthorizeWorker } from "../middlewares/workerMiddleware.js";
import { authorizeClient, unAuthorizeClient } from "../middlewares/clientMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import upload from "../configs/multer.js";

// Import validators
import {
  validateGetUser,
  validateUpdateUser,

  validateCreateWorkerProfile,
  validateUpdateWorkerProfile,
  validateGetWorkerProfile,
  validateDeleteWorkerProfile,

  validateGetWorkerGovernments,
  validateAddWorkerGovernments,
  validateDeleteWorkerGovernments,

  validateGetWorkerSpecializations,
  validateAddWorkerSpecializations,
  validateDeleteWorkerSpecializations,

  validateGetClientProfile,
  validateCreateClientProfile,
  validateUpdateClientProfile,
  validateDeleteClientProfile,

} from "../validators/dashboard.js";
import { isActive } from "../middlewares/authMiddleware.js";

const usersRouter = Router();

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current user
 *     description: Returns the authenticated user's profile information.
 *     tags: [Dashboards]
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
usersRouter.get("/",
  isActive,
  validateGetUser,
  validateRequest,
  getUser);

/**
 * @swagger
 * /me:
 *   put:
 *     summary: Update current user
 *     description: Updates the authenticated user's basic info. All fields are optional.
 *     tags: [Dashboards]
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
usersRouter.put("/",
  isActive,
  validateUpdateUser,
  validateRequest,
  updateUser);

/**
 * @swagger
 * /me/worker-profile:
 *   post:
 *     summary: Create worker profile
 *     description: |
 *       Creates a worker profile for the authenticated user (who must not already be a worker).
 *       Send as multipart/form-data with three required image files.
 *     tags: [Dashboards]
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
 *                         clientProfile:
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
usersRouter.post("/worker-profile",
  isActive,
  unAuthorizeWorker,
  upload.fields([
    { name: "personal_image", maxCount: 1 },
    { name: "id_image", maxCount: 1 },
    { name: "personal_with_id_image", maxCount: 1 }
  ]),
  validateCreateWorkerProfile,
  validateRequest,
  createWorkerProfile);

/**
 * @swagger
 * /me/worker-profile:
 *   get:
 *     summary: Get worker profile
 *     description: Returns the authenticated worker's profile. User must have a worker profile.
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DeviceFingerprint'
 *     responses:
 *       200:
 *         description: Worker profile retrieved
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
usersRouter.get("/worker-profile",
  isActive,
  authorizeWorker,
  validateGetWorkerProfile,
  validateRequest,
  getWorkerProfile);

/**
 * @swagger
 * /me/worker-profile:
 *   put:
 *     summary: Update worker profile
 *     description: Updates the authenticated worker's profile. All fields are optional.
 *     tags: [Dashboards]
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
usersRouter.put("/worker-profile",
  isActive,
  authorizeWorker,
  validateUpdateWorkerProfile,
  validateRequest,
  updateWorkerProfile);

/**
 * @swagger
 * /me/worker-profile:
 *   delete:
 *     summary: Delete worker profile
 *     description: Deletes the authenticated worker's profile. All fields are optional.
 *     tags: [Dashboards]
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
usersRouter.delete("/worker-profile",
  isActive,
  authorizeWorker,
  authorizeClient,
  validateDeleteWorkerProfile,
  validateRequest,
  deleteWorkerProfile);

/**
 * @swagger
 * /me/worker-profile/work-governments:
 *   get:
 *     summary: Get worker governments
 *     description: Returns the list of governments where the authenticated worker operates.
 *     tags: [Dashboards]
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
 *     tags: [Dashboards]
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
 *     tags: [Dashboards]
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

usersRouter.get("/worker-profile/work-governments",
  isActive,
  authorizeWorker,
  validateGetWorkerGovernments,
  validateRequest,
  getWorkerGovernments);

usersRouter.post("/worker-profile/work-governments",
  isActive,
  authorizeWorker,
  validateAddWorkerGovernments,
  validateRequest,
  addWorkerGovernments);

usersRouter.delete("/worker-profile/work-governments",
  isActive,
  authorizeWorker,
  validateDeleteWorkerGovernments,
  validateRequest,
  deleteWorkerGovernments);

/**
 * @swagger
 * /me/worker-profile/specializations:
 *   get:
 *     summary: Get worker specializations
 *     description: Returns the list of specializations for the authenticated worker.
 *     tags: [Dashboards]
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
 *     tags: [Dashboards]
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
 *     tags: [Dashboards]
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

usersRouter.get("/worker-profile/specializations",
  isActive,
  authorizeWorker,
  validateGetWorkerSpecializations,
  validateRequest,
  getWorkerSpecializations);

usersRouter.post("/worker-profile/specializations",
  isActive,
  authorizeWorker,
  validateAddWorkerSpecializations,
  validateRequest,
  addWorkerSpecializations);

usersRouter.delete("/worker-profile/specializations",
  isActive,
  authorizeWorker,
  validateDeleteWorkerSpecializations,
  validateRequest,
  deleteWorkerSpecializations);


/**
 * @swagger
 * /me/client-profile:
 *   post:
 *     summary: Create client profile
 *     description: Creates a client profile for the authenticated user (who must not already be a client).
 *     tags: [Dashboards]
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
usersRouter.post("/client-profile",
  isActive,
  unAuthorizeClient,
  validateCreateClientProfile,
  validateRequest,
  createClientProfile);

/**
 * @swagger
 * /me/client-profile:
 *   get:
 *     summary: Get client profile
 *     description: Returns the authenticated client's profile. User must have a client profile.
 *     tags: [Dashboards]
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
usersRouter.get("/client-profile",
  isActive,
  authorizeClient,
  validateGetClientProfile,
  validateRequest,
  getClientProfile);

/**
 * @swagger
 * /me/client-profile:
 *   put:
 *     summary: Update client profile
 *     description: Updates the authenticated client's profile. All fields are optional.
 *     tags: [Dashboards]
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
usersRouter.put("/client-profile",
  isActive,
  authorizeClient,
  validateUpdateClientProfile,
  validateRequest,
  updateClientProfile);

/**
 * @swagger
 * /me/client-profile:
 *   delete:
 *     summary: Delete client profile
 *     description: Deletes the authenticated client's profile. All fields are optional.
 *     tags: [Dashboards]
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
usersRouter.delete("/client-profile",
  isActive,
  authorizeWorker,
  authorizeClient,
  validateDeleteClientProfile,
  validateRequest,
  deleteClientProfile);

export default usersRouter;
