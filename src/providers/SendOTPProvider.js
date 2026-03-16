/**
 * @fileoverview SendOTP Provider - Handles OTP delivery via SMS and WhatsApp
 * @module providers/SendOTPProvider
 */

import twilio from "twilio";
import AppError from "../errors/AppError.js";
import environment from "../configs/environment.js";
import { logger } from "../libs/winston.js";

const { accountSid, authToken, virtualNumber } = environment.twilio;

/**
 * Sends an OTP to the given phone number via the specified method
 * @async
 * @function SendOTPProvider
 * @param {string} method - The delivery method ('SMS' or 'WhatsApp')
 * @param {string} OTP - The OTP to send
 * @param {string} phoneNumber - The recipient's phone number
 * @throws {AppError} If the delivery method is invalid or sending fails
 * @example
 * await SendOTPProvider('SMS', '123456', '+201234567890');
 */
export default async function (method, OTP, phoneNumber) {
  console.log(method, OTP, phoneNumber);
  if (method === "SMS") {
   // await sendViaSMS(`Your OTP is ${OTP}`, phoneNumber);
  } else if (method === "WhatsApp") {
    if (environment.nodeEnv === "development") {
      await sendViaWhatApp(`Your OTP is ${OTP}`, phoneNumber);
    } else {
      throw new AppError("this feature is not working yet", 500);
    }
  }
}

const client = twilio(accountSid, authToken);

/**
 * @param {string} message - The message to send
 * @param {string} to - The recipient's phone number
 */
async function sendViaSMS(message, to) {
  try {
    console.log(virtualNumber)
    const messageResponse = await client.messages.create({
      body: message,
      from: virtualNumber,
      to: to,
    });

    logger.info(
      `Sending message: ${messageResponse} to: ${to} from: ${virtualNumber}`,
    );
    return { success: true, messageId: messageResponse.sid };
  } catch (error) {
    console.error("❌ error in sending message ", error.message);
    throw new AppError(error.message, 500);
  }
}

/**
 * @param {string} message - The message to send
 * @param {string} to - The recipient's phone number
 */
async function sendViaWhatApp(message, to) {
  // for send message using whatsapp api
  logger.info(`Sending message: ${message} to: ${to} from: ${virtualNumber}`);
}
