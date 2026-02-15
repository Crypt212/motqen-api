import AppError from "../errors/AppError.js";
import Service from "./Service.js";
import { generateOTP, hashOTP } from "../utils/OTP.js";
import SendOTPProvider from "../providers/SendOTPProvider.js";
import { otpRepository } from "../state.js";

export default class OTPService extends Service {
    async requestOTP(phoneNumber, method) {
        const expiresAt = new Date(Date.now() + expiresIn * 1000);
        const OTP = generateOTP();
        const hashedOTP = hashOTP(OTP);

        if (!existingOTP)
            await otpRepository.createOTP(phoneNumber, hashedOTP, expiresAt, method);
        
        await otpRepository.updateOTP(phoneNumber, method, { expiresAt, hashedOTP });

        await SendOTPProvider(method, OTP, phoneNumber);
        // must return better response not only true
        return true;
    };

    async verifyOTP(phoneNumber, method) {
        // maybe i will separate the logic to sub services SoC
        await markAsUsed(phoneNumber, method);
        await deleteOTPByPhoneNumber(phoneNumber, method);
    };

    async getOTPExpireDate(phoneNumber) {
        const existingOTP = await otpRepository.getLatest(phoneNumber, method);
        if (!existingOTP) {
            return null;
        }
        const expireDate = existingOTP.expiresAt;

        if (expireDate.getTime() < Date.now()) {
            return expireDate.getTime();
        }
        return null;
    }

    async isValidOTP(phoneNumber, method, otp) {
        // in production -> Invalid or expired OTP only
        const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
        const storedOTP = await GetOTPByPhoneNumber(phoneNumber, method);

        let message = null;
        let ok = true;
        if (!storedOTP) {
            message = "Invalid OTP";
            ok = false;
        }
        if (storedOTP.isUsed) {
            message = "OTP already used";
            ok = false;
        }
        if (storedOTP.expiresAt < new Date()) {
            await deleteOTPByPhoneNumber(phoneNumber, method);
            message = "Expired OTP";
            ok = false;
        }
        if (storedOTP.attempts >= 5) {
            await deleteOTPByPhoneNumber(phoneNumber, method);
            message = "Too many attempts. Please request a new OTP.";
            ok = false;
        }
        if (hashedOTP !== storedOTP.hashedOTP) {
            await UpdateOTPAttempts(phoneNumber, method);
            message = "Invalid OTP";
            ok = false;
        }
        return { ok, message };
    };
}
