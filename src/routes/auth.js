/**
 * @fileoverview Auth Routes - Authentication endpoints
 * @module routes/auth
 */

import { Router } from "express";
import { requestOTP, verifyOTP, register, login, logout, generateAccessToken } from "../controllers/AuthControllers.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  validateRequestOTP,
  validateVerifyOTP,
  validateRegister,
  validateLogin,
  validateGenerateAccessToken,
} from "../validators/auth.js";

const authRouter = Router();

authRouter.post("/otp/request", validateRequestOTP, validateRequest, requestOTP);
authRouter.post("/otp/verify", validateVerifyOTP, validateRequest, verifyOTP);
authRouter.post("/register", validateRegister, validateRequest, register);
authRouter.post("/login", validateLogin, validateRequest, login);
authRouter.post("/logout", logout);
authRouter.post("/access", validateGenerateAccessToken, validateRequest, generateAccessToken);

export default authRouter;
