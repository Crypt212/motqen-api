import OTPService from "./services/OTPService.js";
import SessionService from "./services/SessionService.js";
import UserService from "./services/UserService.js";
import OTPRepository from "./repositories/OTPRepository.js";
import SessionRepository from "./repositories/SessionRepository.js";
import UserRepository from "./repositories/UserRepository.js";

export const otpRepository = new OTPRepository();
export const sessionRepository = new SessionRepository();
export const userRepository = new UserRepository();
export const otpService = new OTPService();
export const userService = new UserService();
export const sessionService = new SessionService();
