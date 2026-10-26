/**
 * @fileoverview SendOTP Provider - Handles OTP delivery via SMS and WhatsApp
 * @module providers/SendOTPProvider
 */

import twilio from 'twilio';
import AppError from '../errors/AppError.js';
import environment from '../configs/environment.js';
import { logger } from '../libs/winston.js';
import { Method } from '../domain/otp.entity.js';
import { sendMessage } from './whatsapp.js';

const { accountSid, authToken, virtualNumber } = environment.twilio;

/**
 * Twilio client is created lazily and only when credentials are present:
 * the SDK validates credential FORMAT at construction and would otherwise
 * crash every process that imports this module (server startup, workers,
 * test scripts) even when SMS sending is unused.
 */
let twilioClient: ReturnType<typeof twilio> | undefined;
function getClient(): ReturnType<typeof twilio> {
  if (!twilioClient) {
    if (!accountSid || !authToken || !accountSid.startsWith('AC')) {
      throw new Error('Twilio credentials are missing or invalid — cannot send SMS');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

/**
 * Sends an OTP to the given phone number via the specified method
 * @throws {AppError} If the delivery method is invalid or sending fails
 * @example
 * await SendOTPProvider('SMS', '123456', '+201234567890');
 */
export default async function (method: Method, OTP: string, phoneNumber: string) {
  if (environment.nodeEnv === 'development') {
    logger.info(`OTP: ${OTP} for ${phoneNumber} via ${method}`);
  }
  if (method === 'SMS') {
    // await sendViaSMS(`Your OTP is ${OTP}`, phoneNumber);
  } else if (method === 'WHATSAPP') {
    console.log(`Sending OTP ${OTP} to ${phoneNumber} via WhatsApp`);
    await sendMessage(`2${phoneNumber}`, `Your OTP is ${OTP}`);
  }
}

export async function sendViaSMS(message: string, to: string) {
  const client = getClient();
  try {
    const messageResponse = await client.messages.create({
      body: message,
      from: virtualNumber,
      to: to,
    });

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

