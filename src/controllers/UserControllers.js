import SuccessResponse from "../responses/successResponse.js";
import { otpService, sessionService, userService } from "../state.js";
import { generateToken, verifyAndDecodeToken } from "../utils/tokens.js";

export const updateBasicInfo = async (req, res, next) => {
    const { phoneNumber, role, firstName, lastName, government, city, bio } = req.body;

    const existingUser = await userService.updateBasicInfo(phoneNumber, { role, firstName, lastName, government, city, bio });

    new SuccessResponse("updated user successfully",{}, 200).send(res);
};

export const updateWorkerInfo = async (req, res, next) => {
    const { phoneNumber, experienceYears, isInTeam, acceptsUrgentJobs, primarySpecialization, secondarySpecializations, governments } = req.body;

    const existingUser = await userService.updateInfo(phoneNumber, { role, firstName, lastName, government, city, bio });

    new SuccessResponse("updated worker profile successfully", { phoneNumber, tokenType, token }, 200).send(res);
};

export const getMe = async (req, res, next) => {
    const { registerToken, firstName, lastName, government, city, bio } = req.body;
    const deviceFingerprint= null 
    const expiresAt = null
    const { phoneNumber } = verifyAndDecodeToken("register", registerToken);
const role = null;
    const user = await userService.createUser({ phoneNumber, role, firstName, lastName, government, city, bio });

    const { unHashedRefreshToken } = await sessionService.create({
        userId: user.id,
        deviceFingerprint,
        expiresAt,
        role: user.role,
    });

    new SuccessResponse("User created successfully", user, 200).send(res);
};
