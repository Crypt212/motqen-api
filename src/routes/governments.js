/**
 * @fileoverview Government Routes - Government management endpoints
 * @module routes/governments
 */

import { Router } from "express";
import {
  getGovernments,
  getGovernmentById,
  createGovernment,
  updateGovernment,
  deleteGovernment,
} from "../controllers/GovernmentController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { body, param } from "express-validator";

const governmentRouter = Router();

// Public endpoints
governmentRouter.get(
  "/",
  getGovernments
);

governmentRouter.get(
  "/:id",
  param("id")
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage("Invalid government ID format"),
  validateRequest,
  getGovernmentById
);

// Admin endpoints
governmentRouter.post(
  "/",
  authenticate,
  authorizeAdmin,
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  validateRequest,
  createGovernment
);

governmentRouter.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  param("id")
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage("Invalid government ID format"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  validateRequest,
  updateGovernment
);

governmentRouter.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  param("id")
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage("Invalid government ID format"),
  validateRequest,
  deleteGovernment
);

export default governmentRouter;
