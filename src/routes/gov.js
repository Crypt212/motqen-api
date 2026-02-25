/**
 * @fileoverview Governments Routes - Endpoints for managing governments and cities
 * @module routes/governments
 */

import { Router } from 'express';
import {
    getAllGovernments,
    getGovernmentById,
    getCitiesByGovernment,
} from '../controllers/GovControllers.js';

import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';


const govRouter = Router();


govRouter.get(
    '/',
    authenticate,
    validateRequest,
    getAllGovernments
);

govRouter.get(
    '/:id',
    authenticate,
    validateRequest,
    getGovernmentById
);

govRouter.get(
    '/:governmentId/cities',
    authenticate,
    validateRequest,
    getCitiesByGovernment
);

export default govRouter;