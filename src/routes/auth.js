import { Router } from "express";
import { requestOTP, verifyOTP, register, login, logout, generateAccessToken } from "../controllers/AuthControllers.js";

const router = Router();

router.post("/otp/request", requestOTP);
router.post("/otp/verify", verifyOTP);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/access", generateAccessToken);

export default router;
