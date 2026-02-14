import { Router } from "express";
import { RequestOTP, VerifyOTP } from "../controllers/AuthControllers.js";

const router = Router();

router.post("/otp/request", RequestOTP);
router.post("/otp/verify", VerifyOTP);
router.post("/otp/resend", RequestOTP);

export default router;