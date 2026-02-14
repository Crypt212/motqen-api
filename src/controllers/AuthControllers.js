import {
  RequestOrResendOTPService,
  VerifyOTPService,
} from "../services/AuthService.js";

const RequestOTP = async (req, res, next) => {
  try {
    const { method, phoneNumber } = req.body;

    await RequestOrResendOTPService(phoneNumber, method);

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const VerifyOTP = async (req, res, next) => {
  try {
    const { phoneNumber, otp, method , deviceFingerprint } = req.body;
    const result = await VerifyOTPService(phoneNumber, otp, method , deviceFingerprint);
    res.status(200).json({
      success: true,
      result: result,
    });
  } catch (e) {
    next(e);
  }
};


export { RequestOTP, VerifyOTP };
