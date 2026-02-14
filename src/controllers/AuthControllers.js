import SuccessResponse from "../Core/responses/SuccessResponse.js";
import {
  RequestOrResendOTPService,
  VerifyOTPService,
} from "../services/AuthService.js";

const RequestOTP = async (req, res, next) => {
  try {
    const { method, phoneNumber } = req.body;

    await RequestOrResendOTPService(phoneNumber, method);
    // constructor(message = "Success", data = null, statusCode = 200)
    SuccessResponse("OTP sent successfully",{ phoneNumber, method }, 200).send(res);
  } catch (err) {
    next(err);
  }
};

const VerifyOTP = async (req, res, next) => {
  try {
    const { phoneNumber, otp, method, deviceFingerprint } = req.body;
    const result = await VerifyOTPService(
      phoneNumber,
      otp,
      method,
      deviceFingerprint,
    );
    SuccessResponse("OTP verified successfully", result, 200).send(res);
  } catch (e) {
    next(e);
  }
};

export { RequestOTP, VerifyOTP };
