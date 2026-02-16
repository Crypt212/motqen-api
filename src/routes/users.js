import { Router } from "express";
import { updateBasicInfo, updateWorkerInfo, getMe } from "../controllers/UserControllers.js";

const usersRouter = Router();

usersRouter.put("/basic-info", updateBasicInfo);
usersRouter.put("/worker-info", updateWorkerInfo);
usersRouter.post("/worker-info", updateWorkerInfo);
usersRouter.get("/me", getMe);

export default usersRouter;
