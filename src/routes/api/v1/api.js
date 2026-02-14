import { Router } from "express";
import authRouter from "../../auth.js";
import usersRouter from "../../users.js";

const apiV1Router = Router();

// Mount routers
apiV1Router.use("/auth", authRouter);
apiV1Router.use("/users", usersRouter);

export default apiV1Router;
