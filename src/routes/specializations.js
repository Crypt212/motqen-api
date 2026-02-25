/**
 * @fileoverview Specialization Routes - Specialization management endpoints
 * @module routes/specializations
 */

import { Router } from "express";
import {
  getSpecializations,
  getSpecializationById,
  getSubSpecializations,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
  createSubSpecialization,
  deleteSubSpecialization,
} from "../controllers/SpecializationController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { body, param } from "express-validator";

const specializationRouter = Router();

// Public endpoints
specializationRouter.get(
  "/",
  getSpecializations
);

specializationRouter.get(
  "/:id",
  param("id")
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage("Invalid specialization ID format"),
  validateRequest,
  getSpecializationById
);

specializationRouter.get(
  "/:id/sub-specializations",
  param("id")
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage("Invalid specialization ID format"),
  validateRequest,
  getSubSpecializations
);

// Admin endpoints
specializationRouter.post(
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
  createSpecialization
);

specializationRouter.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  param("id")
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage("Invalid specialization ID format"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  validateRequest,
  updateSpecialization
);

specializationRouter.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  param("id")
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage("Invalid specialization ID format"),
  validateRequest,
  deleteSpecialization
);

// Sub-specialization admin endpoints
specializationRouter.post(
  "/:id/sub-specializations",
  authenticate,
  authorizeAdmin,
  param("id")
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage("Invalid specialization ID format"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  validateRequest,
  createSubSpecialization
);

specializationRouter.delete(
  "/:id/sub-specializations/:subId",
  authenticate,
  authorizeAdmin,
  param("id")
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage("Invalid specialization ID format"),
  param("subId")
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage("Invalid sub-specialization ID format"),
  validateRequest,
  deleteSubSpecialization
);

export default specializationRouter;
