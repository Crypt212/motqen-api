import { Router } from "express";
import { updateBasicInfo, updateWorkerInfo, getMe } from "../controllers/UserControllers.js";

const router = Router();

router.post("/basic-info", updateBasicInfo);
router.post("/worker-info", updateWorkerInfo);
router.get("/me", getMe);

export default router;
