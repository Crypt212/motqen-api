
import Service from "./Service.js";
import { generateOTP, hashOTP } from "../utils/OTP.js";
import SendOTPProvider from "../providers/SendOTPProvider.js";
import { otpRepository } from "../state.js";
import environment from "../configs/environment.js";


export default class OTPService extends Service {
    async requestOTP(phoneNumber, method) {
        const expiresAt = new Date(Date.now() + environment.otps.expiresIn * 1000);
        const OTP = generateOTP();
        const hashedOTP = hashOTP(OTP);

        const existingOTP = await otpRepository.getLatest(phoneNumber, method);
        if (!existingOTP)
            await otpRepository.createOTP(phoneNumber, hashedOTP, expiresAt, method);
        else
        await otpRepository.updateOTP(phoneNumber, method, { expiresAt, hashedOTP });

        await SendOTPProvider(method, OTP, phoneNumber);
        // must return better response not only true
        return true;
    };

    async verifyOTP(phoneNumber, method) {
        // maybe i will separate the logic to sub services SoC
        await otpRepository.markAsUsed(phoneNumber, method);
        await otpRepository.deleteByPhoneNumber(phoneNumber, method);
    };

    async getOTPExpireDate(phoneNumber , method) {
        const existingOTP = await otpRepository.getLatest(phoneNumber, method);
        if (!existingOTP) {
            return null;
        }
        const expireDate = existingOTP.expiresAt;

        if (expireDate.getTime() > Date.now()) {
            return expireDate.getTime();
        }
        return null;
    }

    async isValidOTP(phoneNumber, method, otp) {
        // in production -> Invalid or expired OTP only
        const storedOTP = await otpRepository.findByPhoneNumber(phoneNumber, method);


        if (!storedOTP) {
            return {message:"Invalid OTP" , ok:false}
        }
        if (storedOTP.isUsed) {
            return {message:"OTP already used" , ok:false}
        }
        if (storedOTP.expiresAt < new Date()) {
            await otpRepository.deleteOTPByPhoneNumber(phoneNumber, method);
            return {message:"Expired OTP" , ok:false}
        }
        if (storedOTP.attempts >= 5) {
            await otpRepository.deleteOTPByPhoneNumber(phoneNumber, method);
            return {message:"Too many attempts. Please request a new OTP." , ok:false}
        }
        if (otp !== storedOTP.hashedOTP) {
            await otpRepository.updateAttempts(phoneNumber, method);
            return {message:"Invalid OTP" , ok:false}
        }
        return {ok:true , message:"OTP verified successfully" };
    };
}
