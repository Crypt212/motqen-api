/**
 * @fileoverview Explore Routes - Explore/search endpoints for customers
 * @module routes/v1/explore
 */

import { Router } from "express";
import { getWorkerById, searchWorkers } from "../../controllers/ExploreController.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { validateExploreSearch, validateExploreWorkerId } from "../../validators/explore.js";

const exploreRouter = Router();

exploreRouter.get("/", validateExploreSearch, validateRequest, searchWorkers);
exploreRouter.get("/:id", validateExploreWorkerId, validateRequest, getWorkerById);

export default exploreRouter;
