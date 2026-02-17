import { Router } from "express";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/users", authenticate, usersRouter);

export default mainRouter;
