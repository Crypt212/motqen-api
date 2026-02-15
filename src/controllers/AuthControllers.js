import environment from "../configs/environment.js";
import AppError from "../errors/AppError.js";
import SuccessResponse from "../responses/successResponse.js";
import { otpService, sessionService, userService } from "../state.js";
import { hashOTP } from "../utils/OTP.js";
import { generateToken, verifyAndDecodeToken } from "../utils/tokens.js";

export const requestOTP = async (req, res, next) => {
    const { method, phoneNumber } = req.body;

    const waitUntilDate = await otpService.getOTPExpireDate(phoneNumber, method);
    if (waitUntilDate)
       return res.status(400).json({
            success: false,
            message: "Please wait until " + waitUntilDate + " to request a new OTP.",
            waitUntilDate
        });

    await otpService.requestOTP(phoneNumber, method);

    new SuccessResponse("OTP sent successfully", { phoneNumber, method }, 200).send(res);
};

export const verifyOTP = async (req, res, next) => {
    const { phoneNumber, otp, method, deviceFingerprint } = req.body;

    const hashedOTP = hashOTP(otp)
        const result = await otpService.isValidOTP(phoneNumber, method, hashedOTP);
        if (!result.ok) {
            throw new AppError(result.message, 400);
        }
    

    await otpService.verifyOTP(phoneNumber, method);
    const user = await userService.getUser(phoneNumber);

    let tokenType = "";
    let payload = {} ;
    if (user) {
        tokenType = "login";
        payload = { phoneNumber: user.phoneNumber, id: user.id, role: user.role };
    }
    else {
        tokenType = "register";
        payload = { phoneNumber };
    }

    const token = generateToken(tokenType, payload);

    new SuccessResponse("OTP verified successfully", { phoneNumber, tokenType, token }, 200).send(res);
};

export const register = async (req, res, next) => {
    const { registerToken, firstName, lastName, government, city, bio, deviceFingerprint } = req.body;
    const { phoneNumber } = verifyAndDecodeToken("register", registerToken);
// role is needed
    const role = "CLIENT"
    const user = await userService.createUser({ phoneNumber, role, firstName, lastName, government, city, bio });

    new SuccessResponse("User created successfully", { user }, 200).send(res);
};

export const login = async (req, res, next) => {
    const { loginToken, deviceFingerprint } = req.body;
    const payload = verifyAndDecodeToken("login", loginToken);

    const user = await userService.getUser(payload.phoneNumber);

    if (!user)
        throw new AppError("User not found", 404);



    const { unHashedRefreshToken } = await sessionService.create({
        userId: user.id,
        deviceFingerprint,
        expiresAt:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        role: user.role,
    });

    new SuccessResponse("login successfully", { user , refreshToken:unHashedRefreshToken }, 200).send(res);
}

export const logout = async (req, res, next) => {

    const fingerprint = req.headers["x-device-fingerprint"];

    await sessionService.revokeByUserIDAndFingerprint(req.user.id, fingerprint);

    new SuccessResponse("Logged out successfully", null, 200).send(res);

}

export const generateAccessToken = async (req, res, next) => {
    const fingerprint = req.headers["x-device-fingerprint"];
    const refreshToken = req.headers["authorization"]?.split(" ")[1];
    const user = req.user;
    const accessToken =await sessionService.generateAccessToken({ refreshToken, deviceFingerprint: fingerprint , userId: user.id, role: user.role });

    new SuccessResponse("Access token generated successfully", { accessToken }, 200).send(res);

}
	