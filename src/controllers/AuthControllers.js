/**
 * @fileoverview Auth Controllers - Handle authentication-related HTTP requests
 * @module controllers/AuthControllers
 */

import AppError from "../errors/AppError.js";
import SuccessResponse from "../responses/successResponse.js";
import { otpService, sessionService, userService } from "../state.js";
import { hashOTP } from "../utils/OTP.js";
import { generateToken, verifyAndDecodeToken } from "../utils/tokens.js";
import { asyncUnAuthenticatedHandler, asyncAuthenticatedHandler } from '../types/asyncHandler.js';

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
const getClientIp = (req) => {
  return req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
};

/**
 * Request OTP for phone number verification
 * @async
 * @function requestOTP
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Initiates OTP request by generating and sending OTP to the provided phone number
 */
export const requestOTP = asyncUnAuthenticatedHandler(async (req, res) => {
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
});

/**
 * Verify OTP and return login or register token
 * @async
 * @function verifyOTP
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Verifies the OTP and returns either a login or register token based on user existence
 */
export const verifyOTP = asyncUnAuthenticatedHandler(async (req, res) => {
  const { phoneNumber, otp, method } = req.body;

  const hashedOTP = hashOTP(otp);

  {
    const result = await otpService.isValidOTP(phoneNumber, method, hashedOTP);
    if (!result.ok) {
      throw new AppError(result.message, 400);
    }
  }


  await otpService.verifyOTP(phoneNumber, method);
  const user = await userService.getUser(phoneNumber);

  let token = "";
  let tokenType = "";
  if (user) {
    /** @type import("../types/tokens.js").LoginTokenPayload */
    const payload = { type: "login", phoneNumber, role: user.role };
    tokenType = "login";
    token = generateToken(payload);
  }
  else {
    /** @type import("../types/tokens.js").RegisterTokenPayload */
    const payload = { type: "register", phoneNumber };
    tokenType = "register";
    token = generateToken(payload);
  }

  new SuccessResponse("OTP verified successfully", { phoneNumber, tokenType, token }, 200).send(res);
});

/**
 * Register a new user account
 * @async
 * @function register
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Creates a new user account with the provided registration token and user details
 */
export const register = asyncUnAuthenticatedHandler(async (req, res) => {
  const { registerToken, firstName, lastName, government, city, bio } = req.body;
  const { phoneNumber } = verifyAndDecodeToken(registerToken, "register");

  /** @type {import('../types/role.js').Role} */
  const role = "CLIENT";
  const user = await userService.createUser({ phoneNumber, role, firstName, lastName, government, city, bio });

  new SuccessResponse("User created successfully", { user }, 200).send(res);
});

/**
 * Login an existing user and create session
 * @async
 * @function login
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Authenticates user with login token and creates a new session
 */
export const login = asyncUnAuthenticatedHandler(async (req, res) => {
  const { loginToken, deviceFingerprint } = req.body;
  const payload = verifyAndDecodeToken(loginToken, "login");

  const user = await userService.getUser(payload.phoneNumber);

  if (!user)
    throw new AppError("User not found", 404);



  const { unHashedRefreshToken } = await sessionService.create({
    userId: user.id,
    deviceFingerprint,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toString(),
    role: user.role,
    ipAddress: getClientIp(req),
    userAgent: req.headers["user-agent"],
  });

  new SuccessResponse("login successfully", { user, refreshToken: unHashedRefreshToken }, 200).send(res);
});

/**
 * Logout user and revoke session
 * @async
 * @function logout
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Revokes the user's session based on device fingerprint
 */
export const logout = asyncAuthenticatedHandler(async (req, res) => {
  const fingerprint = String(req.headers["x-device-fingerprint"]);
  await sessionService.revokeByUserIDAndFingerprint(req.user.id, fingerprint);
  new SuccessResponse("Logged out successfully", null, 200).send(res);

});

/**
 * Generate new access token using refresh token
 * @async
 * @function generateAccessToken
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 * @description Validates refresh token and generates a new access token
 */
export const generateAccessToken = asyncUnAuthenticatedHandler(async (req, res) => {
  const deviceFingerprint = String(req.headers["x-device-fingerprint"]);
  const refreshToken = req.headers["authorization"]?.split(" ")[1];

  const { role, userId } = verifyAndDecodeToken(refreshToken, "refresh");
  const accessToken = await sessionService.generateAccessToken({
    deviceFingerprint,
    userId,
    role,
    refreshToken
  });
  new SuccessResponse("Access token generated successfully", { accessToken }, 200).send(res);

});
