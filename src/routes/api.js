import { Router } from "express";
import authRouter from "./auth";
import usersRouter from "./users";
import { authenticate } from "../middlewares/authMiddleware";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/users", authenticate, usersRouter);

export default mainRouter;
