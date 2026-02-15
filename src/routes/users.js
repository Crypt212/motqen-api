import { Router } from "express";
import { updateBasicInfo, updateWorkerInfo, getMe } from "../controllers/UserControllers.js";

const router = Router();

router.put("/basic-info", updateBasicInfo);
router.put("/worker-info", updateWorkerInfo);
router.post("/worker-info", updateWorkerInfo);
router.get("/me", getMe);

export default router;
