import { Router } from "express";
import { requestOTP, verifyOTP, register, login, logout, generateAccessToken } from "../controllers/AuthControllers.js";

const authRouter = Router();

authRouter.post("/otp/request", requestOTP);
authRouter.post("/otp/verify", verifyOTP);
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/access", generateAccessToken);

export default authRouter;
