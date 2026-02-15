import SuccessResponse from "../responses/successResponse.js";
import { otpService, sessionService, userService } from "../state.js";
import { generateToken, verifyAndDecodeToken } from "../utils/tokens.js";

export const updateBasicInfo = async (req, res, next) => {
    const { method, phoneNumber } = req.body;

    const waitUntilDate = await otpService.getOTPExpireDate(phoneNumber, method);
    if (waitUntilDate)
        res.status(400).json({
            success: false,
            message: "Please wait until " + waitUntilDate + " to request a new OTP.",
            waitUntilDate
        });

    await otpService.requestOTP(phoneNumber, method);

    new SuccessResponse("OTP sent successfully", { phoneNumber, method }, 200).send(res);
};

export const updateWorkerInfo = async (req, res, next) => {
    const { phoneNumber, otp, method, deviceFingerprint } = req.body;

    {
        const result = await otpService.isValidOTP(phoneNumber, method, hashedOTP);
        if (!result.ok) {
            throw new AppError(result.message, 400);
        }
    }

    const payload = await otpService.verifyOTP(phoneNumber, otp, method, deviceFingerprint);
    const user = await userService.getUser(phoneNumber);

    let tokenType;
    if (user) tokenType = "login";
    else tokenType = "register";

    token = generateToken(tokenType, payload);

    new SuccessResponse("OTP verified successfully", { phoneNumber, tokenType, token }, 200).send(res);
};

export const getMe = async (req, res, next) => {
    const { registerToken, firstName, lastName, government, city, bio } = req.body;
    const { phoneNumber } = verifyAndDecodeToken("register", registerToken);

    const user = await userService.createUser({ phoneNumber, role, firstName, lastName, government, city, bio });

    const { unHashedRefreshToken } = await sessionService.create({
        userId: user.id,
        deviceFingerprint,
        expiresAt,
        role: user.role,
    });

    new SuccessResponse("User created successfully", user, 200).send(res);
};
