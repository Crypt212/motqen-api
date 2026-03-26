/**
 * @fileoverview SendOTP Provider - Handles OTP delivery via SMS and WhatsApp
 * @module providers/SendOTPProvider
 */

import twilio from 'twilio';
import AppError from '../errors/AppError.js';
import environment from '../configs/environment.js';
import { logger } from '../libs/winston.js';
import { Method } from '../domain/otp.entity.js';

const { accountSid, authToken, virtualNumber } = environment.twilio;

/**
 * Sends an OTP to the given phone number via the specified method
 * @throws {AppError} If the delivery method is invalid or sending fails
 * @example
 * await SendOTPProvider('SMS', '123456', '+201234567890');
 */
export default async function (method: Method, OTP: string, phoneNumber: string) {
  console.log(method, OTP, phoneNumber);
  if (method === 'SMS') {
    // await sendViaSMS(`Your OTP is ${OTP}`, phoneNumber);
  } else if (method === 'WHATSAPP') {
    if (environment.nodeEnv === 'development') {
      await sendViaWhatApp(`Your OTP is ${OTP}`, phoneNumber);
    } else {
      throw new AppError('this feature is not working yet', 500);
    }
  }
}

const client = twilio(accountSid, authToken);

export async function sendViaSMS(message: string, to: string) {
  try {
    const messageResponse = await client.messages.create({
      body: message,
      from: virtualNumber,
      to: to,
    });

    logger.info(`Sending message: ${messageResponse} to: ${to} from: ${virtualNumber}`);
    return { success: true, messageId: messageResponse.sid };
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(error.message, 500);
    } else if (error instanceof AppError) {
      throw error;
    }
    throw error;
  }
}

export async function sendViaWhatApp(message: string, to: string) {
  // for send message using whatsapp api
  logger.info(`Sending message: ${message} to: ${to} from: ${virtualNumber}`);
}
